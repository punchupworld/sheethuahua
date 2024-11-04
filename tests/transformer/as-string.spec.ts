import { Value } from '@sinclair/typebox/value';
import { describe, expect, it } from 'bun:test';
import { asString } from '../../src';

describe('default', () => {
	it('should throw if empty', () => {
		expect(() => Value.Decode(asString(), '')).toThrow(
			'Unable to decode value as it does not match the expected schema',
		);
	});

	it('should decode exactly the same as input', () => {
		const output = Value.Decode(asString(), 'a');
		expect(output).toBe('a');
	});

	it('should encode exactly the same as input', () => {
		const output = Value.Encode(asString(), 'a');
		expect(output).toBe('a');
	});
});

describe('optional', () => {
	it('should decode empty string as undefined', () => {
		const output = Value.Decode(asString().optional(), '');
		expect(output).toBeUndefined();
	});

	it('should decode empty string as a fallback if given', () => {
		const defaultValue = '-';
		const output = Value.Decode(asString().optional(defaultValue), '');
		expect(output).toBe(defaultValue);
	});

	it('should decode correctly like non-optional', () => {
		const output = Value.Encode(asString().optional(), 'a');
		expect(output).toBe('a');
	});
});
