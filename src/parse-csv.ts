import { Kind, type Static, type TObject } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import { csvParseRows } from 'd3-dsv';
import { checkColumnSchema, type TColumn } from './column';

const ROW_INDEX_OFFSET = 1;

interface ColumnProperty {
	name: string;
	index: number;
}

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

	const columnPropertyMap = new Map<string, ColumnProperty>(
		Object.entries(schema.properties).reduce<[string, ColumnProperty][]>(
			(pair, [key, value]) => {
				if (checkColumnSchema(value)) {
					const name = (value as TColumn).columnName ?? key;
					const index = headerRow.indexOf(name);

					if (index < 0) {
						throw `Column "${name}" is referenced in the schema but does not found`;
					}

					pair.push([key, { name, index }]);
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
					const column = columnPropertyMap.get(key) as ColumnProperty;
					const trimmedValue = cols[column.index].trim();

					if (!trimmedValue && schema.required?.includes(key)) {
						throw `Column ${column.name} cannot be empty (row ${rowIndex + ROW_INDEX_OFFSET})`;
					}

					if (trimmedValue) {
						const parsedValue = Value.Convert(value, trimmedValue);
						const error = Value.Errors(value, parsedValue).First();

						if (error) {
							throw `Unexpected value in the column ${column.name}, "${error.value}" is not a ${error.schema[Kind].toLowerCase()} (row ${rowIndex + ROW_INDEX_OFFSET})`;
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
