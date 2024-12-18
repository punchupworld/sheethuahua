import { type StaticDecode } from '@sinclair/typebox';
import { fetchCsv } from './fetch-csv';
import type { TCsvSchema } from './parse-csv';

/**
 * Options for Sheets getter function
 */
export interface SheetOptions {
	/**
	 * Which part of the sheet to use.
	 * @example
	 * "A1:B10" = A range from cell A1 through B10
	 * "5:7" = Rows 5-7
	 * "D:F" = Columns D-F
	 * @see {@link https://developers.google.com/chart/interactive/docs/spreadsheets#query-source-ranges}
	 */
	range?: string;
	/**
	 * How many rows are header rows. If not specified, Google Sheets will guess from the header and body type.
	 * @remarks If all your columns are string data, the spreadsheet might have difficulty determining which rows are header rows without this parameter.
	 * @see {@link https://developers.google.com/chart/interactive/docs/spreadsheets#queryurlformat}
	 */
	headers?: number;
}

/**
 * Define a spreadsheet corresponded to a Google Sheets document.
 * @param sheetsId - Google Sheets ID can be found from the URL `docs.google.com/spreadsheets/d/{sheetsId}/`
 * @param globalOptions - {@link SheetOptions} which will be applied in every `.get` call
 * @returns A spreadsheet object
 * @example
 * ```ts
 * const sheets = Spreadsheet('google-sheets-id');
 * ```
 */
export function Spreadsheet(
	sheetsId: string,
	globalOptions: SheetOptions = {},
) {
	return {
		/**
		 * Fetch and parse the sheet from given sheet name.
		 * @param sheet - The sheet name
		 * @param schema - Output schema mapping of each row
		 * @param options - {@link SheetOptions}
		 * @returns An array of objects corresponded to the sheet definition
		 * @throws If fail to fetch or parse the sheet
		 * @example
		 * ```ts
		 * const output = await sheets.get('SheetName', schema);
		 * ```
		 */
		async get<T extends TCsvSchema>(
			sheet: string,
			schema: T,
			options: SheetOptions = {},
		): Promise<StaticDecode<T>[]> {
			const { range, headers, ...fetcherOptions } = {
				...globalOptions,
				...options,
			};

			const queryParams = new URLSearchParams({
				sheet,
				tqx: 'out:csv',
			});

			if (range !== undefined) queryParams.append('range', range);
			if (headers !== undefined) queryParams.append('headers', `${headers}`);

			try {
				const res = await fetchCsv(
					`https://docs.google.com/spreadsheets/d/${sheetsId}/gviz/tq?${queryParams.toString()}`,
					schema,
					fetcherOptions,
				);

				return res;
			} catch (e) {
				throw Error(
					`Could not get sheet "${sheet}" -> ${e instanceof Error ? e.message : ''}`.trim(),
				);
			}
		},
	};
}
