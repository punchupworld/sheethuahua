import { Kind, type Static, type TObject } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import { csvParseRows } from 'd3-dsv';
import { checkColumnSchema, type TColumn } from './column';

const ROW_INDEX_OFFSET = 1;

/**
 * Parse the CSV string according to the given table
 * @param content - A string of CSV file content
 * @param schema - Output schema mapping of each row
 * @returns An array of given schema
 * @throws If fail to parse the table
 */
export function parseCsv<T extends TObject>(
	content: string,
	schema: T,
): Static<T>[] {
	const [headerRow, ...bodyRows] = csvParseRows(content);

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
