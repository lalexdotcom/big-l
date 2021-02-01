import { ObjectUtils } from "../utils/ObjectUtils";
import StackTrace from "stacktrace-js";
import { format } from "date-fns";

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
		time: boolean;
		level: LogLevel;
	};

	interface ILogger {
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
	}

	interface Logger extends ILogger {
		time: boolean;
		stack: boolean;
		enabled: boolean;
		level: LogLevel;

		once(key: string, ...args: any[]): void;
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

	const defaultOptions: LogOptions = {
		enabled: true,
		stack: false,
		time: false,
		level: LogLevel.WHO_CARES,
	};

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

		emerg = (...args: any[]) => this.limitedCall(this.instance.emerg, args);
		alert = (...args: any[]) => this.limitedCall(this.instance.alert, args);
		crit = (...args: any[]) => this.limitedCall(this.instance.crit, args);
		error = (...args: any[]) => this.limitedCall(this.instance.error, args);
		warn = (...args: any[]) => this.limitedCall(this.instance.warn, args);
		notice = (...args: any[]) => this.limitedCall(this.instance.notice, args);
		info = (...args: any[]) => this.limitedCall(this.instance.info, args);
		verb = (...args: any[]) => this.limitedCall(this.instance.verb, args);
		debug = (...args: any[]) => this.limitedCall(this.instance.debug, args);
		wth = (...args: any[]) => this.limitedCall(this.instance.wth, args);
	}

	class LoggerInstance implements Logger {
		private namespace: string;
		private options: Logger.Options;

		private onces: { [key: string]: boolean } = {};
		private limits: { [key: string]: LoggerLimit } = {};

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

		get level(): Logger.Level {
			return this.options.level;
		}

		set level(level: Logger.Level) {
			this.options.level = level;
		}

		set exclusive(b: boolean) {
			exclusive(b ? this.namespace : undefined);
		}

		get exclusive(): boolean {
			return exclusiveLogger === this;
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
			const maxLevel = Math.min(defaultInstanceOptions.level, this.options.level);
			if (exclusiveLogger && exclusiveLogger !== this) return;
			if (defaultInstanceOptions.enabled && this.options.enabled && logLevel <= maxLevel) {
				const style = { ...baseStyle, ...styles[logLevel] };
				const styleString = ObjectUtils.reduce<string[]>(
					style,
					(reduced, key, val) => [...reduced, `${key}:${val}`],
					[]
				).join(";");
				let method = console.log;
				switch (logLevel) {
					case LogLevel.EMERGENCY:
					case LogLevel.ALERT:
					case LogLevel.CRITICAL:
					case LogLevel.ERROR:
						method = console.error;
						break;
					case LogLevel.WARNING:
						method = console.warn;
						break;
					case LogLevel.NOTICE:
					case LogLevel.INFO:
						method = console.info;
						break;
					case LogLevel.DEBUG:
					case LogLevel.VERBOSE:
					case LogLevel.WHO_CARES:
						method = console.debug;
						break;
				}
				// const stack = StackTrace.getSync();
				// let label = labels[logLevel];
				const prefix: string[] = [
					`%c${labels[logLevel]}${this.namespace != DEFAULT_NAMESPACE ? ` "${this.namespace}"` : ""}`,
					styleString,
					// stack.map(sf => sf.functionName || "").pop() || "",
				];

				if (this.options.time) {
					prefix.push(`[${format(new Date(), "yyyy-MM-dd kk:mm:ss.SSS")}]`);
				}

				if (this.options.stack) {
					const st = StackTrace.getSync();
					const fName = st[2]?.functionName;
					if (fName) prefix.push(`< ${fName} >`);
				}

				// console.log(st);

				// StackTrace.get().then(st => console.warn(st));

				method.apply(console, [...prefix, ...args]);
				// method.apply(console, [...prefix, ...args]);
			}
		}

		once(id: string, ...args: any[]) {
			if (!this.onces[id]) {
				this.onces[id] = true;
				this.log(LogLevel.WHO_CARES, args);
			}
		}

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
	}

	export const ns = (ns: string, options: Partial<Logger.Options> = {}): Logger => {
		if (!registry[ns])
			registry[ns] = new LoggerInstance(
				ns,
				ns == DEFAULT_NAMESPACE ? defaultInstanceOptions : { ...defaultInstanceOptions, ...options }
			);
		return registry[ns];
	};

	export const exclusive = (name_space?: string) => {
		warn(`${name_space} is exclusive`);
		exclusiveLogger = name_space ? ns(name_space) : undefined;
	};

	const DEFAULT_NAMESPACE = "__default";

	const defaultInstance = ns(DEFAULT_NAMESPACE);

	const labels = [
		"EMERGENCY",
		"ALERT",
		"CRITICAL",
		"ERROR",
		"WARNING",
		"NOTICE",
		"INFO",
		"VERBOSE",
		"DEBUG",
		"WHO CARES?",
	];
	const baseStyle = {
		color: "white",
		"background-color": "#444",
		padding: "2px 4px",
		"border-radius": "2px",
	};

	const styles = [
		{
			// EMERGENCY
			"background-color": "red",
		},
		{
			// ALERT
			"background-color": "red",
		},
		{
			// CRITICAL
			"background-color": "red",
		},
		{
			// ERROR
			"background-color": "red",
		},
		{
			// WARNING
			"background-color": "orange",
		},
		{
			// NOTICE
			"background-color": "blue",
		},
		null, // INFO
		{
			// VERBOSE
			"background-color": "green",
		},
		{
			// DEBUG
			"background-color": "yellow",
			color: "black",
		},
		{
			// WHO_CARES
			"background-color": "lightgray",
			color: "black",
		},
	];

	export const emerg = (...args: any[]) => defaultInstance.emerg(LogLevel.EMERGENCY, ...args);
	export const alert = (...args: any[]) => defaultInstance.alert(...args);
	export const crit = (...args: any[]) => defaultInstance.crit(...args);
	export const error = (...args: any[]) => defaultInstance.error(...args);
	export const warn = (...args: any[]) => defaultInstance.warn(...args);
	export const notice = (...args: any[]) => defaultInstance.notice(...args);
	export const info = (...args: any[]) => defaultInstance.info(...args);
	export const verb = (...args: any[]) => defaultInstance.verb(...args);
	export const debug = (...args: any[]) => defaultInstance.debug(...args);
	export const wth = (...args: any[]) => defaultInstance.wth(...args);

	export const once = (id: string, ...args: any[]) => defaultInstance.once(id, ...args);
	export const limit = (key: string, count: number) => defaultInstance.limit(key, count);
}
