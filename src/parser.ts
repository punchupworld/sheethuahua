import { Type, type Static, type TObject } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import { autoType, csvParse } from 'd3-dsv';
import type { TColumnsDefinition } from './table';

export async function parseCSVFromUrl<S extends TObject<TColumnsDefinition>>(
	url: string,
	columnsSchema: S,
): Promise<Static<S>[]> {
	const res = await fetch(url);

	if (!res.ok) {
		throw new Error(`${res.status} ${res.statusText}`);
	}

	return parseCSVFromString(await res.text(), columnsSchema);
}

export async function parseCSVFromString<S extends TObject<TColumnsDefinition>>(
	csvString: string,
	columnsSchema: S,
): Promise<Static<S>[]> {
	const resSchema = Type.Array(columnsSchema);
	const rows = csvParse(csvString, autoType);

	if (!Value.Check(resSchema, rows)) {
		throw [...Value.Errors(resSchema, rows)];
	}

	return rows;
}
