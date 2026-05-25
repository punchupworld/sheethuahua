import {
	Any,
	Optional,
	String,
	Transform,
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
 * Common options for all transformer factories
 */
export interface TransformOptions {
	/**
	 * Values treated as empty.
	 * On non-optional columns, throws if matched.
	 * On optional columns, returns `undefined` or the given fallback.
	 * @defaultValue `['']`
	 */
	emptyValues?: string[];
}

/**
 * Options for {@link createTransformer}
 */
export interface CreateTransformerOptions<T, S extends TSchema = TAny>
	extends TransformOptions {
	/**
	 * A function to parse string from CSV cell
	 */
	decode: (value: string) => T;
	/**
	 * A function to format value back to string
	 */
	encode?: (value: T) => string;
	/**
	 * A schema to validate decoded value
	 */
	validateSchema?: S;
}

/**
 * Create a custom transformer
 * @example
 * ```ts
 * const asMarkdownList = createTransformer({
 * 	decode: (str) => str
 * 		.split('\n')
 * 		.map((line) => line.replace('- ', '').trim())
 * 		.filter((item) => item.length > 0),
 * });
 * ```
 */
export function createTransformer<T, S extends TSchema = TAny>(
	options: CreateTransformerOptions<T, S>,
): TTransformer<T, S>;
export function createTransformer(options: {
	decode: (value: string) => unknown;
	encode?: (value: unknown) => string;
	validateSchema?: TSchema;
	emptyValues?: string[];
}) {
	const {
		decode,
		encode = () => '',
		validateSchema = Any(),
		emptyValues = [''],
	} = options;
	const emptyValuesSet = new Set(emptyValues);

	function safeDecode(value: string) {
		if (emptyValuesSet.has(value)) {
			throw new Error(
				`Received empty value '${value}' but column is not optional. Use .optional() to allow empty values.`,
			);
		}
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
				.Decode((value) => {
					if (emptyValuesSet.has(value) || !value?.length) return fallback;
					return safeDecode(value);
				})
				.Encode((value) => (value !== undefined ? safeEncode(value) : ''));

			return fallback === undefined ? Optional(transform) : transform;
		},
		validateSchema,
	};
}
