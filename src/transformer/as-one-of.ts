import {
	Literal,
	Union,
	type SchemaOptions,
	type TLiteralValue,
} from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import { createTransformer } from './create-transformer';

export type { SchemaOptions, TLiteralValue };

/**
 * Create oneOf transformer. Value must be parsable as one in the list.
 * @param values - An array of possible values
 * @param options - Validation options (see {@link NumberOptions})
 * @example
 * ```ts
 * Column('createdAt', asOneOf(['Todo', 'Doing', 'Done']));
 * ```
 */
export function asOneOf<T extends TLiteralValue[]>(
	values: [...T],
	options?: SchemaOptions,
) {
	const schema = Union(
		values.map((value) => Literal(value)),
		options,
	);
	return createTransformer(
		(str) => Value.Convert(schema, str),
		(val) => val.toString(),
		schema,
	);
}
