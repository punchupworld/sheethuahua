import { Type, TypeGuard, type Static, type TObject } from '@sinclair/typebox';
import { Value, type ValueErrorIterator } from '@sinclair/typebox/value';
import { csvParse } from 'd3-dsv';
import type { TColumnsDefinition } from './table';

const BODY_ROW_OFFSET = 2;
const NULL_ERROR_ALIAS = 'empty';

export interface CSVParserOptions {
	trim?: boolean;
	excludeUnknownColumns?: boolean;
}

const defaultCSVParserOptions: Record<keyof CSVParserOptions, boolean> = {
	trim: true,
	excludeUnknownColumns: true,
};

export async function parseCSVFromUrl<C extends TObject<TColumnsDefinition>>(
	url: string,
	columnsSchema: C,
	options?: CSVParserOptions,
): Promise<Static<C>[]> {
	const res = await fetch(url);

	if (!res.ok) {
		throw new Error(
			`Failed to fetch (${res.status} ${res.statusText}), please recheck if the source is corrected and publicly accessible.`,
		);
	}

	return parseCSVFromString(await res.text(), columnsSchema, options);
}

export function parseCSVFromString<C extends TObject<TColumnsDefinition>>(
	csvString: string,
	columnsSchema: C,
	options: CSVParserOptions = {},
): Static<C>[] {
	const outputSchema = Type.Array(columnsSchema);
	const mergedOptions = {
		...defaultCSVParserOptions,
		...options,
	};

	const rows = Value.Convert(
		outputSchema,
		csvParse(csvString, processRow(mergedOptions.trim)),
	);

	if (mergedOptions.excludeUnknownColumns) {
		Value.Clean(outputSchema, rows);
	}

	if (!Value.Check(outputSchema, rows)) {
		throw Error(formatParsingError(Value.Errors(outputSchema, rows)));
	}

	return rows;
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

			return `- Row ${+row + BODY_ROW_OFFSET} column ${column} is ${value ?? NULL_ERROR_ALIAS} (expect ${expectation})`;
		}),
	].join('\n');

const listFormatter = new Intl.ListFormat('en', {
	type: 'disjunction',
});
