import { Decode, Encode } from '@sinclair/typebox/value';
import { describe, expect, it } from 'bun:test';
import { asBoolean } from '../../src';

describe('default', () => {
	it('should throw if empty', () => {
		expect(() => Decode(asBoolean(), '')).toThrow(
			'Unable to decode value as it does not match the expected schema',
		);
	});

	it.each(['1', 'true', 'TRUE'])('should decode %p as true', (value) => {
		const output = Decode(asBoolean(), value);
		expect(output).toBeTrue();
	});

	it.each(['0', 'false', 'FALSE'])('should decode %p as false', (value) => {
		const output = Decode(asBoolean(), value);
		expect(output).toBeFalse();
	});

	it.each(['2', 'what'])('should throw when decode %p', (value) => {
		expect(() => Decode(asBoolean(), value)).toThrow('Expected boolean');
	});

	it.each([
		[true, 'true'],
		[false, 'false'],
	])('should encode %p as %p', (bool, str) => {
		const output = Encode(asBoolean(), bool);
		expect(output).toBe(str);
	});

	it.each([null, undefined, 'what'])(
		'should throw if try to encode %p',
		(value) => {
			expect(() => Encode(asBoolean(), value)).toThrow('Expected boolean');
		},
	);
});

describe('optional', () => {
	it('should decode empty string as undefined', () => {
		const output = Decode(asBoolean().optional(), '');
		expect(output).toBeUndefined();
	});

	it('should decode empty string as a fallback if given', () => {
		const defaultValue = false;
		const output = Decode(asBoolean().optional(defaultValue), '');
		expect(output).toBe(defaultValue);
	});

	it('should decode correctly like non-optional', () => {
		const output = Decode(asBoolean().optional(), 'False');
		expect(output).toBeFalse();
	});

	it('should encode correctly like non-optional', () => {
		const output = Encode(asBoolean().optional(), false);
		expect(output).toBe('false');
	});

	it('should encode undefined as an empty string', () => {
		const output = Encode(asBoolean().optional(), undefined);
		expect(output).toBe('');
	});

	it('should throw if try to encode non-boolean value', () => {
		expect(() => Encode(asBoolean(), 'what')).toThrow('Expected boolean');
	});
});
