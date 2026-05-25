import { Decode, Encode } from '@sinclair/typebox/value';
import { describe, expect, it } from 'bun:test';
import { asArray, asNumber } from '../../src';

describe('emptyValues', () => {
	it('should throw when emptyValues match on non-optional', () => {
		expect(() => Decode(asNumber({ emptyValues: ['N/A'] }), 'N/A')).toThrow(
			'Received empty value',
		);
	});

	it('should decode normally when no match', () => {
		expect(Decode(asNumber({ emptyValues: ['N/A'] }), '42')).toBe(42);
	});

	it('should return undefined when emptyValues match on optional', () => {
		expect(
			Decode(asNumber({ emptyValues: ['N/A'] }).optional(), 'N/A'),
		).toBeUndefined();
	});

	it('should apply fallback when emptyValues match on optional with fallback', () => {
		expect(Decode(asNumber({ emptyValues: ['N/A'] }).optional(0), 'N/A')).toBe(
			0,
		);
	});

	it("should apply fallback for empty string (default emptyValues includes '')", () => {
		expect(Decode(asNumber().optional(0), '')).toBe(0);
	});

	it('should return undefined for empty string on optional without fallback', () => {
		expect(Decode(asNumber().optional(), '')).toBeUndefined();
	});

	it('should be case-sensitive', () => {
		expect(() => Decode(asNumber({ emptyValues: ['N/A'] }), 'n/a')).toThrow(
			'Expected number',
		);
	});

	it('should handle multiple emptyValues', () => {
		const tfm = asNumber({
			emptyValues: ['N/A', '-', 'null'],
		}).optional();
		expect(Decode(tfm, 'N/A')).toBeUndefined();
		expect(Decode(tfm, '-')).toBeUndefined();
		expect(Decode(tfm, 'null')).toBeUndefined();
	});

	it('should encode undefined as empty string on optional', () => {
		const output = Encode(
			asNumber({ emptyValues: ['N/A'] }).optional(),
			undefined,
		);
		expect(output).toBe('');
	});

	it('should check emptyValues at cell level, not per-item (asArray)', () => {
		// '1,N/A,3' → not an emptyValues match → splits → asNumber fails on 'N/A'
		expect(() =>
			Decode(asArray(asNumber(), ',', { emptyValues: ['N/A'] }), '1,N/A,3'),
		).toThrow('Expected number');
	});
});
