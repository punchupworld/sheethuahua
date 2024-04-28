import { Type, type Static, type TObject } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import { autoType, csvParse } from 'd3-dsv';
import type { TColumnsDefinition } from './table';

export async function parseCSVFromUrl<C extends TObject<TColumnsDefinition>>(
	url: string,
	columns: C,
): Promise<Static<C>[]> {
	const res = await fetch(url);

	if (!res.ok) {
		throw new Error(`${res.status} ${res.statusText}`);
	}

	return parseCSVFromString(await res.text(), columns);
}

export async function parseCSVFromString<C extends TObject<TColumnsDefinition>>(
	csvString: string,
	columns: C,
): Promise<Static<C>[]> {
	const resSchema = Type.Array(columns);
	const rows = csvParse(csvString, autoType);

	if (!Value.Check(resSchema, rows)) {
		throw [...Value.Errors(resSchema, rows)];
	}

	return rows;
}
