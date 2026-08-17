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
 *
 * Any separator is supported, including multi-character ones and newlines.
 * Uses CSV-style quoting so items that contain the separator can be wrapped in
 * double quotes (e.g. `a,"b,c",d` -> `['a', 'b,c', 'd']`), with a doubled `""`
 * standing for a literal quote. Whitespace between the separator and the
 * opening quote is tolerated (e.g. `, "b,c"` works too). Every item is trimmed,
 * so leading and trailing whitespace is never preserved, even when quoted.
 * @param itemTransformer - Transformer for each item
 * @param separator - A string that separate each item
 * @param options - Validation options
 * @throws If separator is an empty string
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
	if (separator === '') {
		throw new Error('asArray separator must not be an empty string');
	}

	const { emptyValues, ...arrayOptions } = options ?? {};
	return createTransformer({
		decode: (str) =>
			splitItems(str, separator).map((item) =>
				Decode(itemTransformer, item.trim()),
			),
		encode: (items) =>
			items
				.map((item) => quoteItem(Encode(itemTransformer, item), separator))
				.join(separator),
		// eslint-disable-next-line @typescript-eslint/no-array-constructor
		validateSchema: Array(itemTransformer.validateSchema, arrayOptions),
		emptyValues,
	});
}

/**
 * Split a string on a separator, honouring CSV-style double-quoted items.
 * Unlike a CSV row parser, newlines carry no special meaning and may be used as
 * the separator or appear inside a quoted item.
 * @param str - Input to split
 * @param separator - Field separator, must not be empty
 * @returns The separated items, without their surrounding quotes
 */
function splitItems(str: string, separator: string) {
	const items: string[] = [];
	let index = 0;

	for (;;) {
		while (
			index < str.length &&
			/\s/.test(str.charAt(index)) &&
			!str.startsWith(separator, index)
		) {
			index++;
		}

		if (str[index] === '"') {
			index++;
			let item = '';

			while (index < str.length) {
				if (str[index] !== '"') {
					item += str[index++];
				} else if (str[index + 1] === '"') {
					item += '"';
					index += 2;
				} else {
					index++;
					break;
				}
			}

			items.push(item);
			index = skipSpaceAfterQuote(str, separator, index);
		} else {
			const end = str.indexOf(separator, index);
			items.push(str.slice(index, end === -1 ? undefined : end));
			index = end === -1 ? str.length : end;
		}

		const next = str.indexOf(separator, index);

		if (next === -1) {
			return items;
		}

		index = next + separator.length;
	}
}

/**
 * Move past the whitespace that may sit between a closing quote and the next
 * separator, rejecting any other trailing content rather than discarding it.
 * @param str - Input being split
 * @param separator - Field separator
 * @param index - Position right after the closing quote
 * @returns Position of the next separator, or the end of the input
 * @throws If anything other than whitespace follows the closing quote
 */
function skipSpaceAfterQuote(str: string, separator: string, index: number) {
	let cursor = index;

	while (
		cursor < str.length &&
		/\s/.test(str.charAt(cursor)) &&
		!str.startsWith(separator, cursor)
	) {
		cursor++;
	}

	if (cursor < str.length && !str.startsWith(separator, cursor)) {
		throw new Error(
			`Unexpected "${str.charAt(cursor)}" after a closing quote at position ${cursor}`,
		);
	}

	return cursor;
}

/**
 * Wrap an item in double quotes if it would otherwise be ambiguous once joined,
 * doubling any quote it contains.
 * @param item - Encoded item
 * @param separator - Field separator
 * @returns The item, quoted only when necessary
 */
function quoteItem(item: string, separator: string) {
	return item.includes(separator) ||
		item.includes('"') ||
		straddlesSeparator(item, separator)
		? `"${item.replace(/"/g, '""')}"`
		: item;
}

/**
 * Check whether an item ends with the start of the separator, or starts with
 * the end of it. Such an item would merge with an adjacent separator once
 * joined and form a separator that was never intended, so it needs quoting even
 * though it contains no separator of its own.
 * @param item - Encoded item
 * @param separator - Field separator
 * @returns True if joining the item could create a spurious separator
 */
function straddlesSeparator(item: string, separator: string) {
	for (let length = 1; length < separator.length; length++) {
		if (
			item.endsWith(separator.slice(0, length)) ||
			item.startsWith(separator.slice(separator.length - length))
		) {
			return true;
		}
	}

	return false;
}
