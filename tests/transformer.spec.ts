import { Value } from '@sinclair/typebox/value';
import { describe, expect, it } from 'bun:test';
import { asBoolean, asDate, asNumber, asOneOf, asString } from '../src';

describe('Boolean', () => {
	it.each(['1', 'true', 'TRUE'])('should decode %p as true', (value) => {
		const output = Value.Decode(asBoolean(), value);
		expect(output).toBeTrue();
	});

	it.each(['0', 'false', 'FALSE'])('should decode %p as false', (value) => {
		const output = Value.Decode(asBoolean(), value);
		expect(output).toBeFalse();
	});

	it.each(['', '2', 'what'])('should throw when decode %p', (value) => {
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

describe('Date', () => {
	it.each(['1996-11-13', new Date().toISOString()])(
		'should decode %s as a valid date object',
		(val) => {
			const output = Value.Decode(asDate(), val);
			expect(output).toBeValidDate();
		},
	);

	it.each(['13/11/1996', 'not date'])(
		'should throw when decode %p',
		(value) => {
			expect(() => Value.Decode(asDate(), value)).toThrow('Expected Date');
		},
	);

	it('should encode date as ISO string', () => {
		const date = new Date();
		const output = Value.Encode(asDate(), date);
		expect(output).toBe(date.toISOString());
	});
});

describe('Number', () => {
	it('should decode string of number as a number', () => {
		const output = Value.Decode(asNumber(), '2.5');
		expect(output).toBe(2.5);
	});

	it('should throw when decode string of not a number', () => {
		expect(() => Value.Decode(asNumber(), 'hi')).toThrow('Expected number');
	});

	it('should encode number as a string of number', () => {
		const output = Value.Encode(asNumber(), 2.5);
		expect(output).toBe('2.5');
	});
});

describe('OneOf', () => {
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
});

describe('String', () => {
	it('should decode exactly the same as input', () => {
		const output = Value.Decode(asString(), 'a');
		expect(output).toBe('a');
	});

	it('should encode exactly the same as input', () => {
		const output = Value.Encode(asString(), 'a');
		expect(output).toBe('a');
	});
});
