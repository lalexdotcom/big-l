import { read } from "fs";
import { Logger } from "../debug/Logger";
import { ObjectUtils } from "../utils/ObjectUtils";

export namespace Template {
	export type Operator = {
		symbol: string;
		compute: (match: TagMatch, getValue: (name: string) => any, next: (match: TagMatch[]) => any) => any;
	};

	export namespace Operator {
		export const ARGS_SEPARATOR = ",,";

		const childrenValue = (
			next: (match: TagMatch[]) => any,
			matches: TagMatch[],
			fallback: any,
			prefix: string
		) => {
			if (matches.length) {
				return next(
					matches.map((m, i) => ({
						...m,
						before: i == 0 ? m.before.slice(prefix.length) : m.before,
					}))
				);
			} else {
				return fallback;
			}
		};

		export const Noop: Operator = {
			symbol: "-",
			compute: (mtch, getValue, next) => {
				return childrenValue(next, mtch.children, mtch.content, "");
			},
		};

		export const Parameter: Operator = {
			symbol: ":",
			compute: (mtch, getValue) => {
				const val = getValue(mtch.content);
				// Logger.debug("Value for", mtch.content, "is", val);
				return val;
			},
		};

		export const Conditional: Operator = {
			symbol: "?",
			compute: (mtch, getValue, next) => {
				const [cond, ...res] = mtch.content.split(ARGS_SEPARATOR);
				const condvalue = getValue(cond);
				if (condvalue !== undefined && condvalue !== false && condvalue !== null)
					return childrenValue(next, mtch.children, res.join(""), cond + ARGS_SEPARATOR);
				return null;
			},
		};

		export const Not: Operator = {
			symbol: "!",
			compute: (mtch, getValue, next) => {
				const [cond, ...res] = mtch.content.split(ARGS_SEPARATOR);
				const condvalue = getValue(cond);
				if (condvalue === undefined || condvalue === false || condvalue === null)
					return childrenValue(next, mtch.children, res.join(""), cond + ARGS_SEPARATOR);
				return null;
			},
		};

		export const Lazy: Operator = {
			symbol: "|",
			compute: (mtch, getValue, next) => {
				const [cond, ...res] = mtch.content.split(ARGS_SEPARATOR);
				const condvalue = getValue(cond);
				if (condvalue === undefined || condvalue === false || condvalue === null)
					return childrenValue(next, mtch.children, res.join(""), cond + ARGS_SEPARATOR);
				return condvalue;
			},
		};
	}

	const DEFAULT_OPERATORS = [Operator.Noop, Operator.Parameter, Operator.Not, Operator.Conditional, Operator.Lazy];

	export type MatchOptions = {
		start: string;
		end: string;
		operators: string[];
	};

	const defaultMatchOptions: MatchOptions = {
		start: "{",
		end: "}",
		operators: DEFAULT_OPERATORS.map(op => op.symbol),
	};

	export type ReplaceOptions = Omit<MatchOptions, "operators"> & {
		operators: Operator[];
		separator: string;
	};

	const defaultReplaceOptions: ReplaceOptions = {
		...defaultMatchOptions,
		operators: [...DEFAULT_OPERATORS],
		separator: "||",
	};

	const internalGetValue = (field: string, params: Record<string, unknown>, cache: { [key: string]: any }) => {
		let value = cache[field];
		if (value !== undefined) return value;
		if (value === undefined) {
			let currentValue = params;
			const path = field.split(".");
			while (path.length && typeof currentValue == "object") {
				currentValue = (<any>currentValue)[path.shift()!];
			}
			value = cache[field] = currentValue;
		}
		// if (value === undefined) {
		// 	Logger.warn(field, "not found");
		// } else {
		// 	Logger.verb(field, "is", value);
		// }
		return value;
	};

	const internalCompute = (
		matches: TagMatch[],
		params: Record<string, unknown>,
		operators: Record<string, Operator>,
		cache: { [key: string]: any }
	) => {
		// Logger.debug("Compute", matches);
		let values: any[] = matches.map(match => {
			const operatorCompute = operators[match.operator]?.compute;
			if (!operatorCompute || !match.end) return match.source;
			const computed = operatorCompute(
				match,
				(name: string) => internalGetValue(name, params, cache),
				childrenMatches => internalCompute(childrenMatches, params, operators, cache)
			);
			const computedValue =
				computed !== undefined
					? match.before || match.after
						? match.before + (computed !== null ? computed : "") + match.after
						: computed
					: match.source + match.after;
			// Logger.debug(match, "=>", computed, "=>", computedValue);
			return computedValue;
		});
		// Logger.debug("values =>", values);
		values = values.filter(v => v !== undefined && v !== null);
		switch (values.length) {
			case 0:
				return null;
			case 1:
				return values[0];
			default:
				return values.join("");
		}
	};

	type TagMatch = StringMatch & {
		before: string;
		start: number;
		end?: number;
		level: number;
		operator: string;
		content: string;
		after: string;
	};

	type StringMatch = {
		source: string;
		children: TagMatch[];
	};

