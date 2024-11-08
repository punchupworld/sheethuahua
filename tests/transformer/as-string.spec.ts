import { Decode, Encode } from '@sinclair/typebox/value';
import { describe, expect, it } from 'bun:test';
import { asString } from '../../src';

describe('default', () => {
	it('should throw if empty', () => {
		expect(() => Decode(asString(), '')).toThrow(
			'Unable to decode value as it does not match the expected schema',
		);
	});

	it('should decode exactly the same as input', () => {
		const output = Decode(asString(), 'a');
		expect(output).toBe('a');
	});

	it('should encode exactly the same as input', () => {
		const output = Encode(asString(), 'a');
		expect(output).toBe('a');
	});

	it.each([null, undefined])('should throw if try to encode %p', (value) => {
		expect(() => Encode(asString(), value)).toThrow('Expected string');
	});
});

describe('optional', () => {
	it('should decode empty string as undefined', () => {
		const output = Decode(asString().optional(), '');
		expect(output).toBeUndefined();
	});

	it('should decode empty string as a fallback if given', () => {
		const defaultValue = '-';
		const output = Decode(asString().optional(defaultValue), '');
		expect(output).toBe(defaultValue);
	});

	it('should decode correctly like non-optional', () => {
		const output = Decode(asString().optional(), 'a');
		expect(output).toBe('a');
	});

	it('should encode correctly like non-optional', () => {
		const output = Encode(asString().optional(), 'a');
		expect(output).toBe('a');
	});

	it('should encode undefined as an empty string', () => {
		const output = Encode(asString().optional(), undefined);
		expect(output).toBe('');
	});
});
