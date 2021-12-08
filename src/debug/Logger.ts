import { format } from "date-fns";
import { EnvUtils } from "../utils/EnvUtils";
import type StackTrace from "stacktrace-js";
import type { Chalk } from "chalk";
import type { inspect } from "util";
import { LogLevel, LogOptions } from "./types";
import { LEVEL_STYLES } from "./styles";
import { DEFAULT_LOGGER_OPTIONS, LEVEL_PARAMS } from "./const";

const inBrowser = EnvUtils.isBrowser();
const inNode = EnvUtils.isNode();

let stacktrace: typeof StackTrace | undefined;
try {
	stacktrace = require(/* webpackIgnore: true */ "stacktrace-js");
} catch {}

let chalk: Chalk | undefined;
if (inNode) {
	try {
		chalk = require(/* webpackIgnore: true */ "chalk");
	} catch (e) {}
}

let utilInspect: typeof inspect;
if (inNode) {
	try {
		utilInspect = require(/* webpackIgnore: true */ "util")?.inspect;
	} catch (e) {}
}

export namespace Logger {
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
		readonly namespace?: string;
		exclusive: boolean;

		once(...args: unknown[]): void; // eslint-disable-line @typescript-eslint/no-explicit-any
		limit(key: string, limit: number): LimitedLogger;
	}

	interface LimitedLogger extends ILogger {
		reset(): void;
	}

	export const Level = LogLevel;
	export type Level = LogLevel;

	export type Options = LogOptions;

	const systemGlobal: any = inBrowser ? window : inNode ? global : {}; // eslint-disable-line @typescript-eslint/no-explicit-any

	const omni: { registry: { [ns: string]: LoggerInstance }; exclusive?: Logger } = (systemGlobal.__big_l ||= {
		registry: {},
	});

	class LoggerLimit implements LimitedLogger {
		private instance: LoggerInstance;
		private limit: number;
		private count = 0;

		constructor(instance: LoggerInstance, limit: number) {
			this.instance = instance;
			this.limit = limit;
		}

		private limitedCall(cb: (...args: unknown[]) => void, ...args: unknown[]) {
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

		emerg = (...args: unknown[]) => this.limitedCall(this.instance.emerg, ...args);
		alert = (...args: unknown[]) => this.limitedCall(this.instance.alert, ...args);
		crit = (...args: unknown[]) => this.limitedCall(this.instance.crit, ...args);
		error = (...args: unknown[]) => this.limitedCall(this.instance.error, ...args);
		warn = (...args: unknown[]) => this.limitedCall(this.instance.warn, ...args);
		notice = (...args: unknown[]) => this.limitedCall(this.instance.notice, ...args);
		info = (...args: unknown[]) => this.limitedCall(this.instance.info, ...args);
		verb = (...args: unknown[]) => this.limitedCall(this.instance.verb, ...args);
		debug = (...args: unknown[]) => this.limitedCall(this.instance.debug, ...args);
		wth = (...args: unknown[]) => this.limitedCall(this.instance.wth, ...args);
	}

	class LoggerInstance implements Logger {
		private _namespace?: string;
		protected _options: Logger.Options;
		private _computedOptions!: Required<Logger.Options>;

		private _onces: { [key: string]: boolean } = {};
		private _limits: { [key: string]: LoggerLimit } = {};

		private lastLogTime = 0;

		constructor(nameSpace?: string, options: Partial<Logger.Options> = {}) {
			this._namespace = nameSpace;
			this._options = options;
			this._computedOptions = DEFAULT_LOGGER_OPTIONS;
			this.computeOptions();
		}

		get namespace() {
			return this._namespace;
		}

		set exclusive(b: boolean) {
			exclusive(b ? this : undefined);
		}

		get exclusive() {
			return omni.exclusive === this;
		}

		/* -- OPTIONS -- */
		set enabled(b: boolean | undefined) {
			this.setOption("enabled", b);
		}

		get enabled() {
			return this.getOption("enabled");
		}

		set stack(b: boolean | undefined) {
			this.setOption("stack", b);
		}

		get stack() {
			return this.getOption("stack");
		}

		set time(b: boolean | undefined) {
			this.setOption("time", b);
		}

		get time() {
			return this.getOption("time");
		}

		set date(b: boolean | undefined) {
			this.setOption("date", b);
		}

		get date() {
			return this.getOption("date");
		}

		set level(level: Logger.Level | undefined) {
			this.setOption("level", level);
		}

		get level() {
			return this.getOption("level");
		}

		set pad(b: boolean | undefined) {
			this.setOption("pad", b);
		}

		get pad() {
			return this.getOption("pad");
		}

		protected setOption<K extends keyof Options>(name: K, value?: Options[K]) {
			if (this._computedOptions[name] !== value) {
				console.log(`Set ${this.namespace || ""} option`, name, "to", value);
				this._options[name] = value;
				this.computeOptions();
				console.log(name, "is now", this._computedOptions[name]);
			}
		}

		protected getOption<K extends keyof Options>(name: K): Options[K] {
			return this._computedOptions[name];
		}

		protected computeOptions() {
			const options = { ...rootInstance._computedOptions };
			for (const opt of <(keyof Options)[]>Object.keys(options)) {
				switch (opt) {
					case "enabled":
						// options[opt] ||= !!this._options[opt];
						console.log("Enable", this.namespace, ":", options["enabled"], "&&", this._options["enabled"]);
						options[opt] &&= this._options.enabled === undefined || !!this._options[opt];
						break;
					case "stack":
						options[opt] ||= !!this._options[opt];
						break;
					case "level":
						options.level = Math.min(
							options.level || LogLevel.WHO_CARES,
							rootInstance.level || LogLevel.WHO_CARES
						);
						break;
					case "date":
					case "time":
					case "pad":
						if (this._options[opt] !== undefined) options[opt] = this._options[opt]!;
						break;
				}
			}
			this._computedOptions = options;
		}
		/* ------------- */

		ns = ns;

		limit(key: string, count: number): LimitedLogger {
			if (this._limits[key]) {
				return this._limits[key];
			} else {
				return (this._limits[key] = new LoggerLimit(this, count));
			}
		}

		private get __all() {
			return { ...omni.registry };
		}

		private get __exclu() {
			return omni.exclusive;
		}

		private get __default() {
			return rootInstance;
		}

		log(logLevel: Logger.Level, ...args: unknown[]): void {
			// eslint-disable-line @typescript-eslint/no-explicit-any
			if (omni.exclusive && omni.exclusive !== this) return;
			const {
				enabled: enabledOption,
				stack: stackOption,
				date: dateOption,
				time: timeOption,
				level: levelOption,
				pad: padOption,
			} = this._computedOptions;
			if (enabledOption && logLevel <= levelOption) {
				const methods = LEVEL_PARAMS[logLevel].methods;
				const prefix: string[] = [];

				const levelLabel =
					padOption && LEVEL_PARAMS[logLevel].paddedLabel
						? LEVEL_PARAMS[logLevel].paddedLabel
						: LEVEL_PARAMS[logLevel].label;
				const debugPrefix = `${levelLabel}${this._namespace ? ` "${this._namespace}"` : ""}`;

				if (timeOption) {
					const currentTime = new Date().getTime();

					if (this.lastLogTime) {
						const timeDiff = (currentTime - this.lastLogTime) / 1000;
						const timePrefix = "[+" + (timeDiff ? `${timeDiff}` : "0.").padEnd(5, "0") + " s.]";
						prefix.push(timePrefix);
					}

					this.lastLogTime = currentTime;
				} else {
					this.lastLogTime = new Date().getTime();
				}

				if (inNode) {
					const style = LEVEL_STYLES[logLevel].style;
					let levelPrefix = debugPrefix;
					if (chalk) {
						let colorize = chalk;
						if (style.color) colorize = colorize.keyword(style.color);
						if (style.backgroundColor) colorize = colorize.bgKeyword(style.backgroundColor);
						levelPrefix = colorize(` ${debugPrefix} `);
					}
					if (padOption) {
						prefix.unshift(levelPrefix);
					} else {
						prefix.push(`[${levelPrefix}]`);
					}
					try {
						args = args.map(arg =>
							typeof arg === "object" && utilInspect ? utilInspect(arg, false, null, true) : arg
						);
					} catch (e) {} // eslint-disable-line
				}

				if (dateOption) {
					const datePrefix = `[${format(new Date(), "yyyy-MM-dd kk:mm:ss.SSS")}]`;
					prefix.unshift(datePrefix);
				}

				if (stackOption && stacktrace) {
					const st = stacktrace.getSync();
					const fName = st[2]?.functionName;
					if (fName) prefix.push(`< ${fName} >`);
				}

				if (inBrowser) {
					prefix.unshift(`%c${debugPrefix}`, LEVEL_STYLES[logLevel].css || "");
				}

				for (const method of methods) method(...prefix, ...args);
			}
		}

		once(id: string, ...args: unknown[]) {
			if (!this._onces[id]) {
				this._onces[id] = true;
				this.log(LogLevel.WHO_CARES, args);
			}
		}

		emerg = (...args: unknown[]) => this.log(LogLevel.EMERGENCY, ...args);
		alert = (...args: unknown[]) => this.log(LogLevel.ALERT, ...args);
		crit = (...args: unknown[]) => this.log(LogLevel.CRITICAL, ...args);
		error = (...args: unknown[]) => this.log(LogLevel.ERROR, ...args);
		warn = (...args: unknown[]) => this.log(LogLevel.WARNING, ...args);
		notice = (...args: unknown[]) => this.log(LogLevel.NOTICE, ...args);
		info = (...args: unknown[]) => this.log(LogLevel.INFO, ...args);
		verb = (...args: unknown[]) => this.log(LogLevel.VERBOSE, ...args);
		debug = (...args: unknown[]) => this.log(LogLevel.DEBUG, ...args);
		wth = (...args: unknown[]) => this.log(LogLevel.WHO_CARES, ...args);
	}

	class RootLoggerInstance extends LoggerInstance {
		constructor() {
			super();
		}

		protected computeOptions() {
			for (const lgr of Object.values(omni.registry)) {
				(lgr as any).computeOptions();
			}
		}
	}

	export const ns = (ns?: string, options: Partial<Logger.Options> = {}): Logger => {
		if (!ns) return rootInstance;
		omni.registry[ns] ||= new LoggerInstance(ns, options);
		return omni.registry[ns];
	};

	export const exclusive = (lgr?: LoggerInstance): void => {
		if (lgr) warn(`${lgr.namespace} is exclusive`);
		omni.exclusive = lgr;
	};

	const rootInstance = new RootLoggerInstance();

	export const log = (level: Level, ...args: unknown[]): void => rootInstance.log(level, ...args);
	export const emerg = (...args: unknown[]): void => rootInstance.emerg(...args);
	export const alert = (...args: unknown[]): void => rootInstance.alert(...args);
	export const crit = (...args: unknown[]): void => rootInstance.crit(...args);
	export const error = (...args: unknown[]): void => rootInstance.error(...args);
	export const warn = (...args: unknown[]): void => rootInstance.warn(...args);
	export const notice = (...args: unknown[]): void => rootInstance.notice(...args);
	export const info = (...args: unknown[]): void => rootInstance.info(...args);
	export const verb = (...args: unknown[]): void => rootInstance.verb(...args);
	export const debug = (...args: unknown[]): void => rootInstance.debug(...args);
	export const wth = (...args: unknown[]): void => rootInstance.wth(...args);

	export const once = (id: string, ...args: unknown[]): void => rootInstance.once(id, ...args);
	export const limit = (key: string, count: number): LimitedLogger => rootInstance.limit(key, count);

	export const patch = (): void => {
		console.error = error;
		console.warn = warn;
		console.log = console.info = info;
		console.debug = debug;
	};
}
