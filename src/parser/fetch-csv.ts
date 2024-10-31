import { type StaticDecode } from '@sinclair/typebox';
import { parseCsv, type TCsvSchema } from './parse-csv';

/**
 * Fetch CSV from the URL and parse according to the given table
 * @param url - URL to the CSV file
 * @param schema - Output schema mapping of each row
 * @param fetchRequestInit - Options for fetch() request  {@link FetchRequestInit}
 * @returns An array of objects corresponded to the table definition
 * @throws If fail to fetch or parse the table
 * @example
 * ```ts
 * const output = await fetchCsv('https://url-to/data.csv', schema);
 * ```
 */
export async function fetchCsv<T extends TCsvSchema>(
	url: string,
	schema: T,
	fetchRequestInit?: FetchRequestInit,
): Promise<StaticDecode<T>[]> {
	const res = await fetch(url, fetchRequestInit);

	if (!res.ok) {
		throw new Error(
			`Failed to fetch (${res.status} ${res.statusText}), please recheck if the source is corrected and publicly accessible.`,
		);
	}

	return parseCsv(await res.text(), schema);
}
