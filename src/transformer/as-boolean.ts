import { Boolean, type SchemaOptions } from '@sinclair/typebox';
import { createTransformer } from './create-transformer';

export type { SchemaOptions };

/**
 * Create boolean transformer. Accept case-insensitive _'true'_ or _'false'_ and _0_ or _1_.
 * @param options - Validation options (see {@link SchemaOptions})
 * @example
 * ```ts
 * Column('isDone', asBoolean());
 * ```
 */
export function asBoolean(options?: SchemaOptions) {
	return createTransformer(
		(str) => {
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
		(num) => num.toString(),
		Boolean(options),
	);
}
