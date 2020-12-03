import { LO } from "../utils/ObjectUtils";

export enum LoggerLevel {
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
		"background-color": "yellow",
	},
	{
		// DEBUG
		"background-color": "yellow",
	},
	{
		// WHO_CARES
		"background-color": "lightgray",
		color: "black",
	},
];

export default class Logger {
	public static enabled: boolean = true;
	public static level: LoggerLevel = LoggerLevel.WHO_CARES;

	private static log(level: LoggerLevel, args: any[]) {
		if (this.enabled) {
			if (level <= this.level) {
				const style = { ...baseStyle, ...styles[level] };
				const styleString = LO.reduce<string[]>(
					style,
					(reduced, key, val) => [...reduced, `${key}:${val}`],
					[]
				);
				let method = console.log;
				switch (level) {
					case LoggerLevel.EMERGENCY:
					case LoggerLevel.ALERT:
					case LoggerLevel.CRITICAL:
					case LoggerLevel.ERROR:
						method = console.error;
						break;
					case LoggerLevel.WARNING:
					case LoggerLevel.NOTICE:
						method = console.warn;
						break;
					case LoggerLevel.INFO:
						method = console.info;
						break;
				}
				method.apply(console, [`%c${labels[level]}`, styleString, ...JSON.parse(JSON.stringify(args))]);
			}
		}
	}

	static emerg = (...args: any[]) => Logger.log(LoggerLevel.EMERGENCY, args);
	static alert = (...args: any[]) => Logger.log(LoggerLevel.ALERT, args);
	static crit = (...args: any[]) => Logger.log(LoggerLevel.CRITICAL, args);
	static error = (...args: any[]) => Logger.log(LoggerLevel.ERROR, args);
	static warn = (...args: any[]) => Logger.log(LoggerLevel.WARNING, args);
	static notice = (...args: any[]) => Logger.log(LoggerLevel.NOTICE, args);
	static info = (...args: any[]) => Logger.log(LoggerLevel.INFO, args);
	static verb = (...args: any[]) => Logger.log(LoggerLevel.VERBOSE, args);
	static debug = (...args: any[]) => Logger.log(LoggerLevel.DEBUG, args);
	static wth = (...args: any[]) => Logger.log(LoggerLevel.WHO_CARES, args);
}
