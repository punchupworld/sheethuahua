import {
	Kind,
	TypeGuard,
	type Static,
	type TObject,
	type TSchema,
} from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import { csvParseRows } from 'd3-dsv';
import { checkColumnSchema, type TColumn } from './column';

const ROW_INDEX_OFFSET = 1;

export type TCsvSchema = TColumn | TObject | TSchema;

/**
 * Parse the CSV string according to the given table
 * @param content - A string of CSV file content
 * @param schema - Output schema mapping of each row
 * @returns An array of given schema
 * @throws If fail to parse the table
 */
export function parseCsv<T extends TCsvSchema>(
	content: string,
	schema: T,
): Static<T>[] {
	const [headerRow, ...bodyRows] = csvParseRows(content);

	const columnIndexMap = new Map<string, number>();

	traverseSchemaWithColumn(schema, ({ columnName }) => {
		const index = headerRow.indexOf(columnName);

		if (index < 0) {
			throw `Column "${columnName}" is referenced in the schema but does not found`;
		}

		columnIndexMap.set(columnName, index);
	});

	const parsedData = bodyRows.map((cols, rowIndex) =>
		traverseSchemaWithColumn(
			schema,
			({ columnName, ...columnSchema }, isOptional) => {
				const index = columnIndexMap.get(columnName) as number;
				const trimmedValue = cols[index].trim();

				if (!trimmedValue && !isOptional) {
					throw `Column "${columnName}" cannot be empty (row ${rowIndex + ROW_INDEX_OFFSET})`;
				}

				if (trimmedValue) {
					const parsedValue = Value.Convert(columnSchema, trimmedValue);
					const error = Value.Errors(columnSchema, parsedValue).First();

					if (error) {
						throw `Unexpected value in the column "${columnName}", "${error.value}" is not a ${error.schema[Kind].toLowerCase()} (row ${rowIndex + ROW_INDEX_OFFSET})`;
					}

					return parsedValue;
				}
			},
		),
	);

	return parsedData;
}

function traverseSchemaWithColumn(
	schema: unknown,
	processColumn: (
		columnSchema: TColumn,
		optional?: boolean,
	) => Static<TColumn> | undefined,
	optional?: boolean,
): unknown {
	if (checkColumnSchema(schema)) {
		return processColumn(schema as TColumn, optional);
	}

	if (TypeGuard.IsObject(schema)) {
		return Object.entries(schema.properties).reduce<Record<string, unknown>>(
			(obj, [key, value]) => {
				const output = traverseSchemaWithColumn(
					value,
					processColumn,
					!schema.required || !schema.required.includes(key),
				);

				if (output !== undefined) {
					obj[key] = output;
				}

				return obj;
			},
			{},
		);
	}

	if (TypeGuard.IsTuple(schema)) {
		return (
			schema.items?.map((value) =>
				traverseSchemaWithColumn(value, processColumn),
			) || []
		);
	}
}
