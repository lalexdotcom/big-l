import { ObjectUtils } from "../utils/ObjectUtils";
import { format } from "date-fns";
import { EnvUtils } from "../utils/EnvUtils";
import type StackTrace from "stacktrace-js";
import type { Chalk } from "chalk";

const inBrowser = EnvUtils.isBrowser();
const inNode = EnvUtils.isNode();

let stack: typeof StackTrace | undefined;
try {
	stack = require("stacktrace-js"); // eslint-disable-line
} catch (e) {} // eslint-disable-line no-empty

let chalk: Chalk | undefined;
try {
	chalk = inNode ? require("chalk") : undefined;
} catch (e) {} // eslint-disable-line no-empty

const DEFAULT_NAMESPACE = "__default";

const PAD = inNode;

export namespace Logger {
	enum LogLevel {
		EMERGENCY = 0,
		ALERT = 1,
		CRITICAL = 2,
		ERROR = 3,
		WARNING = 4,
		NOTICE = 5,
		INFO = 6,
		VERBOSE = 7,
		DEBUG = 8,
		WHO_CARES = 9,
	}

	type LogOptions = {
		enabled: boolean;
		stack: boolean;
		date: boolean;
		time: boolean;
		level: LogLevel;
		pad: boolean;
	};

	const defaultOptions: LogOptions = {
		enabled: true,
		stack: false,
		date: false,
		time: false,
		level: LogLevel.WHO_CARES,
		pad: true,
	};

	type LogLevelStyle = {
		backgroundColor?: string;
		color?: string;
	};

	const LEVEL_INFOS: {
		[key in LogLevel]: LogLevelStyle & { label: string; paddedLabel?: string; method: typeof console.info };
	} = {
		[LogLevel.EMERGENCY]: {
			label: "EMERGENCY",
			backgroundColor: "red",
			method: console.error,
		},
		[LogLevel.ALERT]: {
			label: "ALERT",
			backgroundColor: "red",
			method: console.error,
		},
		[LogLevel.CRITICAL]: {
			label: "CRITICAL",
			backgroundColor: "red",
			method: console.error,
		},
		[LogLevel.ERROR]: {
			label: "ERROR",
			backgroundColor: "red",
			method: console.error,
		},
		[LogLevel.WARNING]: {
			label: "WARNING",
			backgroundColor: "orange",
			method: console.warn,
		},
		[LogLevel.NOTICE]: {
			label: "NOTICE",
			backgroundColor: "blue",
			method: console.info,
		},
		[LogLevel.INFO]: {
			label: "INFO",
			method: console.info,
		},
		[LogLevel.VERBOSE]: {
			label: "VERBOSE",
			backgroundColor: "green",
			method: console.debug,
		},
		[LogLevel.DEBUG]: {
			label: "DEBUG",
			backgroundColor: "yellow",
			color: "black",
			method: console.debug,
		},
		[LogLevel.WHO_CARES]: {
			label: "WHO CARES?",
			backgroundColor: "lightgray",
			color: "black",
			method: console.debug,
		},
	};

	if (PAD) {
		const padSize = Math.max(...Object.values(LEVEL_INFOS).map(info => info.label.length));
		for (const lvl of Object.values(LEVEL_INFOS)) {
			lvl.paddedLabel = lvl.label
				.padEnd(lvl.label.length + (padSize - lvl.label.length) / 2, " ")
				.padStart(padSize, " ");
		}
	}

	const defaultLevelStyle = {
		backgroundColor: "grey",
		color: "white",
	};

	const fullLevelStyles = ObjectUtils.map(
		LEVEL_INFOS,
		(o: LogLevelStyle): LogLevelStyle => ({ ...defaultLevelStyle, ...o })
	);

	const browserStyle = {
		padding: "2px 4px",
		"border-radius": "2px",
	};

	/* eslint-disable no-inner-declarations */
	function styleToCSS(level: LogLevel): string {
		const fullStyle = fullLevelStyles[level];

		const cssKeys: { [key in keyof Required<LogLevelStyle>]: string } = {
			backgroundColor: "background-color",
			color: "color",
		};
		const css: any = { ...browserStyle };
		for (const k of Object.keys(cssKeys)) {
			const sk = <keyof typeof fullStyle>k;
			css[cssKeys[sk]] = fullStyle[sk];
		}
		return ObjectUtils.reduce<string[]>(css, (red, k, v) => [...red, `${k}: ${v}`], []).join("; ");
	}
	/* eslint-enable */

	const browserLevelStyles: { [key in LogLevel]: string } | undefined = inBrowser
		? ObjectUtils.map(LEVEL_INFOS, (_, lvl) => styleToCSS((lvl as unknown) as LogLevel))
		: undefined;

	interface ILogger {
		/* eslint-disable @typescript-eslint/no-explicit-any */
		emerg(...args: any[]): void;
		alert(...args: any[]): void;
		crit(...args: any[]): void;
		error(...args: any[]): void;
		warn(...args: any[]): void;
		notice(...args: any[]): void;
		info(...args: any[]): void;
		verb(...args: any[]): void;
		debug(...args: any[]): void;
		wth(...args: any[]): void;
		/* eslint-enable */
	}

