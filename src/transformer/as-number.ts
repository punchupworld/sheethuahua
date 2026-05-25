import { Number, type NumberOptions } from '@sinclair/typebox';
import { createTransformer, type TransformOptions } from './create-transformer';

export type { NumberOptions };

/**
 * Options for {@link asNumber}
 */
export type AsNumberOptions = NumberOptions & TransformOptions;

/**
 * Create a number transformer
 * @param options - Validation options
 * @example
 * ```ts
 * Column('score', asNumber());
 * ```
 */
export function asNumber(options?: AsNumberOptions) {
	const { emptyValues, ...numberOptions } = options ?? {};
	return createTransformer({
		decode: (str) => +str,
		encode: (num) => num.toString(),
		validateSchema: Number(numberOptions),
		emptyValues,
	});
}
