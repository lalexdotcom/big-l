export namespace MathUtils {
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

	export function round(price: number, digits = 0): number {
		if (!digits) return Math.round(price);
		const pow = Math.pow(10, digits);
		return Math.round(price * pow) / pow;
	}

	export function addPercent(price: number, percent: number, decimals: number | null = null): number {
		const newPrice = price * (1 + percent);
		return decimals === null ? newPrice : round(newPrice, decimals);
	}

	export function subtrPercent(price: number, tax: number): number {
		return price / (1 + tax);
	}

	export function applyMargin(price: number, percent: number, decimals = 0): number {
		const newPrice = price / (1 - percent);
		return round(newPrice, decimals);
	}

	export function getMargin(buyPrice: number, sellPrice: number, tax = 0): number {
		const sell = tax ? subtrPercent(sellPrice, tax) : sellPrice;
		return 1 - buyPrice / sell;
	}

	export function getPercentDifference(newPrice: number, oldPrice: number): number {
		return (newPrice - oldPrice) / oldPrice;
	}
}