	export interface Logger extends ILogger, LogOptions {
		once(key: string, ...args: any[]): void; // eslint-disable-line @typescript-eslint/no-explicit-any
		limit(key: string, limit: number): LimitedLogger;
	}

	interface LimitedLogger extends ILogger {
		reset(): void;
	}

	export const Level = LogLevel;
	export type Level = LogLevel;

	export type Options = LogOptions;

	const registry: { [ns: string]: LoggerInstance } = {};
	let exclusiveLogger: Logger | undefined;

	const defaultInstanceOptions = { ...defaultOptions };

	export const options = defaultInstanceOptions;

	class LoggerLimit implements LimitedLogger {
		private instance: LoggerInstance;
		private limit: number;
		private count = 0;

		constructor(instance: LoggerInstance, limit: number) {
			this.instance = instance;
			this.limit = limit;
		}

		private limitedCall(cb: (...args: any[]) => void, ...args: any[]) {
			if (this.count < this.limit) {
				this.count++;
				cb(...args);
			} else if (this.count == this.limit) {
				this.count++;
				cb("Limited to", this.limit);
			}
		}

		reset() {
			this.count = 0;
		}

		emerg = (...args: any[]) => this.limitedCall(this.instance.emerg, ...args); // eslint-disable-line @typescript-eslint/no-explicit-any
		alert = (...args: any[]) => this.limitedCall(this.instance.alert, ...args); // eslint-disable-line @typescript-eslint/no-explicit-any
		crit = (...args: any[]) => this.limitedCall(this.instance.crit, ...args); // eslint-disable-line @typescript-eslint/no-explicit-any
		error = (...args: any[]) => this.limitedCall(this.instance.error, ...args); // eslint-disable-line @typescript-eslint/no-explicit-any
		warn = (...args: any[]) => this.limitedCall(this.instance.warn, ...args); // eslint-disable-line @typescript-eslint/no-explicit-any
		notice = (...args: any[]) => this.limitedCall(this.instance.notice, ...args); // eslint-disable-line @typescript-eslint/no-explicit-any
		info = (...args: any[]) => this.limitedCall(this.instance.info, ...args); // eslint-disable-line @typescript-eslint/no-explicit-any
		verb = (...args: any[]) => this.limitedCall(this.instance.verb, ...args); // eslint-disable-line @typescript-eslint/no-explicit-any
		debug = (...args: any[]) => this.limitedCall(this.instance.debug, ...args); // eslint-disable-line @typescript-eslint/no-explicit-any
		wth = (...args: any[]) => this.limitedCall(this.instance.wth, ...args); // eslint-disable-line @typescript-eslint/no-explicit-any
	}

	class LoggerInstance implements Logger {
		private namespace: string;
		private options: Logger.Options;

		private onces: { [key: string]: boolean } = {};
		private limits: { [key: string]: LoggerLimit } = {};

		private lastLogTime = 0;

		constructor(name_space: string, options: Logger.Options) {
			this.namespace = name_space;
			this.options = options;
		}

		get enabled(): boolean {
			return this.options.enabled;
		}

		set enabled(b: boolean) {
			this.options.enabled = b;
		}

		get stack(): boolean {
			return this.options.stack;
		}

		set stack(b: boolean) {
			this.options.stack = b;
		}

		get time(): boolean {
			return this.options.time;
		}

		set time(b: boolean) {
			this.options.time = b;
		}

		get date(): boolean {
			return this.options.date;
		}

		set date(b: boolean) {
			this.options.date = b;
		}

		get level(): Logger.Level {
			return this.options.level;
		}

		set level(level: Logger.Level) {
			this.options.level = level;
		}

		set exclusive(b: boolean) {
			exclusive(b ? this.namespace : undefined);
		}

		get exclusive() {
			return exclusiveLogger === this;
		}

		set pad(b: boolean) {
			this.options.pad = b;
		}

		get pad() {
			return this.options.pad;
		}

		ns = ns;

		limit(key: string, count: number): LimitedLogger {
			if (this.limits[key]) {
				return this.limits[key];
			} else {
				return (this.limits[key] = new LoggerLimit(this, count));
			}
		}

