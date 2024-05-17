import { Type, TypeGuard, type Static } from '@sinclair/typebox';
import { Value, type ValueErrorIterator } from '@sinclair/typebox/value';
import { csvParse } from 'd3-dsv';
import type { TAnonymousTable, TColumnsDefinition } from './table';

const ROW_INDEX_OFFSET = 1;
const NULL_ERROR_ALIAS = 'empty';

export interface CSVParserOptions {
	trim?: boolean;
	includeUnknownColumns?: boolean;
}

export interface CSVFetcherOptions extends CSVParserOptions {
	fetchRequestInit?: FetchRequestInit;
}

const defaultCSVParserOptions: {
	[Property in keyof CSVParserOptions]-?: CSVParserOptions[Property];
} = {
	trim: true,
	includeUnknownColumns: false,
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
		throw Error(formatParsingError(Value.Errors(outputSchema, data)));
	}

	return data;
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
