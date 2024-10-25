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

	const columnIndexMap = new Map<string, number>(
		Object.values(schema.properties).reduce<[string, number][]>(
			(pair, value) => {
				if (checkColumnSchema(value)) {
					const name = (value as TColumn).columnName;
					const index = headerRow.indexOf(name);

					if (index < 0) {
						throw `Column "${name}" is referenced in the schema but does not found`;
					}

					pair.push([name, index]);
				}
				return pair;
			},
			[],
		),
	);

	const parsedData = bodyRows.map((cols, rowIndex) =>
		Object.entries(schema.properties).reduce<Record<string, unknown>>(
			(obj, [key, value]) => {
				if (checkColumnSchema(value)) {
					const name = (value as TColumn).columnName;
					const index = columnIndexMap.get(key) as number;
					const trimmedValue = cols[index].trim();

					if (!trimmedValue && schema.required?.includes(key)) {
						throw `Column ${name} cannot be empty (row ${rowIndex + ROW_INDEX_OFFSET})`;
					}

					if (trimmedValue) {
						const parsedValue = Value.Convert(value, trimmedValue);
						const error = Value.Errors(value, parsedValue).First();

						if (error) {
							throw `Unexpected value in the column ${name}, "${error.value}" is not a ${error.schema[Kind].toLowerCase()} (row ${rowIndex + ROW_INDEX_OFFSET})`;
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
