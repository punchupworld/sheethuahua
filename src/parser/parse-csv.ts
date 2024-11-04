import {
	TypeGuard,
	type StaticDecode,
	type TObject,
	type TTuple,
} from '@sinclair/typebox';
import {
	TransformDecodeCheckError,
	TransformDecodeError,
	Value,
} from '@sinclair/typebox/value';
import { csvParseRows } from 'd3-dsv';
import { ColumnKind, type TColumn } from '../schema/column';

const ROW_INDEX_OFFSET = 1;
/**
 * Supported schema for CSV parsers
 */
export type TCsvSchema = TColumn | TObject | TTuple;

/**
 * Parse the CSV string according to the given table
 * @param content - A string of CSV file content
 * @param schema - Output schema mapping of each row
 * @returns An array of given schema
 * @throws If fail to parse the table
 * @example
 * ```ts
 * const output = parseCsv('ID,Name\n1,A\n2,B\n', schema);
 * ```
 */
export function parseCsv<T extends TCsvSchema>(
	content: string,
	schema: T,
): StaticDecode<T>[] {
	const [headerRow, ...bodyRows] = csvParseRows(content);

	const columnMatching = new Map<string, number>();

	collectColumnsInSchema(schema, ({ columnName }) => {
		const index = headerRow.indexOf(columnName);

		if (index < 0) {
			throw new Error(`Column "${columnName}" is not found`);
		}

		columnMatching.set(columnName, index);
	});

	const parsedData = bodyRows.map((cols, rowIndex) =>
		collectColumnsInSchema(schema, ({ columnName, ...transform }) => {
			const trimmedValue =
				cols[columnMatching.get(columnName) as number].trim();

			try {
				return Value.Decode(transform, trimmedValue);
			} catch (e) {
				if (e instanceof TransformDecodeCheckError) {
					throw new Error(
						`Column "${columnName}" cannot be empty (row ${rowIndex + ROW_INDEX_OFFSET})`,
					);
				}
				if (e instanceof TransformDecodeError) {
					throw new Error(
						`${e.message}, received "${trimmedValue}" (column "${columnName}", row ${rowIndex + ROW_INDEX_OFFSET})`,
					);
				}
				throw e;
			}
		}),
	);

	return parsedData;
}

function collectColumnsInSchema(
	schema: unknown,
	processColumn: (columnSchema: TColumn) => StaticDecode<TColumn> | undefined,
): unknown {
	if (checkColumnSchema(schema)) {
		return processColumn(schema as TColumn);
	}

	if (TypeGuard.IsObject(schema)) {
		return Object.entries(schema.properties).reduce<Record<string, unknown>>(
			(obj, [key, value]) => {
				const output = collectColumnsInSchema(value, processColumn);

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
				collectColumnsInSchema(value, processColumn),
			) || []
		);
	}
}

function checkColumnSchema(value: unknown): boolean {
	return typeof value === 'object' && value !== null && ColumnKind in value;
}
