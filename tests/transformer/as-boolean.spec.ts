import { Value } from '@sinclair/typebox/value';
import { describe, expect, it } from 'bun:test';
import { asBoolean } from '../../src';

describe('default', () => {
	it('should throw if empty', () => {
		expect(() => Value.Decode(asBoolean(), '')).toThrow(
			'Unable to decode value as it does not match the expected schema',
		);
	});

	it.each(['1', 'true', 'TRUE'])('should decode %p as true', (value) => {
		const output = Value.Decode(asBoolean(), value);
		expect(output).toBeTrue();
	});

	it.each(['0', 'false', 'FALSE'])('should decode %p as false', (value) => {
		const output = Value.Decode(asBoolean(), value);
		expect(output).toBeFalse();
	});

	it.each(['2', 'what'])('should throw when decode %p', (value) => {
		expect(() => Value.Decode(asBoolean(), value)).toThrow('Expected boolean');
	});

	it.each([
		[true, 'true'],
		[false, 'false'],
	])('should encode %p as %p', (bool, str) => {
		const output = Value.Encode(asBoolean(), bool);
		expect(output).toBe(str);
	});
});

describe('optional', () => {
	it('should decode empty string as undefined', () => {
		const output = Value.Decode(asBoolean().optional(), '');
		expect(output).toBeUndefined();
	});

	it('should decode empty string as a fallback if given', () => {
		const defaultValue = false;
		const output = Value.Decode(asBoolean().optional(defaultValue), '');
		expect(output).toBe(defaultValue);
	});

	it('should decode correctly like non-optional', () => {
		const output = Value.Decode(asBoolean().optional(), 'False');
		expect(output).toBeFalse();
	});
});
