import {
	Literal,
	Union,
	type SchemaOptions,
	type TLiteralValue,
} from '@sinclair/typebox';
import { Convert } from '@sinclair/typebox/value';
import { createTransformer, type TransformOptions } from './create-transformer';

export type { SchemaOptions, TLiteralValue };

/**
 * Options for {@link asOneOf}
 */
export type AsOneOfOptions = SchemaOptions & TransformOptions;

/**
 * Create an oneOf transformer. Value must be parsable as one of the given values.
 * @param values - An array of expected values
 * @param options - Validation options
 * @example
 * ```ts
 * Column('status', asOneOf(['Todo', 'Doing', 'Done']));
 * ```
 */
export function asOneOf<T extends TLiteralValue[]>(
	values: readonly [...T],
	options?: AsOneOfOptions,
) {
	const { emptyValues, ...unionOptions } = options ?? {};
	const schema = Union(
		values.map((value) => Literal(value)),
		unionOptions,
	);
	return createTransformer({
		decode: (str) => Convert(schema, str) as T[number],
		encode: (val: T[number]) => val.toString(),
		validateSchema: schema,
		emptyValues,
	});
}
