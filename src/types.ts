export type StaticType<T, TT> = { new (...args: any[]): T } & TT; // Does it work?

export type ArrayElement<AT extends readonly unknown[]> = AT extends readonly (infer ET)[] ? ET : never;
export type ExtendArray<AT extends readonly unknown[], T> = (ArrayElement<AT> & T)[];

export type MapKey<MT> = MT extends Map<infer KT, any> ? KT : never;
export type MapElement<MT> = MT extends Map<any, infer ET> ? ET : never;
export type IndexElement<T, KT extends keyof T = keyof T> = T extends object ? T[KT] : never;

export type Complete<T> = {
	[P in keyof Required<T>]: Pick<T, P> extends Required<Pick<T, P>> ? T[P] : T[P] | undefined;
};
export type Unrequired<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Basic types
export type Basic = string | number | bigint | boolean | null | { [key: string]: Basic } | Basic[];
export namespace Basic {
	export type Object = { [key: string]: Basic };
}

// Promises
export type Async<T> = T | Promise<T>;
export type Promised<T> = T extends PromiseLike<infer U> ? Promised<U> : T;
