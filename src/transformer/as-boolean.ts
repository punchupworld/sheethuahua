import { Boolean, type SchemaOptions } from '@sinclair/typebox';
import { createTransformer, type TransformOptions } from './create-transformer';

export type { SchemaOptions };

/**
 * Options for {@link asBoolean}
 */
export type AsBooleanOptions = SchemaOptions & TransformOptions;

/**
 * Create a boolean transformer. Accept case-insensitive _'true'_ or _'false'_ and _0_ or _1_.
 * @param options - Validation options
 * @example
 * ```ts
 * Column('isDone', asBoolean());
 * ```
 */
export function asBoolean(options?: AsBooleanOptions) {
	const { emptyValues, ...boolOptions } = options ?? {};
	return createTransformer({
		decode: (str) => {
			switch (str.toLowerCase()) {
				case 'true':
				case '1':
					return true;
				case 'false':
				case '0':
					return false;
				default:
					return undefined;
			}
		},
		encode: (val) => (val as boolean).toString(),
		validateSchema: Boolean(boolOptions),
		emptyValues,
	});
}
