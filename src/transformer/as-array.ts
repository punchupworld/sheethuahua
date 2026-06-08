import { Array, type ArrayOptions, type TSchema } from '@sinclair/typebox';
import { Decode, Encode } from '@sinclair/typebox/value';
import { dsvFormat } from 'd3-dsv';
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
 *
 * Uses CSV-style quoting so items that contain the separator can be wrapped in
 * double quotes (e.g. `a,"b,c",d` -> `['a', 'b,c', 'd']`). Whitespace between
 * the separator and the opening quote is tolerated (e.g. `, "b,c"` works too).
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
	const dsv = dsvFormat(separator);
	return createTransformer({
		decode: (str) => {
			const [cells] = dsv.parseRows(stripSpaceBeforeQuote(str, separator));
			return (cells ?? []).map((item) => Decode(itemTransformer, item.trim()));
		},
		encode: (items) =>
			dsv.formatRow(items.map((item) => Encode(itemTransformer, item))),
		// eslint-disable-next-line @typescript-eslint/no-array-constructor
		validateSchema: Array(itemTransformer.validateSchema, arrayOptions),
		emptyValues,
	});
}

/**
 * Collapse whitespace between a delimiter (or start of string) and an opening
 * double quote so that human-typed inputs like `, "x"` parse as a single
 * quoted field instead of an unquoted space-prefixed literal.
 * @param str - Input to normalize
 * @param separator - Field separator
 * @returns String with whitespace-before-quote removed
 */
function stripSpaceBeforeQuote(str: string, separator: string) {
	return str.replace(
		new RegExp(`(^|${escapeRegExp(separator)})\\s+(?=")`, 'g'),
		'$1',
	);
}

/**
 * Escape a string for use as a literal in a regular expression.
 * @param s - String to escape
 * @returns String safe to embed in a RegExp
 */
function escapeRegExp(s: string) {
	return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
