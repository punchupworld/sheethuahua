import { Decode, Encode } from '@sinclair/typebox/value';
import { describe, expect, it } from 'bun:test';
import { asNumber } from '../../src';

describe('default', () => {
	it('should throw if empty', () => {
		expect(() => Decode(asNumber(), '')).toThrow(
			'Unable to decode value as it does not match the expected schema',
		);
	});

	it('should decode string of number as a number', () => {
		const output = Decode(asNumber(), '2.5');
		expect(output).toBe(2.5);
	});

	it('should throw when decode string of not a number', () => {
		expect(() => Decode(asNumber(), 'hi')).toThrow('Expected number');
	});

	it('should encode number as a string of number', () => {
		const output = Encode(asNumber(), 2.5);
		expect(output).toBe('2.5');
	});

	it.each([null, undefined, 'what'])(
		'should throw if try to encode %p',
		(value) => {
			expect(() => Encode(asNumber(), value)).toThrow('Expected number');
		},
	);
});

describe('optional', () => {
	it('should decode empty string as undefined', () => {
		const output = Decode(asNumber().optional(), '');
		expect(output).toBeUndefined();
	});

	it('should decode empty string as a fallback if given', () => {
		const defaultValue = 0;
		const output = Decode(asNumber().optional(defaultValue), '');
		expect(output).toBe(defaultValue);
	});

	it('should decode correctly like non-optional', () => {
		const output = Decode(asNumber().optional(), '2.5');
		expect(output).toBe(2.5);
	});

	it('should encode correctly like non-optional', () => {
		const output = Encode(asNumber().optional(), 2.5);
		expect(output).toBe('2.5');
	});

	it('should encode undefined as an empty string', () => {
		const output = Encode(asNumber().optional(), undefined);
		expect(output).toBe('');
	});

	it('should throw if try to encode non-number value', () => {
		expect(() => Encode(asNumber(), 'what')).toThrow('Expected number');
	});
});
