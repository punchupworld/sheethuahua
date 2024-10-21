import type { TSchema } from '@sinclair/typebox';

const ColumnKind = 'columnName';

/**
 * Column schema type
 */
export type TColumn<T extends TSchema = TSchema> = T & {
	[ColumnKind]: string | null;
};

/**
 * Map CSV with Column with the corresponded schema
 * @param schema - Column schema
 */
export function Column<T extends TSchema>(schema: T): TColumn<T>;
/**
 * Map with CSV Column with the corresponded schema
 * @param name - Column name
 * @param schema - Column schema
 */
export function Column<T extends TSchema>(name: string, schema: T): TColumn<T>;
export function Column<T extends TSchema>(arg1: string | T, arg2?: T): unknown {
	if (typeof arg1 === 'string') {
		return {
			...arg2,
			[ColumnKind]: arg1,
		};
	}
	return {
		...arg1,
		[ColumnKind]: null,
	};
}

export function checkColumnSchema(value: unknown): boolean {
	return typeof value === 'object' && value !== null && ColumnKind in value;
}
