import { Value } from '@sinclair/typebox/value';
import { describe, expect, it } from 'bun:test';
import { asOneOf } from '../../src';

const values = [1, 2, 'a', 'b'];

it.each(values.map((val) => [val.toString(), val]))(
	'should decode %p as a corresponded option %p',
	(val, out) => {
		const output = Value.Decode(asOneOf(values), val);
		expect(output).toBe(out);
	},
);

it('should throw when decode value not in the list', () => {
	expect(() => Value.Decode(asOneOf(values), 3)).toThrow(
		'Unable to decode value as it does not match the expected schema',
	);
});

it.each(values.map((val) => [val, val.toString()]))(
	'should encode %p as a %p',
	(val, out) => {
		const output = Value.Encode(asOneOf(values), val);
		expect(output).toBe(out);
	},
);

describe('optional', () => {
	it('should decode empty string as undefined', () => {
		const output = Value.Decode(asOneOf(values).optional(), '');
		expect(output).toBeUndefined();
	});

	it('should decode correctly like non-optional', () => {
		const output = Value.Decode(asOneOf(values).optional(), '1');
		expect(output).toBe(1);
	});
});
