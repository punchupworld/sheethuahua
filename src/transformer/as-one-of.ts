import {
	Literal,
	Union,
	type SchemaOptions,
	type TLiteralValue,
} from '@sinclair/typebox';
import { Convert } from '@sinclair/typebox/value';
import { createTransformer } from './create-transformer';

export type { SchemaOptions, TLiteralValue };

/**
 * Create an oneOf transformer. Value must be parsable as one of the given values.
 * @param values - An array of expected values
 * @param options - Validation options (see {@link NumberOptions})
 * @example
 * ```ts
 * Column('createdAt', asOneOf(['Todo', 'Doing', 'Done']));
 * ```
 */
export function asOneOf<T extends TLiteralValue[]>(
	values: readonly [...T],
	options?: SchemaOptions,
) {
	const schema = Union(
		values.map((value) => Literal(value)),
		options,
	);
	return createTransformer(
		(str) => Convert(schema, str),
		(val: T[number]) => val.toString(),
		schema,
	);
}
