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
}
