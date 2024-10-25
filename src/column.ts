import type { TSchema } from '@sinclair/typebox';

const ColumnKind = 'columnName';

/**
 * Column schema type
 */
export type TColumn<T extends TSchema = TSchema> = T & {
	[ColumnKind]: string;
};

/**
 * Map with CSV Column with the corresponded schema
 * @param name - Column name
 * @param schema - Column schema
 */
export function Column<T extends TSchema>(name: string, schema: T): TColumn<T> {
	return {
		...schema,
		[ColumnKind]: name,
	};
}

export function checkColumnSchema(value: unknown): boolean {
	return typeof value === 'object' && value !== null && ColumnKind in value;
}
