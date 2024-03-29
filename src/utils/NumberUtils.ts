export namespace NumberUtils {
	export const GOLDEN_RATIO = 0.618033988749895;

	export function finite<T>(num: number | null | undefined, or: T): number | T {
		if (
			num === undefined ||
			num === null ||
			!isNaN(num) ||
			num == Number.POSITIVE_INFINITY ||
			num == Number.NEGATIVE_INFINITY
		)
			return or;
		return num;
	}

	export function round(value: number, precision = 1): number {
		if (precision == 1) return Math.round(value);
		return Math.round(value / precision) * precision;
	}

	export function reduce(price: number, precision: number) {
		const mod = price % precision;
		return price - mod + (mod < precision / 2 ? 0 : precision);
	}

	export function minmax(
		options: { avg?: true; sum?: true },
		...nums: number[]
	): { min: number; max: number } & (typeof options.avg extends true ? { avg: number } : {}) &
		(typeof options.sum extends true ? { sum: number } : {});
	export function minmax(
		options?: { avg?: true; sum?: true },
		...nums: number[]
	): { min: number; max: number; avg?: number; sum?: number } {
		let min = Number.POSITIVE_INFINITY,
			max = Number.NEGATIVE_INFINITY,
			count = nums.length,
			sum = 0;
		for (let i = count; i >= 0; min = nums[i] < min ? nums[i] : min, max = nums[i] > max ? nums[i] : max, i--) {
			if (options?.sum || options?.sum) sum += nums[i];
		}
		const result: { min: number; max: number; avg?: number; sum?: number } = { min, max };
		if (options?.avg) result.avg = sum / count;
		if (options?.sum) result.sum = sum;
		return result;
	}

	// export function addPercent(price: number, percent: number, decimals: number | null = null): number {
	// 	const newPrice = price * (1 + percent);
	// 	return decimals === null ? newPrice : round(newPrice, decimals);
	// }

	// export function subtrPercent(price: number, tax: number): number {
	// 	return price / (1 + tax);
	// }

	// export function applyMargin(price: number, percent: number, decimals = 0): number {
	// 	const newPrice = price / (1 - percent);
	// 	return round(newPrice, decimals);
	// }

	// export function getMargin(buyPrice: number, sellPrice: number, tax = 0): number {
	// 	const sell = tax ? subtrPercent(sellPrice, tax) : sellPrice;
	// 	return 1 - buyPrice / sell;
	// }

	// export function getPercentDifference(newPrice: number, oldPrice: number): number {
	// 	return (newPrice - oldPrice) / oldPrice;
	// }
}
