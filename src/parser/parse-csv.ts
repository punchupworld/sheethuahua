import type { StaticDecode, TObject, TTuple } from '@sinclair/typebox';
import {
	Decode,
	TransformDecodeCheckError,
	TransformDecodeError,
} from '@sinclair/typebox/value';
import { csvParseRows } from 'd3-dsv';
import type { TColumn } from '../schema/column';
import { collectColumnsInSchema } from '../utils/traverser';

const ROW_INDEX_OFFSET = 1;
/**
 * Supported schema for CSV parsers
 */
export type TCsvSchema = TColumn | TObject | TTuple;

/**
 * Options for parseCsv function
 */
interface ParseOptions {
	/**
	 * Enable debugging logs
	 * @defaultValue false
	 */
	debug?: boolean;
}

/**
 * Parse the CSV string according to the given schema
 * @param content - A string of CSV file content
 * @param schema - Output schema mapping of each row
 * @returns An array of given schema
 * @throws If fail to parse the schema
 * @example
 * ```ts
 * const output = parseCsv('ID,Name\n1,A\n2,B\n', schema);
 * ```
 */
export function parseCsv<T extends TCsvSchema>(
	content: string,
	schema: T,
	options?: ParseOptions,
): StaticDecode<T>[] {
	const [headerRow, ...bodyRows] = csvParseRows(content);

	if (options?.debug) {
		console.debug(
			`[DEBUG] Found ${bodyRows.length + 1} rows (1 header + ${bodyRows.length} body)`,
		);
		console.debug(
			`[DEBUG] Headers: ${headerRow.map((header, i) => `${header} (${i})`).join(', ')}`,
		);
	}

	const columnMatching = new Map<string, number>();

	collectColumnsInSchema(schema, ({ columnName }) => {
		const index = headerRow.indexOf(columnName);

		if (index < 0) {
			throw new Error(`Column "${columnName}" is not found`);
		}

		columnMatching.set(columnName, index);
	});

	if (options?.debug) {
		console.debug(
			`[DEBUG] Schema's column and header index matching: ${[...columnMatching.entries()].map((pair) => pair.join(' => ')).join(', ')}`,
		);
	}

	return bodyRows.map((cols, rowIndex) =>
		collectColumnsInSchema(schema, ({ columnName, ...transform }) => {
			const trimmedValue =
				cols[columnMatching.get(columnName) as number].trim();

			try {
				return Decode(transform, trimmedValue);
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
}
