export namespace StringUtils {
	export enum Case {
		CAMEL = "CASE/Camel",
		SNAKE = "CASE/Snake",
		KEBAB = "CASE/Kebab",
		PASCAL = "CASE/Pascal",
	}

	export function capitalize(str: string, lowerize = true, separator = " "): string {
		return str
			.split(separator)
			.map(s => s.charAt(0).toUpperCase() + (lowerize ? s.slice(1).toLowerCase() : s.slice(1)))
			.join(separator);
	}

	export function toFilename(str: string, ...following: string[]): string {
		const strings = [str, ...following]
			.filter(s => s && s.length)
			.map(s =>
				s
					.trim()
					.toLowerCase()
					.normalize("NFD")
					.replace(/[\u0300-\u036f]/g, "")
					.replace(/([^\w^ ]*)/g, "")
					.replace(/([ ]+)/g, "-")
			);
		return strings.join("-");
	}

	export function normalize(str: string): string {
		return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
	}

	export function guessCase(str: string): Case {
		if (str.indexOf("-") > 0) return Case.KEBAB;
		if (str.indexOf("_") > 0) return Case.SNAKE;
		const lowerFirst = /^([0-9]*)[a-z]/;
		return lowerFirst.test(str) ? Case.CAMEL : Case.PASCAL;
	}

	export function splitFromCase(str: string, sourceCase: Case): string[] {
		switch (sourceCase) {
			case Case.KEBAB:
				return str.split("-");
			case Case.SNAKE:
				return str.split("_");
			case Case.CAMEL:
				return str.match(/(([A-Z]?)[a-z]+|[0-9]+)/g) || [];
			case Case.PASCAL:
				return str.match(/([A-Z][a-z]+|[0-9]+)/g) || [];
		}
	}

	export function joinToCase(elements: string[], targetCase: Case): string {
		let transform: ((element: string, index: number) => string) | undefined,
			join = "";
		switch (targetCase) {
			case Case.CAMEL:
				transform = (element, index) => (index ? capitalize(element) : element.toLowerCase());
				break;
			case Case.SNAKE:
				transform = element => element.toLowerCase();
				join = "_";
				break;
			case Case.KEBAB:
				transform = element => element.toLowerCase();
				join = "-";
				break;
			case Case.PASCAL:
				transform = element => capitalize(element);
				break;
		}
		return transform ? elements.map(transform).join(join) : elements.join(join);
	}

	export function changeCase(str: string, toCase: Case, fromCase?: Case): string {
		fromCase = fromCase || guessCase(str);
		return joinToCase(splitFromCase(str, fromCase), toCase);
	}

	export function limit(text: string, size: number, ellipsis?: false) {
		if (text.length > size) {
			const ell = ellipsis === undefined || ellipsis;
			text = text.substr(0, ell ? size - 1 : size);
			if (ell) text += String.fromCharCode(8230);
		}
		return text;
	}

	// Micro template engine.
	// {{var}} get replaced if found in variables parameter
	// (works with value path in object or array: 'foo.bar', 'arr.1.name', ...)
	//
	// {{var||default}} get replaced with default value if not found
	// {{var||%%default}} same as above, force numeric value if json
	export function template(input: string, variables: any, json?: boolean) {
		const rgxp = /(['"']?){{([^\s]+?)(?:(?:\|\|(.*))?)}}(\1)/g;
		const cached: { [key: string]: any } = {};
		const replaced = input.replace(rgxp, (found, ...args: string[]) => {
			console.debug("Replace", ...args);
			const [quote, key, def] = args;
			let value = cached[key];
			if (value === undefined) {
				let currentValue = variables;
				const path = key.split(".");
				while (path.length && typeof currentValue == "object") {
					currentValue = currentValue[path.shift()!];
				}
				value = cached[key] = currentValue;
			}
			if (value === undefined) {
				if (def !== undefined && json && def.startsWith("%%")) {
					value = parseFloat(def.substr(2));
				} else {
					value = def;
				}
			}

			if (value === undefined) return found;

			if (json) {
				return JSON.stringify(value);
			} else {
				return quote + `${value}` + quote;
			}
		});
		return replaced;
	}

	// static camelToSnake(str: string): string {
	// 	return this.joinToCase(this.splitFromCase(str, Case.CAMEL), Case.SNAKE);
	// 	// let matches = str.match(/(([A-Z]?)[a-z]+)/g);
	// 	// return matches ? matches.map(s => s.toLowerCase()).join('_') : str;
	// }

	// static snakeToCamel(str: string): string {
	// 	return str
	// 		.split('_')
	// 		.map((s, i) => (i > 0 ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s))
	// 		.join('');
	// }
}