		private log(logLevel: Logger.Level, args: any[]): void {
			// eslint-disable-line @typescript-eslint/no-explicit-any
			const maxLevel = Math.min(defaultInstanceOptions.level, this.options.level);
			if (exclusiveLogger && exclusiveLogger !== this) return;
			if (defaultInstanceOptions.enabled && this.options.enabled && logLevel <= maxLevel) {
				const method = LEVEL_INFOS[logLevel].method;
				// switch (logLevel) {
				// 	case LogLevel.EMERGENCY:
				// 	case LogLevel.ALERT:
				// 	case LogLevel.CRITICAL:
				// 	case LogLevel.ERROR:
				// 		method = console.error;
				// 		break;
				// 	case LogLevel.WARNING:
				// 		method = console.warn;
				// 		break;
				// 	case LogLevel.NOTICE:
				// 	case LogLevel.INFO:
				// 		method = console.info;
				// 		break;
				// 	case LogLevel.DEBUG:
				// 	case LogLevel.VERBOSE:
				// 	case LogLevel.WHO_CARES:
				// 		method = console.debug;
				// 		break;
				// }
				const prefix: string[] = [];

				const levelLabel =
					this.options.pad && LEVEL_INFOS[logLevel].paddedLabel
						? LEVEL_INFOS[logLevel].paddedLabel
						: LEVEL_INFOS[logLevel].label;
				const debugPrefix = `${levelLabel}${this.namespace != DEFAULT_NAMESPACE ? ` "${this.namespace}"` : ""}`;

				if (inBrowser) {
					prefix.push(
						`%c${debugPrefix}`,
						browserLevelStyles![logLevel] // eslint-disable-line @typescript-eslint/no-non-null-assertion
					);
				}

				if (this.options.time) {
					const currentTime = new Date().getTime();

					if (this.lastLogTime) {
						const timeDiff = (currentTime - this.lastLogTime) / 1000;
						const timePrefix = "[+" + (timeDiff ? `${timeDiff}` : "0.").padEnd(5, "0") + " s.]";
						prefix.push(timePrefix);
					}

					this.lastLogTime = currentTime;
				}

				if (inNode) {
					const style = fullLevelStyles[logLevel];
					let levelPrefix = debugPrefix;
					if (chalk) {
						let colorize = chalk;
						if (style.color) colorize = colorize.keyword(style.color);
						if (style.backgroundColor) colorize = colorize.bgKeyword(style.backgroundColor);
						levelPrefix = colorize(` ${debugPrefix} `);
					}
					if (this.options.pad) {
						prefix.unshift(levelPrefix);
					} else {
						prefix.push(`[${levelPrefix}]`);
					}
				}

				if (this.options.date) {
					const datePrefix = `[${format(new Date(), "yyyy-MM-dd kk:mm:ss.SSS")}]`;
					prefix.unshift(datePrefix);
				}

				if (this.options.stack && stack) {
					const st = stack.getSync();
					const fName = st[2]?.functionName;
					if (fName) prefix.push(`< ${fName} >`);
				}

				method(...prefix, ...args);
				// method.apply(console, [...prefix, ...args]);
			}
		}

		once(id: string, ...args: any[]) {
			if (!this.onces[id]) {
				this.onces[id] = true;
				this.log(LogLevel.WHO_CARES, args);
			}
		}

		/* eslint-disable @typescript-eslint/no-explicit-any */
		emerg = (...args: any[]) => this.log(LogLevel.EMERGENCY, args);
		alert = (...args: any[]) => this.log(LogLevel.ALERT, args);
		crit = (...args: any[]) => this.log(LogLevel.CRITICAL, args);
		error = (...args: any[]) => this.log(LogLevel.ERROR, args);
		warn = (...args: any[]) => this.log(LogLevel.WARNING, args);
		notice = (...args: any[]) => this.log(LogLevel.NOTICE, args);
		info = (...args: any[]) => this.log(LogLevel.INFO, args);
		verb = (...args: any[]) => this.log(LogLevel.VERBOSE, args);
		debug = (...args: any[]) => this.log(LogLevel.DEBUG, args);
		wth = (...args: any[]) => this.log(LogLevel.WHO_CARES, args);
		/* eslint-enable */
	}

	export const ns = (ns: string, options: Partial<Logger.Options> = {}): Logger => {
		if (!registry[ns])
			registry[ns] = new LoggerInstance(
				ns,
				ns == DEFAULT_NAMESPACE ? defaultInstanceOptions : { ...defaultInstanceOptions, ...options }
			);
		return registry[ns];
	};

	export const exclusive = (name_space?: string): void => {
		warn(`${name_space} is exclusive`);
		exclusiveLogger = name_space ? ns(name_space) : undefined;
	};

	const defaultInstance = ns(DEFAULT_NAMESPACE);

	/* eslint-disable @typescript-eslint/no-explicit-any */
	export const emerg = (...args: any[]): void => defaultInstance.emerg(LogLevel.EMERGENCY, ...args);
	export const alert = (...args: any[]): void => defaultInstance.alert(...args);
	export const crit = (...args: any[]): void => defaultInstance.crit(...args);
	export const error = (...args: any[]): void => defaultInstance.error(...args);
	export const warn = (...args: any[]): void => defaultInstance.warn(...args);
	export const notice = (...args: any[]): void => defaultInstance.notice(...args);
	export const info = (...args: any[]): void => defaultInstance.info(...args);
	export const verb = (...args: any[]): void => defaultInstance.verb(...args);
	export const debug = (...args: any[]): void => defaultInstance.debug(...args);
	export const wth = (...args: any[]): void => defaultInstance.wth(...args);

	export const once = (id: string, ...args: any[]): void => defaultInstance.once(id, ...args);
	export const limit = (key: string, count: number): LimitedLogger => defaultInstance.limit(key, count);
	/* eslint-disable @typescript-eslint/no-explicit-any */

	export const patch = () => {
		console.error = error;
		console.warn = warn;
		console.log = console.info = info;
		console.debug = debug;
	};
}
