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
import { Assert } from '@sinclair/typebox/value';

/**
 * Transformer type
 */
export type TTransformer<T> = TTransform<TString, T> & {
	/**
	 * Get optional variant of this transformer
	 * @param fallback - fallback value when the input is empty
	 * @returns TTransform, with optional kind if no fallback is given
	 */
	optional: <D extends T | undefined>(
		fallback?: D,
	) => [D] extends [T]
		? TTransform<TString, T>
		: TOptional<TTransform<TString, T | undefined>>;
};

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
	encode?: (value: T) => string,
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
	encode: (value: unknown) => string = () => '',
	validateSchema?: S,
) {
	function safeDecode(value: string) {
		const output = decode(value);
		if (validateSchema) {
			Assert(validateSchema, output);
		}
		return output;
	}

	function safeEncode(value: unknown) {
		if (validateSchema) {
			Assert(validateSchema, value);
		}
		return encode(value);
	}

	return {
		...Transform(String({ minLength: 1 }))
			.Decode(safeDecode)
			.Encode(safeEncode),
		optional(fallback: unknown = undefined) {
			const transform = Transform(String())
				.Decode((value) => (value?.length ? safeDecode(value) : fallback))
				.Encode((value) => (value !== undefined ? safeEncode(value) : ''));

			return fallback === undefined ? Optional(transform) : transform;
		},
	};
}
