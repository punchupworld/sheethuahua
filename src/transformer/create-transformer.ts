import {
	Optional,
	String,
	Transform,
	type Static,
	type TOptional,
	type TSchema,
	type TString,
	type TTransform,
} from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';

/**
 * Transformer type
 */
export type TTransformer<T> = TTransform<TString, T> & {
	/**
	 * Get optional variant of this transformer
	 * @returns Optional Transformer
	 */
	optional: () => TTransformerOptional<T>;
};

/**
 * Transformer that can accept empty string and return `undefined`
 */
export type TTransformerOptional<T> = TOptional<
	TTransform<TString, T | undefined>
>;

/**
 * Create custom transformer
 * @param decode - A function to parse string from CSV cell
 * @param encode - A function to format value back to string
 * @example
 * ```ts
 * const asStringList = (sep: string) =>
 *   createTransformer(
 *     (str) => str.split(sep),
 *     (items) => items.join(sep),
 *   );
 * ```
 */
export function createTransformer<T>(
	decode: (value: string) => T,
	encode: (value: T) => string,
): TTransformer<T>;
/**
 * Create custom transformer
 * @param decode - A function to parse string from CSV cell
 * @param encode - A function to format value back to string
 * @param decodeSchema - A schema to validate decoded value
 * @example
 * ```ts
 * const asStringList = (sep: string) =>
 *   createTransformer(
 *     (str) => str.split(sep),
 *     (items) => items.join(sep),
 *     Array(String())
 *   );
 * ```
 */
export function createTransformer<S extends TSchema, T = Static<S>>(
	decode: (value: string) => unknown,
	encode: (value: T) => string,
	decodeSchema: S,
): TTransformer<T>;
export function createTransformer<S extends TSchema>(
	decode: (value: string) => unknown,
	encode: (value: unknown) => string,
	validateSchema?: S,
) {
	function safeDecode(value: string) {
		const output = decode(value);
		if (validateSchema) {
			Value.Assert(validateSchema, output);
		}
		return output;
	}

	return {
		...Transform(String())
			.Decode((value) => safeDecode(value))
			.Encode(encode),
		/**
		 * Create optional variation of this transformer
		 */
		optional: () =>
			Optional(
				Transform(String())
					.Decode((value) => (value.length ? safeDecode(value) : undefined))
					.Encode(encode),
			),
	};
}
