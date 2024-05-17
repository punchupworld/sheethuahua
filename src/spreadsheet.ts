import {
	Type,
	TypeGuard,
	type Intersect,
	type Static,
	type TIndexFromPropertyKey,
	type TKeyOf,
} from '@sinclair/typebox';
import { parseCSVFromUrl, type CSVFetcherOptions } from './parser';
import type { TNamedTable } from './table';

/**
 * Options for sheet getter
 */
interface SheetOptions extends CSVFetcherOptions {
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
 * Define a spreadsheet coresponded to a Google Sheets document.
 * @param sheetsId - Google Sheets ID can be found from the URL `docs.google.com/spreadsheets/d/{sheetsId}/`
 * @param tables - An array of tables coresponded to each sheets inside the spreadsheet
 * @param globalOptions - {@link SheetOptions} which will be applied in every `.get` call
 * @returns A spreadsheet object
 */
export function Spreadsheet<T extends TNamedTable<any, any>[]>(
	sheetsId: string,
	tables: [...T],
	globalOptions: SheetOptions = {},
) {
	const tablesSchema = Type.Intersect(tables);

	return {
		/**
		 * Fetch and parse the sheet from given table name.
		 * @param tableName - The table name
		 * @param options - {@link SheetOptions} which will overwrite the spreadsheet's globalOptions
		 * @returns An array of objects corresponded to the table definition
		 * @throws If fail to fetch or parse the table
		 */
		async get<N extends Static<TKeyOf<typeof tablesSchema>>>(
			tableName: N,
			options: SheetOptions = {},
		): Promise<Static<TIndexFromPropertyKey<Intersect<T>, N>>[]> {
			const columnsSchema = Type.Index(tablesSchema, [tableName]);

			if (TypeGuard.IsNever(columnsSchema)) {
				throw Error(
					`Table "${tableName}" is not defined when calling Spreadsheet function`,
				);
			}

			const { range, headers, ...fetcherOptions } = {
				...globalOptions,
				...options,
			};

			const queryParams = new URLSearchParams({
				sheet: tableName,
				tqx: 'out:csv',
			});

			if (range !== undefined) queryParams.append('range', range);
			if (headers !== undefined) queryParams.append('headers', `${headers}`);

			try {
				const res = await parseCSVFromUrl(
					`https://docs.google.com/spreadsheets/d/${sheetsId}/gviz/tq?${queryParams.toString()}`,
					columnsSchema,
					fetcherOptions,
				);

				return res;
			} catch (e) {
				throw Error(
					`Could not get "${tableName}" table. ${e instanceof Error ? e.message : ''}`.trim(),
				);
			}
		},
	};
}
