export namespace types {
	export type StaticType<T, TT> = { new (...args: any[]): T } & TT; // Does it work?
	export type ArrayElement<AT extends readonly unknown[]> = AT extends readonly (infer ElementType)[]
		? ElementType
		: never;
}
