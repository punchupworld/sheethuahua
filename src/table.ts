import {
	Type,
	type TProperties,
	type TObject,
	type TConst,
	type TRecordOrObject,
} from '@sinclair/typebox';

export type TableDefition<
	N extends string,
	S extends TProperties
> = TRecordOrObject<TConst<N>, TObject<S>>;

export function Table<N extends string, S extends TProperties>(
	name: N,
	schema: S
) {
	return Type.Record(Type.Const(name), Type.Object(schema));
}
