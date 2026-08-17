import { Decode, Encode } from '@sinclair/typebox/value';
import { describe, expect, it } from 'bun:test';
import { asArray, asNumber, asString } from '../../src';

describe('default', () => {
	it('should throw if empty', () => {
		expect(() => Decode(asArray(asNumber()), '')).toThrow(
			'Unable to decode value as it does not match the expected schema',
		);
	});

	it('should decode by splitting into an array', () => {
		const output = Decode(asArray(asNumber()), '1,2,3');
		expect(output).toStrictEqual([1, 2, 3]);
	});

	it('should encode into a joined string', () => {
		const output = Encode(asArray(asNumber()), [1, 2, 3]);
		expect(output).toStrictEqual('1,2,3');
	});

	it.each([null, undefined])('should throw if try to encode %p', (value) => {
		expect(() => Encode(asArray(asNumber()), value)).toThrow('Expected array');
	});

	it('should support custom saperator', () => {
		const schema = asArray(asNumber(), '|');
		const input = '1|2|3';
		const decoded = Decode(schema, input);

		expect(decoded).toStrictEqual([1, 2, 3]);

		const encoded = Encode(schema, decoded);

		expect(encoded).toBe(input);
	});

	it('should split items that contain the separator when wrapped in quotes', () => {
		const schema = asArray(asString());
		const input = 'a,"b, c",d';
		const decoded = Decode(schema, input);

		expect(decoded).toStrictEqual(['a', 'b, c', 'd']);

		const encoded = Encode(schema, decoded);

		expect(encoded).toBe('a,"b, c",d');
	});

	it('should tolerate whitespace between the separator and the opening quote', () => {
		const schema = asArray(asString());
		const decoded = Decode(schema, 'a, "b, c", d');

		expect(decoded).toStrictEqual(['a', 'b, c', 'd']);
	});

	it('should tolerate leading whitespace before the first quoted field', () => {
		const schema = asArray(asString());
		const decoded = Decode(schema, '   "a", b');

		expect(decoded).toStrictEqual(['a', 'b']);
	});

	it('should round-trip items containing the separator', () => {
		const schema = asArray(asString(), '|');
		const decoded = Decode(schema, 'one|"two|three"|four');

		expect(decoded).toStrictEqual(['one', 'two|three', 'four']);

		const encoded = Encode(schema, decoded);

		expect(encoded).toBe('one|"two|three"|four');
	});

	it.each(['\n', '\r\n'])('should support %j as a separator', (separator) => {
		const schema = asArray(asString(), separator);
		const input = ['a', 'b', 'c'].join(separator);
		const decoded = Decode(schema, input);

		expect(decoded).toStrictEqual(['a', 'b', 'c']);

		const encoded = Encode(schema, decoded);

		expect(encoded).toBe(input);
	});

	it('should treat a newline inside an item as an ordinary character', () => {
		const schema = asArray(asString());

		expect(Decode(schema, 'a,b\nc,d')).toStrictEqual(['a', 'b\nc', 'd']);
		expect(Decode(schema, 'a,"b\nc",d')).toStrictEqual(['a', 'b\nc', 'd']);
		expect(Encode(schema, ['a', 'b\nc', 'd'])).toBe('a,b\nc,d');
	});

	it('should round-trip a newline-separated item containing the separator', () => {
		const schema = asArray(asString(), '\n');
		const input = 'a\n"b\nc"\nd';
		const decoded = Decode(schema, input);

		expect(decoded).toStrictEqual(['a', 'b\nc', 'd']);

		const encoded = Encode(schema, decoded);

		expect(encoded).toBe(input);
	});

	it('should support a multi-character separator', () => {
		const schema = asArray(asString(), '::');
		const input = 'a::"b::c"::d';
		const decoded = Decode(schema, input);

		expect(decoded).toStrictEqual(['a', 'b::c', 'd']);

		const encoded = Encode(schema, decoded);

		expect(encoded).toBe(input);
	});

	it('should round-trip an item containing a double quote', () => {
		const schema = asArray(asString());
		const input = 'a,"b""c",d';
		const decoded = Decode(schema, input);

		expect(decoded).toStrictEqual(['a', 'b"c', 'd']);

		const encoded = Encode(schema, decoded);

		expect(encoded).toBe(input);
	});

	it.each([
		['::', ['a:', 'b']],
		['::', [':b', 'a']],
		['aa', ['a', 'a']],
	])(
		'should round-trip items that straddle the %j separator',
		(separator, items) => {
			const schema = asArray(asString(), separator);

			expect(Decode(schema, Encode(schema, items))).toStrictEqual(items);
		},
	);

	it.each([' ', '\t'])(
		'should support %j as a separator with quoted items',
		(separator) => {
			const schema = asArray(asString(), separator);
			const input = ['a', `"b${separator}c"`, 'd'].join(separator);

			expect(Decode(schema, input)).toStrictEqual(['a', `b${separator}c`, 'd']);
		},
	);

	it('should throw if a closing quote is followed by anything but whitespace', () => {
		expect(() => Decode(asArray(asString()), 'x,"a"y,b')).toThrow(
			'Unexpected "y" after a closing quote at position 5',
		);
	});

	it('should tolerate whitespace between the closing quote and the separator', () => {
		expect(Decode(asArray(asString()), 'a, "b, c" , d')).toStrictEqual([
			'a',
			'b, c',
			'd',
		]);
	});

	it('should decode an unterminated quote up to the end of the input', () => {
		expect(Decode(asArray(asString()), 'a,"b,c')).toStrictEqual(['a', 'b,c']);
	});

	it('should trim items even when they are quoted', () => {
		expect(Decode(asArray(asString()), '"  a  ",b')).toStrictEqual(['a', 'b']);
	});

	it('should throw if separator is an empty string', () => {
		expect(() => asArray(asString(), '')).toThrow(
			'asArray separator must not be an empty string',
		);
	});
});

describe('optional', () => {
	it('should decode empty string as undefined', () => {
		const output = Decode(asArray(asNumber()).optional(), '');
		expect(output).toBeUndefined();
	});

	it('should decode empty string as a fallback if given', () => {
		const defaultValue = [];
		const output = Decode(asArray(asNumber()).optional(defaultValue), '');
		expect(output).toStrictEqual(defaultValue);
	});

	it('should decode correctly like non-optional', () => {
		const output = Decode(asArray(asNumber()).optional(), '1,2,3');
		expect(output).toStrictEqual([1, 2, 3]);
	});

	it('should encode correctly like non-optional', () => {
		const output = Encode(asArray(asNumber()).optional(), [1, 2, 3]);
		expect(output).toStrictEqual('1,2,3');
	});

	it('should encode undefined as an empty string', () => {
		const output = Encode(asArray(asNumber()).optional(), undefined);
		expect(output).toStrictEqual('');
	});
});
