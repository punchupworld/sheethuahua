import { Value } from '@sinclair/typebox/value';
import { describe, expect, it } from 'bun:test';
import { asDate } from '../../src';

it.each(['1996-11-13', new Date().toISOString()])(
	'should decode %s as a valid date object',
	(val) => {
		const output = Value.Decode(asDate(), val);
		expect(output).toBeValidDate();
	},
);

it.each(['13/11/1996', 'not date'])('should throw when decode %p', (value) => {
	expect(() => Value.Decode(asDate(), value)).toThrow('Expected Date');
});

it('should encode date as ISO string', () => {
	const date = new Date();
	const output = Value.Encode(asDate(), date);
	expect(output).toBe(date.toISOString());
});

describe('optional', () => {
	it('should decode empty string as undefined', () => {
		const output = Value.Decode(asDate().optional(), '');
		expect(output).toBeUndefined();
	});

	it('should decode correctly like non-optional', () => {
		const output = Value.Decode(asDate().optional(), new Date().toISOString());
		expect(output).toBeValidDate();
	});
});
