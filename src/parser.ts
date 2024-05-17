import { Type, TypeGuard, type Static } from '@sinclair/typebox';
import { Value, type ValueErrorIterator } from '@sinclair/typebox/value';
import { csvParse } from 'd3-dsv';
import type { TAnonymousTable, TColumnsDefinition } from './table';

const ROW_INDEX_OFFSET = 1;
const NULL_ERROR_ALIAS = 'empty';

/**
 * Options for CSV parser
 */
export interface CSVParserOptions {
	/**
	 * Trim whitespaces of each cell before parsing.
	 * @defaultValue true
	 */
	trim?: boolean;
	/**
	 * Include columns that are not defined in the table.
	 * @defaultValue false
	 */
	includeUnknownColumns?: boolean;
}

/**
 * Options related CSV fetcher
 */
export interface CSVFetcherOptions extends CSVParserOptions {
	/**
	 * Options for fetch() request
	 * @see {@link FetchRequestInit}
	 */
	fetchRequestInit?: FetchRequestInit;
}

const defaultCSVParserOptions: {
	[Property in keyof CSVParserOptions]-?: CSVParserOptions[Property];
} = {
	trim: true,
	includeUnknownColumns: false,
};

/**
 * Fetch CSV from the URL and parse according to the given table
 * @param url - URL to the CSV file
 * @param columnsSchema - An anonymous table ({@link TAnonymousTable})
 * @param options - {@link CSVFetcherOptions}
 * @returns An array of objects corresponded to the table definition
 * @throws If fail to fetch or parse the table
 */
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

/**
 * Parse the CSV string according to the given table
 * @param csvString - A string of CSV file content
 * @param columnsSchema - An anonymous table ({@link TAnonymousTable})
 * @param options - {@link CSVParserOptions}
 * @returns An array of objects corresponded to the table definition
 * @throws If fail to parse the table
 */
export function parseCSVFromString<
	C extends TAnonymousTable<TColumnsDefinition>,
>(
	csvString: string,
	columnsSchema: C,
	options: CSVParserOptions = {},
): Promise<Static<C>[]> {
	return new Promise((resolve, reject) => {
		const { trim, includeUnknownColumns } = {
			...defaultCSVParserOptions,
			...options,
		};

		const outputSchema = Type.Array(columnsSchema);

		const data = Value.Convert(
			outputSchema,
			csvParse(csvString, processRow(trim)),
		);

		if (!includeUnknownColumns) {
			Value.Clean(outputSchema, data);
		}

		if (!Value.Check(outputSchema, data)) {
			reject(Error(formatParsingError(Value.Errors(outputSchema, data))));
		} else {
			resolve(data);
		}
	});
}

const processRow = (trim: boolean) => (obj: Record<any, string>) =>
	Object.entries(obj).reduce<Record<any, string | null>>(
		(newObj, [key, value]) => {
			const newValue = trim ? value.trim() : value;
			newObj[key] = newValue.length > 0 ? newValue : null;
			return newObj;
		},
		{},
	);

const formatParsingError = (errors: ValueErrorIterator): string =>
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

			return `- Row ${+row + ROW_INDEX_OFFSET} column ${column} is ${value ?? NULL_ERROR_ALIAS} (expect ${expectation})`;
		}),
	].join('\n');

const listFormatter = new Intl.ListFormat('en', {
	type: 'disjunction',
});
