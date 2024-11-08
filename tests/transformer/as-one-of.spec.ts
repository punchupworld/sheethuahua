import { Decode, Encode } from '@sinclair/typebox/value';
import { describe, expect, it } from 'bun:test';
import { asOneOf } from '../../src';

const values = [1, 2, 'a', 'b'];

describe('default', () => {
	it('should throw if empty', () => {
		expect(() => Decode(asOneOf(values), '')).toThrow(
			'Unable to decode value as it does not match the expected schema',
		);
	});

	it.each(values.map((val) => [val.toString(), val]))(
		'should decode %p as a corresponded option %p',
		(val, out) => {
			const output = Decode(asOneOf(values), val);
			expect(output).toBe(out);
		},
	);

	it('should throw when decode value not in the list', () => {
		expect(() => Decode(asOneOf(values), 3)).toThrow(
			'Unable to decode value as it does not match the expected schema',
		);
	});

	it.each(values.map((val) => [val, val.toString()]))(
		'should encode %p as a %p',
		(val, out) => {
			const output = Encode(asOneOf(values), val);
			expect(output).toBe(out);
		},
	);

	it.each([null, undefined, 'what'])(
		'should throw if try to encode %p',
		(value) => {
			expect(() => Encode(asOneOf(values), value)).toThrow(
				'Expected union value',
			);
		},
	);
});

describe('optional', () => {
	it('should decode empty string as undefined', () => {
		const output = Decode(asOneOf(values).optional(), '');
		expect(output).toBeUndefined();
	});

	it('should decode empty string as a fallback if given', () => {
		const defaultValue = values[0];
		const output = Decode(asOneOf(values).optional(defaultValue), '');
		expect(output).toBe(defaultValue);
	});

	it('should decode correctly like non-optional', () => {
		const output = Decode(asOneOf(values).optional(), '1');
		expect(output).toBe(1);
	});

	it('should encode correctly like non-optional', () => {
		const output = Encode(asOneOf(values).optional(), 1);
		expect(output).toBe('1');
	});

	it('should encode undefined as an empty string', () => {
		const output = Encode(asOneOf(values).optional(), undefined);
		expect(output).toBe('');
	});

	it('should throw if try to encode non-member value', () => {
		expect(() => Encode(asOneOf(values), 'what')).toThrow(
			'Expected union value',
		);
	});
});
