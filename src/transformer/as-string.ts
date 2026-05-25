import { String, type StringOptions } from '@sinclair/typebox';
import { createTransformer, type TransformOptions } from './create-transformer';

export type { StringOptions };

/**
 * Options for {@link asString}
 */
export type AsStringOptions = StringOptions & TransformOptions;

/**
 * Create a string transformer
 * @param options - Validation options
 * @example
 * ```ts
 * Column('name', asString());
 * ```
 */
export function asString(options?: AsStringOptions) {
	const { emptyValues, ...stringOptions } = options ?? {};
	return createTransformer({
		decode: (str) => str,
		encode: (str) => str,
		validateSchema: String(stringOptions),
		emptyValues,
	});
}
