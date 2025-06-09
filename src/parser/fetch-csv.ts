import type { StaticDecode } from '@sinclair/typebox';
import { parseCsv, type TCsvSchema } from './parse-csv';

const DEBUG_BODY_LIMIT = 2000;

/**
 * Options for fetchCsv function
 */
interface FetchOptions {
	/**
	 * Fetch requests configuration
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/RequestInit}
	 */
	fetchRequestInit?: FetchRequestInit;
	/**
	 * Enable debugging logs
	 * @defaultValue false
	 */
	debug?: boolean;
}

/**
 * Fetch CSV from the URL and parse according to the given schema
 * @param url - URL to the CSV file
 * @param schema - Output schema mapping of each row
 * @param options - Fetch options {@link FetchOptions}
 * @returns An array of objects corresponded to the table definition
 * @throws If fail to fetch or parse the schema
 * @example
 * ```ts
 * const output = await fetchCsv('https://url-to/data.csv', schema);
 * ```
 */
export async function fetchCsv<T extends TCsvSchema>(
	url: string,
	schema: T,
	options?: FetchOptions,
): Promise<StaticDecode<T>[]> {
	const { fetchRequestInit, ...parseOptions } = options ?? {};

	const res = await fetch(url, fetchRequestInit);

	if (!res.ok) {
		throw new Error(
			`Failed to fetch (${res.status} ${res.statusText}), please recheck if the source is corrected and publicly accessible.`,
		);
	}

	const body = await res.text();

	if (options?.debug) {
		console.debug(
			`[DEBUG] Response body:\n ${
				body.length > DEBUG_BODY_LIMIT
					? `${body.slice(0, DEBUG_BODY_LIMIT)}... (${body.length - DEBUG_BODY_LIMIT} more characters)`
					: body
			}`,
		);
	}

	return parseCsv(body, schema, parseOptions);
}
