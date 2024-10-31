import { Value } from '@sinclair/typebox/value';
import { describe, expect, it } from 'bun:test';
import { asNumber } from '../../src';

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

describe('optional', () => {
	it('should decode empty string as undefined', () => {
		const output = Value.Decode(asNumber().optional(), '');
		expect(output).toBeUndefined();
	});

	it('should decode correctly like non-optional', () => {
		const output = Value.Decode(asNumber().optional(), '2.5');
		expect(output).toBe(2.5);
	});
});
