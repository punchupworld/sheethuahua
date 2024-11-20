import { Number, type NumberOptions } from '@sinclair/typebox';
import { createTransformer } from './create-transformer';

export type { NumberOptions };

/**
 * Create a number transformer
 * @param options - Validation options (see {@link NumberOptions})
 * @example
 * ```ts
 * Column('score', asNumber());
 * ```
 */
export function asNumber(options?: NumberOptions) {
	return createTransformer(
		(str) => +str,
		(num) => num.toString(),
		Number(options),
	);
}
