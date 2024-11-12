import { Array, type ArrayOptions, type TSchema } from '@sinclair/typebox';
import { Decode, Encode } from '@sinclair/typebox/value';
import { createTransformer, type TTransformer } from './create-transformer';

export { type ArrayOptions };
/**
 * Create array transformer.
 * @param itemTransformer - Transformer for each item
 * @param separator - A string that separate each item
 * @param options - Validation options (see {@link ArrayOptions})
 * @example
 * ```ts
 * Column('categories', asArray(asString(), ' '));
 * ```
 */
export function asArray<T, S extends TSchema>(
	itemTransformer: TTransformer<T, S>,
	separator: string = ',',
	options?: ArrayOptions,
) {
	return createTransformer(
		(str) =>
			str.split(separator).map((item) => Decode(itemTransformer, item.trim())),
		(items) =>
			items.map((item) => Encode(itemTransformer, item)).join(separator),
		// eslint-disable-next-line @typescript-eslint/no-array-constructor
		Array(itemTransformer.validateSchema, options),
	);
}
