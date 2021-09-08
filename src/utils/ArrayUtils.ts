import { Logger } from "../debug/Logger";

export namespace ArrayUtils {
	export function first<T>(arr: T[]): T | undefined {
		return arr[0];
	}

	export function last<T>(arr: T[]): T | undefined {
		return arr[arr.length - 1];
	}

	export function sum(arr: number[]): number {
		let sum = 0;
		for (const n of arr) sum = sum + n;
		return sum;
	}

	export function max(arr: number[]): number {
		let max = Number.NEGATIVE_INFINITY;
		for (const n of arr) max = max > n ? max : n;
		return max;
	}

	export function min(arr: number[]): number {
		let min = Number.POSITIVE_INFINITY;
		for (const n of arr) min = min < n ? min : n;
		return min;
	}

	export function clearAdjacent<T = any>(
		arr: T[],
		keepFirst = true,
		compareFieldsOrFunction?: keyof T | (keyof T)[] | ((test: T, compare: T) => boolean)
	): T[] {
		let lastValue: T | undefined;
		const result: T[] = [],
			workArray = keepFirst ? arr : [...arr].reverse();
		let compareFunction: (test: T, compare: T) => boolean = (t, c) => t === c;

		if (compareFieldsOrFunction) {
			if (typeof compareFieldsOrFunction === "function") {
				compareFunction = compareFieldsOrFunction;
			} else {
				const compareFields = Array.isArray(compareFieldsOrFunction)
					? compareFieldsOrFunction
					: [compareFieldsOrFunction];
				compareFunction = (t: T, c: T) => {
					for (const k of compareFields) {
						if (t[k] !== c[k]) return false;
					}
					return true;
				};
			}
		}

		for (const currentValue of workArray) {
			if (
				lastValue === undefined ||
				(!!compareFunction && !compareFunction(currentValue, lastValue)) ||
				(!compareFunction && currentValue !== lastValue)
			) {
				result.push(currentValue);
			}
			lastValue = currentValue;
		}
		return keepFirst ? result : result.reverse();
	}

	export function sortBy<T>(arr: T[], fieldOrAccessor: keyof T | ((o: T) => any), desc?: boolean): T[] {
		const accessor = typeof fieldOrAccessor === "function" ? fieldOrAccessor : (o: T) => o[fieldOrAccessor];
		const comparableAccessor = (o: T): string | number | bigint => {
			const v = accessor(o);
			switch (true) {
				case typeof v === "number" || typeof v === "string" || typeof v === "bigint":
					return v;
				case v instanceof Date:
					return v.getTime();
				case v === undefined || v === null:
					return Number.NEGATIVE_INFINITY;
				case typeof v === "boolean":
					return v ? 1 : 0;
				default:
					return `${v}`;
			}
		};
		const compareFunction = (o1: T, o2: T) => {
			const v1 = comparableAccessor(o1),
				v2 = comparableAccessor(o2);
			Logger.debug("Compare", v1, v2);
			return (desc ? -1 : 1) * (v1 == v2 ? 0 : v1 < v2 ? -1 : 1);
		};
		return arr.sort(compareFunction);
	}
}
