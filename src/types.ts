export type StaticType<T, TT> = { new(...args: any[]): T } & TT; // Does it work?

export type ArrayElement<AT extends readonly unknown[]> = AT extends readonly (infer ElementType)[]
	? ElementType
	: never;

// Basic types
export type Basic = string | number | bigint | boolean | null | { [key: string]: Basic } | Basic[];
export namespace Basic {
	export type Object = { [key: string]: Basic };
}

// Promises
export type Async<T> = T | Promise<T>;
export type Promised<T> = T extends PromiseLike<infer U> ? Promised<U> : T;