	export function matchAll(str: string, options?: Partial<MatchOptions>): TagMatch[] {
		const { start, end, operators } = { ...defaultMatchOptions, ...options };

		const stack: TagMatch[] = [],
			found: TagMatch[] = [];
		let position = 0,
			beforeContent = "",
			pending = str,
			currentLevel: TagMatch | undefined,
			lastClosedLevel: TagMatch | undefined;
		const operatorList = [...operators].sort((o1, o2) => (o1.length > o2.length ? -1 : 1));
		while (pending.length) {
			let performedChars = pending.charAt(0);
			// LGR.debug("Test", JSON.stringify(pending));
			let isOpeningTag = false,
				closingLevel: TagMatch | undefined;
			switch (true) {
				// Found opening tag
				case pending.startsWith(start):
					for (const op of operatorList) {
						if (pending.startsWith(op, start.length)) {
							isOpeningTag = true;
							performedChars = start + op;

							if (currentLevel) stack.push(currentLevel);

							const newLevel: TagMatch = {
								source: beforeContent,
								before: beforeContent,
								start: position,
								end: undefined,
								level: stack.length,
								operator: op,
								content: "",
								children: [],
								after: "",
							};
							currentLevel = newLevel;
							if (!newLevel.level) found.push(newLevel);
							// Found an open operator
							break;
						}
					}
					break;

				// Found closing tag
				case currentLevel && pending.startsWith(currentLevel.operator + end):
					performedChars = currentLevel!.operator + end;

					closingLevel = currentLevel;

					break;
			}

			const isPerformingTag = isOpeningTag || !!closingLevel;

			if (isPerformingTag) {
				beforeContent = "";
			} else {
				beforeContent += performedChars;
				if (lastClosedLevel) lastClosedLevel.after += performedChars;
			}

			for (const lvl of [...stack, currentLevel]) {
				if (lvl) {
					lvl.source += performedChars;
					if (!isPerformingTag || lvl !== currentLevel) {
						lvl!.content += performedChars;
					}
				}
			}

			if (isOpeningTag) {
				// Logger.verb("Opening tag", performedChars, `@${position}`);
				lastClosedLevel = undefined;
			}

			if (closingLevel) {
				// Logger.verb("Closing tag", performedChars, `@${position}`);
				lastClosedLevel = undefined;
				closingLevel.end = position + performedChars.length;

				lastClosedLevel = closingLevel;

				currentLevel = stack.pop();
				if (currentLevel) {
					currentLevel.children.push(closingLevel);
					currentLevel.children.map(m => (m.after = ""));
					currentLevel.after = "";
				} else {
					found.map(m => (m.after = ""));
				}
			}

			position += performedChars.length;
			pending = str.slice(position);
		}

		const pendingLevels = found.filter(m => m.end === undefined);
		if (pendingLevels.length) {
			Logger.warn("Unbalanced tags", pendingLevels.shift()?.source);
			return [];
		}

		return found;
	}

	export function replace(str: string, params: Record<any, unknown>, options?: Partial<ReplaceOptions>): string;
	export function replace(
		obj: Record<string, unknown>,
		params: Record<any, unknown>,
		options?: Partial<ReplaceOptions>
	): Record<any, unknown>;
	export function replace(
		stringOrObject: string | Record<string, unknown>,
		params: Record<any, unknown>,
		options?: Partial<ReplaceOptions>
	): string | Record<string, unknown> {
		return internalReplace(stringOrObject, params, { ...defaultReplaceOptions, ...options }, {});
	}

	export function internalReplace(
		stringOrObject: any,
		params: Record<any, unknown>,
		options: ReplaceOptions,
		cache: Record<string, any>
	): any {
		const { operators } = options;
		const operatorRegistry = operators.reduce<Record<string, Operator>>(
			(red, op) => ({ ...red, [op.symbol]: op }),
			{}
		);
		switch (typeof stringOrObject) {
			case "string": {
				// Logger.debug("Replace in string", stringOrObject);
				const matches = matchAll(<string>stringOrObject, {
					...options,
					operators: operators.map(op => op.symbol),
				});
				return matches.length ? internalCompute(matches, params, operatorRegistry, cache) : stringOrObject;
			}
			case "object": {
				// Logger.info("Replace in object", stringOrObject);
				switch (true) {
					case stringOrObject === null:
						return null;
					case Array.isArray(stringOrObject):
						return (<unknown[]>stringOrObject).map(arrayElement =>
							internalReplace(arrayElement, params, options, cache)
						);
					case stringOrObject instanceof Date:
					case stringOrObject instanceof RegExp:
					case stringOrObject instanceof Function:
						return stringOrObject;
					default: {
						// Logger.debug("Replace in object", stringOrObject);
						const replacedObject: Record<string, unknown> = {};
						for (const objectKey in stringOrObject) {
							const keyValue = stringOrObject[objectKey];
							replacedObject[objectKey] = internalReplace(keyValue, params, options, cache);
						}
						return replacedObject;
					}
				}
			}
			default:
				// Logger.info("Don't replace", stringOrObject);
				return stringOrObject;
		}
	}
}
