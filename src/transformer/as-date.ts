import {
	applyOffset,
	format,
	offset,
	parse,
	type Format,
} from '@formkit/tempo';
import { Date, type DateOptions } from '@sinclair/typebox';
import { createTransformer } from './create-transformer';

export type { DateOptions };

/**
 * Options for Tempo to parse and format date string.
 */
export interface TempoOptions {
	/**
	 * The format that should be used to parse and format the date.
	 * @defaultValue ISO 8601 format
	 * @see {@link https://tempo.formkit.com/#format-tokens | Tempo Format Tokens}
	 */
	format?: Format;
	/**
	 * Timezone for the decode's input and encode's output date string.
	 * @defaultValue UTC
	 */
	timezone?: string;
}

/**
 * Create date transformer.
 * Using {@link https://tempo.formkit.com | Tempo} to parse and format date string.
 * @param options - {@link TempoOptions} for parsing/formatting and {@link DateOptions} for validation
 * @remarks Without format option, asDate expects {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#date_time_string_format | ISO 8601 format}
 * @example
 * ```ts
 * Column('createdAt', asDate());
 * Column('createdAt', asDate({
 *   format: 'DD/MM/YYYY',
 *   timezone: 'Asia/Bangkok'
 * }));
 * ```
 */
export function asDate(options: TempoOptions & DateOptions = {}) {
	const {
		format: formatOption,
		timezone = 'UTC',
		...validateOptions
	} = options;

	return createTransformer(
		(str) => {
			const localDate = parse(str, formatOption);
			return applyOffset(localDate, offset(localDate, timezone));
		},
		(date) =>
			format({
				date,
				format: formatOption ?? 'YYYY-MM-DDTHH:mm:ss',
				tz: timezone,
			}) +
			(formatOption === undefined
				? `.${date.getMilliseconds().toString().padStart(3, '0')}Z`
				: ''),
		Date(validateOptions),
	);
}
