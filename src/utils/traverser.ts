import { TypeGuard, type StaticDecode } from '@sinclair/typebox';
import { ColumnKind, type TColumn } from '../schema/column';

export type ValuePath = (string | number)[];

export function collectColumnsInSchema(
	schema: unknown,
	processColumn: (
		columnSchema: TColumn,
		path: ValuePath,
	) => StaticDecode<TColumn> | undefined,
	path: ValuePath = [],
): unknown {
	if (checkColumnSchema(schema)) {
		return processColumn(schema as TColumn, path);
	}

	if (TypeGuard.IsObject(schema)) {
		return Object.entries(schema.properties).reduce<Record<string, unknown>>(
			(obj, [key, value]) => {
				const output = collectColumnsInSchema(value, processColumn, [
					...path,
					key,
				]);

				if (output !== undefined) {
					obj[key] = output;
				}

				return obj;
			},
			{},
		);
	}

	if (TypeGuard.IsTuple(schema)) {
		return (
			schema.items?.map((value, index) =>
				collectColumnsInSchema(value, processColumn, [...path, index]),
			) || []
		);
	}
}

export function getValueFromPath(input: any, path: ValuePath): unknown {
	return path.reduce((parent, key) => parent?.[key], input);
}

function checkColumnSchema(value: unknown): boolean {
	return typeof value === 'object' && value !== null && ColumnKind in value;
}
