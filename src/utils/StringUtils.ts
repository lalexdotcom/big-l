export enum Case {
	CAMEL = 'CASE/Camel',
	SNAKE = 'CASE/Snake',
	KEBAB = 'CASE/Kebab',
	PASCAL = 'CASE/Pascal',
}

export default class StringUtils {
	static capitalize(str: string, separator: string = ' '): string {
		return str
			.split(separator)
			.map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
			.join(separator);
	}

	static toFilename(str: string, ...following: string[]): string {
		let strings = [str, ...following].map(s =>
			s
				.trim()
				.toLowerCase()
				.normalize('NFD')
				.replace(/[\u0300-\u036f]/g, '')
				.replace(/([^\w^ ]*)/g, '')
				.replace(/([ ]+)/g, '-')
		);
		return strings.join('-');
	}

	static normalize(str: string): string {
		return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
	}

	static guessCase(str: string): Case {
		if (str.indexOf('-') > 0) return Case.KEBAB;
		if (str.indexOf('_') > 0) return Case.SNAKE;
		let lowerFirst = /^([0-9]*)[a-z]/;
		return lowerFirst.test(str) ? Case.CAMEL : Case.PASCAL;
	}

	private static splitFromCase(str: string, sourceCase: Case): string[] {
		switch (sourceCase) {
			case Case.KEBAB:
				return str.split('-');
			case Case.SNAKE:
				return str.split('_');
			case Case.CAMEL:
				return str.match(/(([A-Z]?)[a-z]+|[0-9]+)/g) || [];
			case Case.PASCAL:
				return str.match(/([A-Z][a-z]+|[0-9]+)/g) || [];
		}
	}

	private static joinToCase(elements: string[], targetCase: Case): string {
		let transform: ((element: string, index: number) => string) | undefined,
			join: string = '';
		switch (targetCase) {
			case Case.CAMEL:
				transform = (element, index) => (index ? this.capitalize(element) : element.toLowerCase());
				break;
			case Case.SNAKE:
				transform = element => element.toLowerCase();
				join = '_';
				break;
			case Case.KEBAB:
				transform = element => element.toLowerCase();
				join = '-';
				break;
			case Case.PASCAL:
				transform = element => this.capitalize(element);
				break;
		}
		return transform ? elements.map(transform).join(join) : elements.join(join);
	}

	static changeCase(str: string, toCase: Case, fromCase?: Case): string {
		fromCase = fromCase || this.guessCase(str);
		return this.joinToCase(this.splitFromCase(str, fromCase), toCase);
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
