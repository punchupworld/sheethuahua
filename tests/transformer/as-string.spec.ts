import { Value } from '@sinclair/typebox/value';
import { describe, expect, it } from 'bun:test';
import { asString } from '../../src';

it('should decode exactly the same as input', () => {
	const output = Value.Decode(asString(), 'a');
	expect(output).toBe('a');
});

it('should encode exactly the same as input', () => {
	const output = Value.Encode(asString(), 'a');
	expect(output).toBe('a');
});

describe('optional', () => {
	it('should decode empty string as undefined', () => {
		const output = Value.Decode(asString().optional(), '');
		expect(output).toBeUndefined();
	});

	it('should decode correctly like non-optional', () => {
		const output = Value.Encode(asString().optional(), 'a');
		expect(output).toBe('a');
	});
});
