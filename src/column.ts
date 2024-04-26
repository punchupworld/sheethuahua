import { Type } from '@sinclair/typebox';

type PropertyReturnType<T extends { [key: string]: (...arg: any) => any }> =
	ReturnType<T[keyof T]>;

const PrimitiveColumn = {
	String: Type.String,
	Number: Type.Number,
	Boolean: Type.Boolean,
	Date: Type.Date,
};

type TPrimitiveColumn = PropertyReturnType<typeof PrimitiveColumn>;

export const Column = {
	...PrimitiveColumn,
	Nullable: <T extends TPrimitiveColumn>(columnSchema: T) =>
		Type.Union([columnSchema, Type.Null()]),
};

export type TColumn = PropertyReturnType<typeof Column>;
