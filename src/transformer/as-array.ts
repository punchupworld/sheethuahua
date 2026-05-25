import { Array, type ArrayOptions, type TSchema } from '@sinclair/typebox';
import { Decode, Encode } from '@sinclair/typebox/value';
import {
	createTransformer,
	type TTransformer,
	type TransformOptions,
} from './create-transformer';

export { type ArrayOptions };

/**
 * Options for {@link asArray}
 */
export type AsArrayOptions = ArrayOptions & TransformOptions;

/**
 * Create an array transformer. Split string with separator and apply itemTransformer to each item.
 * @param itemTransformer - Transformer for each item
 * @param separator - A string that separate each item
 * @param options - Validation options
 * @example
 * ```ts
 * // Example: "food, transport, rent" -> ['food', 'transport', 'rent']
 * Column('categories', asArray(asString()));
 * ```
 */
export function asArray<T, S extends TSchema>(
	itemTransformer: TTransformer<T, S>,
	separator: string = ',',
	options?: AsArrayOptions,
) {
	const { emptyValues, ...arrayOptions } = options ?? {};
	return createTransformer({
		decode: (str) =>
			str.split(separator).map((item) => Decode(itemTransformer, item.trim())),
		encode: (items) =>
			items.map((item) => Encode(itemTransformer, item)).join(separator),
		// eslint-disable-next-line @typescript-eslint/no-array-constructor
		validateSchema: Array(itemTransformer.validateSchema, arrayOptions),
		emptyValues,
	});
}
