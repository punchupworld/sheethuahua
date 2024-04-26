import { Type, type Static, type TSchema } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import { autoType, csvParse } from 'd3-dsv';

export async function parseCSVFromUrl<C extends TSchema>(
	url: string,
	columnsSchema: C,
): Promise<Static<C>[]> {
	const res = await fetch(url);

	if (!res.ok) {
		throw new Error(`${res.status} ${res.statusText}`);
	}

	return parseCSVFromString(await res.text(), columnsSchema);
}

export async function parseCSVFromString<C extends TSchema>(
	csvString: string,
	columnsSchema: C,
): Promise<Static<C>[]> {
	const resSchema = Type.Array(columnsSchema);
	const rows = csvParse(csvString, autoType);

	if (!Value.Check(resSchema, rows)) {
		throw [...Value.Errors(resSchema, rows)];
	}

	return rows;
}
