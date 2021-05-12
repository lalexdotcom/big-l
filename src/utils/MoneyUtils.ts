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

	export function margin(buy: number, taxOptions?: MarginTaxOptions): number;
	export function margin(buy: number, sell: number, taxOptions?: MarginTaxOptions): number;
	export function margin(buy: number, sellOrTaxOptions: number | MarginTaxOptions = {}, taxOptions: MarginTaxOptions = {}): number {
		if (typeof sellOrTaxOptions === "number") {
			const income = (taxOptions.percent ? sub(sellOrTaxOptions, taxOptions.percent) : sellOrTaxOptions) - (taxOptions.offset || 0);
			return 1 - buy / income;
		} else {
			const newPrice = buy / (1 - (sellOrTaxOptions.percent || 0)) + (taxOptions.offset || 0);
			return newPrice;
		}
	}

	// export function applyMargin(price: number, percent: number, decimals = 0): number {
	// 	const newPrice = price / (1 - percent);
	// 	return NumberUtils.round(newPrice, decimals);
	// }

	export function difference(price: number, compare: number): number {
		return (price - compare) / (compare > 0 ? compare : -compare);
	}
}
