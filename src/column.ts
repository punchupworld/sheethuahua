import { Type } from '@sinclair/typebox';

export const Column = {
	String: Type.String,
	Number: Type.Number,
	Boolean: Type.Boolean,
	Date: Type.Date,
};

export type ColumnType = ReturnType<(typeof Column)[keyof typeof Column]>;
