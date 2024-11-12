import { Decode, Encode } from '@sinclair/typebox/value';
import { describe, expect, it } from 'bun:test';
import { asArray, asNumber } from '../../src';

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
