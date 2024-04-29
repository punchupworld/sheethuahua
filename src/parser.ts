import { Type, type Static, type TObject } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import { csvParse } from 'd3-dsv';
import type { TColumnsDefinition } from './table';

export async function parseCSVFromUrl<C extends TObject<TColumnsDefinition>>(
	url: string,
	columnsSchema: C,
): Promise<Static<C>[]> {
	const res = await fetch(url);

	if (!res.ok) {
		throw new Error(`${res.status} ${res.statusText}`);
	}

	return parseCSVFromString(await res.text(), columnsSchema);
}

export async function parseCSVFromString<C extends TObject<TColumnsDefinition>>(
	csvString: string,
	columnsSchema: C,
): Promise<Static<C>[]> {
	const outputSchema = Type.Array(columnsSchema);
	const rows = Value.Convert(outputSchema, csvParse(csvString));

	if (!Value.Check(outputSchema, rows)) {
		throw [...Value.Errors(outputSchema, rows)];
	}

	return rows;
}
