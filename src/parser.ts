import { Kind, type Static, type TObject } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import { csvParseRows } from 'd3-dsv';
import { checkColumnSchema, type TColumn } from './column';

const ROW_INDEX_OFFSET = 1;

/**
 * Fetch CSV from the URL and parse according to the given table
 * @param url - URL to the CSV file
 * @param schema - Output schema mapping of each row
 * @param fetchRequestInit - Options for fetch() request  {@link FetchRequestInit}
 * @returns An array of objects corresponded to the table definition
 * @throws If fail to fetch or parse the table
 */
export async function parseCSVFromUrl<T extends TObject>(
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

	return parseCSVFromString(await res.text(), schema);
}

/**
 * Parse the CSV string according to the given table
 * @param csvString - A string of CSV file content
 * @param schema - Output schema mapping of each row
 * @returns An array of given schema
 * @throws If fail to parse the table
 */
export function parseCSVFromString<T extends TObject>(
	csvString: string,
	schema: T,
): Static<T>[] {
	const [headerRow, ...bodyRows] = csvParseRows(csvString);

	const parsedData = bodyRows.map((cols, rowIndex) =>
		Object.entries(schema.properties).reduce<Record<string, unknown>>(
			(obj, [key, value]) => {
				if (checkColumnSchema(value)) {
					const { columnName, ...columnSchema } = value as TColumn;
					const columnIndex = headerRow.indexOf(columnName ?? key);

					if (columnIndex < 0) {
						throw `Column "${columnName ?? key}" not found.`;
					}

					const trimmedValue = cols[columnIndex].trim();

					if (!trimmedValue.length && schema.required?.includes(key)) {
						throw `Column ${columnName} cannot be empty (row ${rowIndex + ROW_INDEX_OFFSET})`;
					}

					if (trimmedValue.length) {
						const parsedValue = Value.Convert(columnSchema, trimmedValue);
						const error = Value.Errors(columnSchema, parsedValue).First();

						if (error) {
							throw `Unexpected value in the column ${columnName}, "${error.value}" is not a ${error.schema[Kind].toLowerCase()} (row ${rowIndex + ROW_INDEX_OFFSET})`;
						}

						obj[key] = parsedValue;
					}
				}
				return obj;
			},
			{},
		),
	);

	return parsedData;
}
