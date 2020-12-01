export namespace LM {
	export const GOLDEN_RATIO = 0.618033988749895;

	export function round(price: number, digits: number = 0): number {
		if (!digits) return Math.round(price);
		let pow = Math.pow(10, digits);
		return Math.round(price * pow) / pow;
	}

	export function addPercent(price: number, percent: number, decimals: number = 0): number {
		let newPrice = price * (1 + percent);
		return round(newPrice, decimals);
	}

	export function subtrPercent(price: number, tax: number): number {
		return price / (1 + tax);
	}

	export function applyMargin(price: number, percent: number, decimals: number = 0): number {
		let newPrice = price / (1 - percent);
		return round(newPrice, decimals);
	}

	export function getMargin(buyPrice: number, sellPrice: number, tax: number = 0): number {
		let sell = tax ? subtrPercent(sellPrice, tax) : sellPrice;
		return 1 - buyPrice / sell;
	}

	export function getPercentDifference(newPrice: number, oldPrice: number): number {
		return (newPrice - oldPrice) / oldPrice;
	}
}
