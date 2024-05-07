import { Type, TypeGuard, type Static } from '@sinclair/typebox';
import { Value, type ValueErrorIterator } from '@sinclair/typebox/value';
import { csvParseRows } from 'd3-dsv';
import type { TAnonymousTable, TColumnsDefinition } from './table';

const ROW_INDEX_OFFSET = 1;
const NULL_ERROR_ALIAS = 'empty';

export interface CSVParserOptions {
	trim?: boolean;
	includeUnknownColumns?: boolean;
	headerRowNumber?: number;
	firstBodyRowNumber?: number;
	lastBodyRowNumber?: number;
}

export interface CSVFetcherOptions extends CSVParserOptions {
	fetchRequestInit?: FetchRequestInit;
}

const defaultCSVParserOptions: {
	[Property in keyof Omit<
		CSVParserOptions,
		'lastBodyRowNumber'
	>]-?: CSVParserOptions[Property];
} = {
	trim: true,
	includeUnknownColumns: false,
	headerRowNumber: 1,
	firstBodyRowNumber: 2,
};

export async function parseCSVFromUrl<
	C extends TAnonymousTable<TColumnsDefinition>,
>(
	url: string,
	columnsSchema: C,
	options: CSVFetcherOptions = {},
): Promise<Static<C>[]> {
	const { fetchRequestInit, ...parserOptions } = options;
	const res = await fetch(url, fetchRequestInit);

	if (!res.ok) {
		throw new Error(
			`Failed to fetch (${res.status} ${res.statusText}), please recheck if the source is corrected and publicly accessible.`,
		);
	}

	return parseCSVFromString(await res.text(), columnsSchema, parserOptions);
}

export function parseCSVFromString<
	C extends TAnonymousTable<TColumnsDefinition>,
>(
	csvString: string,
	columnsSchema: C,
	options: CSVParserOptions = {},
): Static<C>[] {
	const {
		trim,
		includeUnknownColumns,
		headerRowNumber,
		firstBodyRowNumber,
		lastBodyRowNumber,
	} = {
		...defaultCSVParserOptions,
		...options,
	};

	if (headerRowNumber >= firstBodyRowNumber) {
		throw Error(
			`headerRowNumber (${headerRowNumber}) must be less than firstBodyRowNumber (${firstBodyRowNumber}).`,
		);
	} else if (lastBodyRowNumber && firstBodyRowNumber >= lastBodyRowNumber) {
		throw Error(
			`firstBodyRowNumber (${firstBodyRowNumber}) must be less than lastBodyRowNumber (${lastBodyRowNumber}).`,
		);
	}

	const rows = csvParseRows(csvString, (row) =>
		trim ? row.map((cell) => cell.trim()) : row,
	);

	if (rows.length < 2) {
		throw Error(
			`Source table much have at least 2 rows (1 header + 1 body), but currently have ${rows.length}.`,
		);
	} else if (lastBodyRowNumber && lastBodyRowNumber > rows.length) {
		throw Error(
			`lastBodyRowNumber (${lastBodyRowNumber}) must be in the table range (${ROW_INDEX_OFFSET}-${rows.length}).`,
		);
	} else if (firstBodyRowNumber > rows.length) {
		throw Error(
			`firstBodyRowNumber (${firstBodyRowNumber}) must be in the table range (${ROW_INDEX_OFFSET}-${rows.length}).`,
		);
	}

	const headerRow = rows[headerRowNumber - ROW_INDEX_OFFSET];

	const bodyRows = rows
		.slice(
			firstBodyRowNumber - ROW_INDEX_OFFSET,
			lastBodyRowNumber && lastBodyRowNumber + 1 - ROW_INDEX_OFFSET,
		)
		.map((row) => row.map((cell) => (cell.length > 0 ? cell : null)));

	const outputSchema = Type.Array(columnsSchema);

	const data = Value.Convert(
		outputSchema,
		bodyRows.map((row) =>
			headerRow.reduce((obj, key, i) => ({ ...obj, [key]: row[i] }), {}),
		),
	);

	if (!includeUnknownColumns) {
		Value.Clean(outputSchema, data);
	}

	if (!Value.Check(outputSchema, data)) {
		throw Error(
			formatParsingError(Value.Errors(outputSchema, data), firstBodyRowNumber),
		);
	}

	return data;
}

const formatParsingError = (
	errors: ValueErrorIterator,
	firstBodyRowNumber: number,
): string =>
	[
		'The following values mismatch the column type:',
		...[...errors].map(({ path, schema, value }) => {
			const [row, column] = path.replace('/', '').split('/');

			const expectation = TypeGuard.IsUnion(schema)
				? listFormatter.format(
						schema.anyOf.map((option) =>
							TypeGuard.IsLiteral(option)
								? `${option.const}`
								: TypeGuard.IsNull(option)
									? NULL_ERROR_ALIAS
									: option.type,
						),
					)
				: `a ${schema.type}`;

			return `- Row ${+row + firstBodyRowNumber} column ${column} is ${value ?? NULL_ERROR_ALIAS} (expect ${expectation})`;
		}),
	].join('\n');

const listFormatter = new Intl.ListFormat('en', {
	type: 'disjunction',
});
