import {
	Any,
	Optional,
	String,
	Transform,
	type StaticDecode,
	type TAny,
	type TOptional,
	type TSchema,
	type TString,
	type TTransform,
} from '@sinclair/typebox';
import { Assert } from '@sinclair/typebox/value';

/**
 * Transformer type
 */
export type TTransformer<T, S extends TSchema = TAny> = TTransform<
	TString,
	T
> & {
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
	/**
	 * A schema for decode's output and encode's input validation
	 */
	validateSchema: S;
};

/**
 * Create custom transformer
 * @param decode - A function to parse string from CSV cell
 * @param encode - A function to format value back to string
 * @example
 * ```ts
 * const asMarkdownList = createTransformer(
 * 	(str) => str
 * 		.split('\n')
 * 		.map((line) => line.replace('- ', '').trim())
 * 		.filter((item) => item.length > 0),
 * );
 * ```
 */
export function createTransformer<T>(
	decode: (value: string) => T,
	encode?: (value: T) => string,
): TTransformer<T>;
/**
 * Create a custom transformer
 * @param decode - A function to parse string from CSV cell
 * @param encode - A function to format value back to string
 * @param decodeSchema - A schema to validate decoded value
 * @example
 * ```ts
 * const asMarkdownList = createTransformer(
 * 	(str) => str
 * 		.split('\n')
 * 		.map((line) => line.replace('- ', '').trim())
 * 		.filter((item) => item.length > 0),
 * 	(items) => items.map(item => `- ${item}`).join('\n')
 * );
 * ```
 */
export function createTransformer<S extends TSchema, T = StaticDecode<S>>(
	decode: (value: string) => unknown,
	encode: (value: T) => string,
	decodeSchema: S,
): TTransformer<T, S>;
export function createTransformer(
	decode: (value: string) => unknown,
	encode: (value: unknown) => string = () => '',
	validateSchema: TSchema = Any(),
) {
	function safeDecode(value: string) {
		const output = decode(value);
		Assert(validateSchema, output);
		return output;
	}

	function safeEncode(value: unknown) {
		Assert(validateSchema, value);
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
		validateSchema,
	};
}
