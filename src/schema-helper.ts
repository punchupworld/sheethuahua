import { Literal, Union, type TLiteralValue } from '@sinclair/typebox';

export function OneOf<T extends TLiteralValue[]>(values: [...T]) {
	return Union(values.map((value) => Literal(value)));
}
