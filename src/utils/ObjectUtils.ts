import { format, formatISO, isMatch, parse, parseJSON, isValid } from "date-fns";

const UID_KEY = "__$biglUID$__";
let UID_INDEX = 0;

export type JSONOptions = {
	replacer?: ((this: any, key: string, value: any) => any) | (number | string)[] | null;
	reviver?: (this: any, key: string, value: any) => any;
	keyTransform?: (key: string) => string;
	exclude?: string[] | ((key: string, value?: any, thisObject?: any) => boolean);
	dateFormat?: string;
	dateKeys?: string[];
	parseDates?: true;
};

function jsonReplacer(options: JSONOptions) {
	return function (this: any, k: string, v: any) {
		let value = v;
		if (options.exclude) {
			if (typeof options.exclude === "function" && options.exclude(k, this[k], this)) return undefined;
			if (Array.isArray(options.exclude) && options.exclude.indexOf(k) >= 0) return undefined;
		}
		if ((options.dateFormat || options.parseDates) && this[k] instanceof Date)
			value = options.dateFormat ? format(this[k], options.dateFormat) : formatISO(this[k]);
		if (typeof options.replacer === "function") value = options.replacer.call(this, k, value);
		return value;
	};
}

function jsonReviver(options: JSONOptions) {
	return function (this: any, k: string, v: any) {
		if (options.parseDates || options.dateFormat || (options.dateKeys && options.dateKeys.indexOf(k) >= 0)) {
			const dt = options.dateFormat
				? isMatch(`${v}`, options.dateFormat)
					? parse(v, options.dateFormat, new Date())
					: null
				: typeof v == "string"
				? parseJSON(v)
				: null;
			if (isValid(dt)) return dt;
		}
		if (options.reviver) return options.reviver.call(this, k, v);
		return v;
	};
}

export namespace ObjectUtils {
	export function uid(o: Record<string, unknown>): string;
	export function uid(o: string | number | boolean | (() => any) | bigint | null | undefined): null;
	export function uid(o: any): string | null {
		if (typeof o == "object") {
			if (!o[UID_KEY]) {
				const uid = `${++UID_INDEX}${new Date().getTime()}`;
				Object.defineProperty(o, UID_KEY, {
					value: uid,
					enumerable: false,
				});
				return uid;
			} else {
				return o[UID_KEY];
			}
		}
		return null;
	}

	export function clearUid(o: any) {
		if (o[UID_KEY]) delete o[UID_KEY];
	}

	export function reduce<T, O = any>(o: O, fct: (reduced: T, key: string, value: any, obj: O) => T, init: T): T {
		let reduced = init;
		for (const key in o) {
			reduced = fct(reduced, key, o[key], o);
		}
		return reduced;
	}

	export function mapKeys(o: any, fct: (key: string, value?: any) => string, recursive = false): any {
		if (typeof o != "object") return o;
		if (Array.isArray(o)) return o.map(ae => mapKeys(ae, fct, recursive));
		const r: any = {};
		for (const k in o) {
			const v = o[k];
			r[fct(k, v)] =
				recursive && (v.constructor == Object || v.constructor == Array) ? mapKeys(o[k], fct, true) : o[k];
		}
		return r;
	}

	export function map<T, K>(o: T, fct: (value: any, key?: string) => K): { [key in keyof T]: K } {
		const r: any = {};
		for (const k in o) {
			r[k] = fct(o[k], k);
		}
		return r;
	}

	export function toRegistry<T = any>(a: T[], key: keyof T | ((o: T) => string)): { [key: string]: T } {
		return a.reduce(
			(red, v) => ({
				...red,
				[typeof key == "string" ? key : (<(o: T) => string>key)(v)]: v,
			}),
			{}
		);
	}

	export function isEmpty(o: any) {
		for (const k in o) if (o[k] !== undefined) return false;
		return true;
	}

	export function pick<T, K extends keyof T>(source: T, keys: K[]): { [P in K]: T[P] };
	export function pick<T = any>(
		source: T,
		fields?: (keyof T | { [targetKey: string]: keyof T | ((o: T) => any) })[]
	): T & any {
		const newObject: any = {};
		assign(newObject, source, fields);
		return newObject;
	}

	export function omit<T = any>(source: T, fields: (keyof T)[]): Partial<T> {
		const ret = { ...source };
		for (const k of fields) delete ret[k];
		return ret;
	}

