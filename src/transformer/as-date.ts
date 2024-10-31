import { Date, type DateOptions } from '@sinclair/typebox';
import { createTransformer } from './create-transformer';

export type { DateOptions };

/**
 * Create date transformer. Only accept {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#date_time_string_format | Date-time string format}.
 * @param options - Validation options (see {@link DateOptions})
 * @example
 * ```ts
 * Column('createdAt', asDate());
 * ```
 */
export function asDate(options?: DateOptions) {
	return createTransformer(
		(str) => new global.Date(str),
		(date) => date.toISOString(),
		Date(options),
	);
}
