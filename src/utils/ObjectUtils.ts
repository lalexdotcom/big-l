import StringUtils from "./StringUtils";

const UID_KEY = '__$$uid';
let UID_INDEX = 0;

export default class ObjectUtils {
	static uid(o: any): string | null {
		if (typeof o == 'object') {
			if (!o[UID_KEY]) {
				let uid = `${++UID_INDEX}${new Date().getTime()}`;
				Object.defineProperty(o, UID_KEY, { value: uid, enumerable: false });
			} else {
				return o[UID_KEY];
			}
		}
		return null;
	}

	static clearUid(o: any) : void {
		if (o[UID_KEY]) delete o[UID_KEY];
	}

	static mapKeys(o: any, fct: (key: string) => string, deep: boolean = false): any {
		if (typeof o != 'object') return o;
		let r: any = {};
		for (let k in o) {
			let v = o[k];
			r[fct(k)] = deep && v.constructor == Object ? ObjectUtils.mapKeys(o[k], fct, true) : o[k];
		}
		return r;
	}

	static map<T>(o: T, fct: (value: any, key?: string) => any) {
		let r: any = {};
		for (let k in o) {
			r[k] = fct(o[k], k);
		}
		return r;
	}

	static toRegistry<T = any>(a: T[], key: keyof T | ((o: T) => string)): { [key: string]: T } {
		return a.reduce((red, v) => ({ ...red, [typeof key == 'string' ? key : (<Function>key)(v)]: v }), {});
	}

	static isEmpty(o: any) {
		for (let k in o) if (o[k] !== undefined) return false;
		return true;
	}

	static pick<T = any>(
		source: T,
		fields?: (keyof T | { [targetKey: string]: keyof T | ((o: T) => any) })[]
	): Partial<T> {
		let newObject: Partial<T> = {};
		ObjectUtils.assign(newObject, source, fields);
		return newObject;
	}

	static exclude<T = any>(source: T, fields: (keyof T)[]): Partial<T> {
		let actualKeys = Object.keys(source) as (keyof T)[];
		let keepKeys: (keyof T)[] = [];
		for (let k of actualKeys) if (fields.indexOf(k) < 0) keepKeys.push(k);
		return this.pick(source, keepKeys);
	}

	static assign<T = any, S = any>(
		target: T,
		source: S,
		fields?: (keyof S | { [targetKey: string]: keyof S | ((o: S) => any) })[]
	): void {
		fields = fields || <(keyof S)[]>Object.keys(source);
		let valueObject: any = {};
		const assignProperty = (tgt: any, key: string, value: any) => {
			if (value !== undefined) tgt[key] = value;
		};
		for (let k of fields) {
			if (!k) continue;
			if (typeof k == 'string') {
				assignProperty(valueObject, k, (source as any)[k]);
			} else {
				let ck = k as { [targetKey: string]: keyof S | ((o: S) => any) };
				for (let fk in ck) {
					let src = ck[fk];
					if (typeof src == 'string') {
						let sourceKey = ck[fk];
						assignProperty(valueObject, fk, (source as any)[sourceKey]);
					} else if (typeof src == 'function') {
						assignProperty(valueObject, fk, src(source));
					}
				}
			}
		}
		Object.assign(target, valueObject);
	}

	static isDifferent<T>(o1: T, o2: T, fields: (keyof T)[], strict: boolean = true): boolean {
		for (let k of fields) {
			if (strict && o1[k] !== o2[k]) return true;
			if (!strict && o1[k] != o2[k]) return true;
		}
		return false;
	}

	static isDefined(o: any): boolean {
		return o !== null && o !== undefined;
	}
}
