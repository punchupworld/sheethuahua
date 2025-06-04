import type { StaticDecode, TSchema } from '@sinclair/typebox';
import { Encode, TransformEncodeError } from '@sinclair/typebox/value';
import { csvFormatRows } from 'd3-dsv';
import type { TCsvSchema } from '../parser/parse-csv';
import {
	collectColumnsInSchema,
	getValueFromPath,
	type ValuePath,
} from '../utils/traverser';

/**
 * Format an array to CSV string
 * @param array - An array of data
 * @param schema - Output schema mapping of each row
 * @returns A CSV string
 * @throws If fail to format the array
 * @example
 * ```ts
 * const output = formatAsCsv([{ id: 1, name: 'a' }], schema);
 * ```
 */
export function formatToCsv<T extends TCsvSchema>(
	array: StaticDecode<T>[],
	schema: T,
): string {
	const pathSchemaMap = new Map<string, { schema: TSchema; path: ValuePath }>();

	collectColumnsInSchema(schema, ({ columnName, ...schema }, path) => {
		pathSchemaMap.set(columnName, { schema, path });
	});

	const headerRow = [...pathSchemaMap.keys()];

	const bodyRows = array.map((rowData) =>
		[...pathSchemaMap.entries()].map(([columnName, { schema, path }]) => {
			const value = getValueFromPath(rowData, path);

			try {
				return Encode(schema, [], value) as string;
			} catch (e) {
				if (e instanceof TransformEncodeError) {
					throw new Error(
						`${e.message} for column "${columnName}" but received ${value}`,
					);
				}
				throw e;
			}
		}),
	);

	return csvFormatRows([headerRow, ...bodyRows]);
}
