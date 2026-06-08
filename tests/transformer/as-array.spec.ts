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
