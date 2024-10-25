import { type Static, type TObject } from '@sinclair/typebox';
import { parseCsv } from './parse-csv';

/**
 * Fetch CSV from the URL and parse according to the given table
 * @param url - URL to the CSV file
 * @param schema - Output schema mapping of each row
 * @param fetchRequestInit - Options for fetch() request  {@link FetchRequestInit}
 * @returns An array of objects corresponded to the table definition
 * @throws If fail to fetch or parse the table
 */
export async function fetchCsv<T extends TObject>(
	url: string,
	schema: T,
	fetchRequestInit?: FetchRequestInit,
): Promise<Static<T>[]> {
	const res = await fetch(url, fetchRequestInit);

	if (!res.ok) {
		throw new Error(
			`Failed to fetch (${res.status} ${res.statusText}), please recheck if the source is corrected and publicly accessible.`,
		);
	}

	return parseCsv(await res.text(), schema);
}