	export function exclude<T = any>(source: T, fields: (keyof T)[]): Partial<T> {
		const actualKeys = Object.keys(source) as (keyof T)[];
		const keepKeys: (keyof T)[] = [];
		for (const k of actualKeys) if (fields.indexOf(k) < 0) keepKeys.push(k);
		return pick(source, keepKeys);
	}

	export function assign<T = any, S = any>(
		target: T,
		source: S,
		fields?: (keyof S | { [targetKey: string]: keyof S | ((o: S) => any) })[]
	): void {
		fields = fields || <(keyof S)[]>Object.keys(source);
		const valueObject: any = {};
		const assignProperty = (tgt: any, key: string, value: any) => {
			if (value !== undefined) tgt[key] = value;
		};
		for (const k of fields) {
			if (!k) continue;
			if (typeof k == "string") {
				assignProperty(valueObject, k, (source as any)[k]);
			} else {
				const ck = k as { [targetKey: string]: keyof S | ((o: S) => any) };
				for (const fk in ck) {
					const src = ck[fk];
					if (typeof src == "string") {
						const sourceKey = ck[fk];
						assignProperty(valueObject, fk, (source as any)[sourceKey]);
					} else if (typeof src == "function") {
						assignProperty(valueObject, fk, src(source));
					}
				}
			}
		}
		Object.assign(target, valueObject);
	}

	export function isDifferent<T>(o1: T, o2: T, fields: (keyof T)[], strict = true): boolean {
		for (const k of fields) {
			if (strict && o1[k] !== o2[k]) return true;
			if (!strict && o1[k] != o2[k]) return true;
		}
		return false;
	}

	export function isDefined(o: any): boolean {
		return o !== null && o !== undefined;
	}

	export function diff<T = any>(obj: T, compare: T): Partial<T> {
		const dif: Partial<T> = {};
		for (const k in obj) {
			if (obj[k] !== compare[k]) dif[k] = obj[k];
		}
		return dif;
	}

	export function changed<T = any>(obj: T, compare: T): Partial<{ [key in keyof T]: true }> {
		const changed: Partial<{ [key in keyof T]: true }> = {};
		for (const k in obj) {
			if (obj[k] !== compare[k]) changed[k] = true;
		}
		for (const k in compare) {
			if (!changed[k] && compare[k] !== obj[k]) changed[k] = true;
		}
		return changed;
	}

	export function registry<T = any>(arr: T[], field: keyof T): { [key: string]: T } {
		const reg: { [key: string]: T } = {};
		arr.forEach(o => {
			reg[`${o[field]}`] = o;
		});
		return reg;
	}

	export function stringify(value: any, options?: JSONOptions | null, space?: string | number): string {
		if (options?.keyTransform) {
			value = ObjectUtils.mapKeys(value, options.keyTransform, true);
		}
		return JSON.stringify(value, options ? jsonReplacer(options) : undefined, space);
	}

	export function parse(text: string | null, options?: JSONOptions | null): any | null {
		if (!text) return null;
		let obj: any;
		if (options?.reviver) obj = JSON.parse(text, options.reviver);
		else obj = JSON.parse(text, options ? jsonReviver(options) : undefined);
		if (options?.keyTransform) obj = ObjectUtils.mapKeys(obj, options.keyTransform, true);
		return obj;
	}

	export function eq(o1: any, o2: any): boolean {
		if (o1 === null || o1 === undefined || o2 === null || o2 === undefined) {
			return o1 === o2;
		}
		// after this just checking type of one would be enough
		if (o1.constructor !== o2.constructor) {
			return false;
		}
		// if they are functions, they should exactly refer to same one (because of closures)
		if (o1 instanceof Function) {
			return o1 === o2;
		}
		// if they are regexps, they should exactly refer to same one (it is hard to better equality check on current ES)
		if (o1 instanceof RegExp) {
			return o1 === o2;
		}
		if (o1 === o2 || o1.valueOf() === o2.valueOf()) {
			return true;
		}
		if (Array.isArray(o1) && o1.length !== o2.length) {
			return false;
		}

		// if they are dates, they must had equal valueOf
		if (o1 instanceof Date) {
			return false;
		}

		// if they are strictly equal, they both need to be object at least
		if (!(o1 instanceof Object)) {
			return false;
		}
		if (!(o1 instanceof Object)) {
			return false;
		}

		// recursive object equality check
		const p = Object.keys(o1);
		return (
			Object.keys(o2).every(function (i) {
				return p.indexOf(i) !== -1;
			}) &&
			p.every(function (i) {
				return eq(o1[i], o2[i]);
			})
		);
	}
}
