import { String, type StringOptions } from '@sinclair/typebox';
import { createTransformer } from './create-transformer';

export type { StringOptions };

/**
 * Create string transformer
 * @param options - Validation options (see {@link StringOptions})
 * @example
 * ```ts
 * Column('name', asString());
 * ```
 */
export function asString(options?: StringOptions) {
	return createTransformer(
		(str) => str,
		(str) => str,
		String(options),
	);
}
