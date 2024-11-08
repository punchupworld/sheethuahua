import { Decode, Encode } from '@sinclair/typebox/value';
import { describe, expect, it } from 'bun:test';
import { asDate } from '../../src';

describe('default', () => {
	it('should throw if empty', () => {
		expect(() => Decode(asDate(), '')).toThrow(
			'Unable to decode value as it does not match the expected schema',
		);
	});

	it.each(['1996-11-13', new Date().toISOString()])(
		'should decode %s as a valid date object',
		(val) => {
			const output = Decode(asDate(), val);
			expect(output).toBeValidDate();
		},
	);

	it.each(['13/11/1996', 'not date'])(
		'should throw when decode %p',
		(value) => {
			expect(() => Decode(asDate(), value)).toThrow('Expected Date');
		},
	);

	it('should encode date as ISO string', () => {
		const date = new Date();
		const output = Encode(asDate(), date);
		expect(output).toBe(date.toISOString());
	});

	it.each([null, undefined, 'what'])(
		'should throw if try to encode %p',
		(value) => {
			expect(() => Encode(asDate(), value)).toThrow('Expected Date');
		},
	);
});

describe('optional', () => {
	it('should decode empty string as undefined', () => {
		const output = Decode(asDate().optional(), '');
		expect(output).toBeUndefined();
	});

	it('should decode empty string as a fallback if given', () => {
		const defaultValue = new Date();
		const output = Decode(asDate().optional(defaultValue), '');
		expect(output).toBe(defaultValue);
	});

	it('should decode correctly like non-optional', () => {
		const output = Decode(asDate().optional(), new Date().toISOString());
		expect(output).toBeValidDate();
	});

	it('should encode correctly like non-optional', () => {
		const date = new Date();
		const output = Encode(asDate().optional(), date);
		expect(output).toBe(date.toISOString());
	});

	it('should encode undefined as an empty string', () => {
		const output = Encode(asDate().optional(), undefined);
		expect(output).toBe('');
	});

	it('should throw if try to encode non-date value', () => {
		expect(() => Encode(asDate(), 'what')).toThrow('Expected Date');
	});
});
