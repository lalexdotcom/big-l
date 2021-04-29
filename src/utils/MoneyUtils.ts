import { NumberUtils } from "./NumberUtils";

export namespace MoneyUtils {
	type MarginTaxOptions = {
		percent?: number;
		offset?: number;
	};

	export function add(price: number, percent: number): number {
		return price * (1 + percent);
	}

	export function sub(price: number, percent: number): number {
		return price / (1 + percent);
	}

	export function margin(buy: number, sell: number, taxOptions: MarginTaxOptions = {}): number {
		const income = (taxOptions.percent ? sub(sell, taxOptions.percent) : sell) - (taxOptions.offset || 0);
		return 1 - buy / income;
	}

	// export function applyMargin(price: number, percent: number, decimals = 0): number {
	// 	const newPrice = price / (1 - percent);
	// 	return NumberUtils.round(newPrice, decimals);
	// }

	export function difference(price: number, compare: number): number {
		return (price - compare) / (compare > 0 ? compare : -compare);
	}
}
