const UID_KEY = "__$$uid";
let UID_INDEX = 0;

export namespace ObjectUtils {
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

	export function mapKeys(o: any, fct: (key: string) => string, recursive = false): any {
		if (typeof o != "object") return o;
		const r: any = {};
		for (const k in o) {
			const v = o[k];
			r[fct(k)] = recursive && v.constructor == Object ? mapKeys(o[k], fct, true) : o[k];
		}
		return r;
	}

	export function map<T>(o: T, fct: (value: any, key?: string) => any) {
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

	export function pick<T = any>(
		source: T,
		fields?: (keyof T | { [targetKey: string]: keyof T | ((o: T) => any) })[]
	): T & any {
		const newObject: any = {};
		assign(newObject, source, fields);
		return newObject;
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

	export function changed<T = any>(obj: T, compare: T): Partial<{ [key in keyof T]: boolean }> {
		const changed: Partial<{ [key in keyof T]: boolean }> = {};
		for (const k in obj) {
			if (obj[k] !== compare[k]) changed[k] = true;
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
}
