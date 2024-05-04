import { Type, type Static, type TObject } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import { csvParse } from 'd3-dsv';
import type { TColumnsDefinition } from './table';

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
		throw new Error(`${res.status} ${res.statusText}`);
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
		throw [...Value.Errors(outputSchema, rows)];
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
