import {
	applyOffset,
	format,
	offset,
	parse,
	type Format,
} from '@formkit/tempo';
import { Date, type DateOptions } from '@sinclair/typebox';
import { createTransformer, type TransformOptions } from './create-transformer';

export type { DateOptions };

const ISO_OFFSET_SUFFIX = /(?:Z|[+-]\d{2}:?\d{2})$/i;

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
 * Options for {@link asDate}
 */
export type AsDateOptions = TempoOptions & DateOptions & TransformOptions;

/**
 * Create a date transformer.
 * Using {@link https://tempo.formkit.com | Tempo} to parse and format date string.
 * @param options - Validation options
 * @remarks Without format option, asDate expects {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#date_time_string_format | ISO 8601 format}
 * @example
 * ```ts
 * // Default expect ISO 8601 format
 * Column('createdAt', asDate());
 * // With custom format and timezone
 * Column('createdAt', asDate({
 *   format: 'DD/MM/YYYY',
 *   timezone: 'Asia/Bangkok'
 * }));
 * ```
 */
export function asDate(options: AsDateOptions = {}) {
	const {
		format: formatOption,
		timezone = 'UTC',
		emptyValues,
		...validateOptions
	} = options;

	return createTransformer({
		decode: (str) => {
			const localDate = parse(str, formatOption);

			// An explicit UTC offset is already resolved by parse; shifting again would double-apply it
			if (formatOption === undefined && ISO_OFFSET_SUFFIX.test(str)) {
				return localDate;
			}

			return applyOffset(localDate, offset(localDate, timezone));
		},
		encode: (date) => {
			if (formatOption !== undefined) {
				return format({ date, format: formatOption, tz: timezone });
			}

			const utcOffset = offset(date, 'UTC', timezone, 'Z');
			const milliseconds = date.getMilliseconds().toString().padStart(3, '0');

			return `${format({ date, format: 'YYYY-MM-DDTHH:mm:ss', tz: timezone })}.${milliseconds}${
				utcOffset === '+00:00' ? 'Z' : utcOffset
			}`;
		},
		validateSchema: Date(validateOptions),
		emptyValues,
	});
}
