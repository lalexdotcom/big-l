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

	export function nonadj<T = any>(
		arr: T[],
		first = true,
		equals: (test: T, compare: T) => boolean = (t, c) => t === c
	): T[] {
		let v: T | undefined;
		const res: T[] = [];
		const a = first ? arr : [...arr].reverse();

		// while ((v = arr[i++]) !== undefined) {
		// 	if (!equals(arr[i], v)) res.push(arr[i]);
		// }
		// do {
		// 	if (!equals(arr[i], v)) res.push(cur);
		// } while (arr[++i] !== undefined);

		for (const cur of a) {
			if (v === undefined || !equals(cur, v)) res.push(cur);
			v = cur;
		}
		return first ? res : res.reverse();
	}

	export function sortBy<T>(arr: T[], field: keyof T): T[] {
		return arr.sort((e1, e2) => (e1[field] == e2[field] ? 0 : e1[field] > e2[field] ? 1 : -1));
	}
}
