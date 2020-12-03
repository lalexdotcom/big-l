import { LO } from "../utils/ObjectUtils";

export namespace LG {
	export enum Level {
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

	export let enabled: boolean = true;
	export let level: Level = Level.WHO_CARES;

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
			"color": "black",
		},
		{
			// DEBUG
			"background-color": "yellow",
			"color": "black",
		},
		{
			// WHO_CARES
			"background-color": "lightgray",
			color: "black",
		},
	];

	const log = (level: Level, args: any[]): void => {
		if (enabled) {
			if (level <= level) {
				const style = { ...baseStyle, ...styles[level] };
				const styleString = LO.reduce<string[]>(
					style,
					(reduced, key, val) => [...reduced, `${key}:${val}`],
					[]
				).join(";");
				let method = console.log;
				switch (level) {
					case Level.EMERGENCY:
					case Level.ALERT:
					case Level.CRITICAL:
					case Level.ERROR:
						method = console.error;
						break;
					case Level.WARNING:
					case Level.NOTICE:
						method = console.warn;
						break;
					case Level.INFO:
						method = console.info;
						break;
				}
				method.apply(console, [`%c${labels[level]}`, styleString, ...JSON.parse(JSON.stringify(args))]);
			}
		}
	};

	export const emerg = (...args: any[]) => log(Level.EMERGENCY, args);
	export const alert = (...args: any[]) => log(Level.ALERT, args);
	export const crit = (...args: any[]) => log(Level.CRITICAL, args);
	export const error = (...args: any[]) => log(Level.ERROR, args);
	export const warn = (...args: any[]) => log(Level.WARNING, args);
	export const notice = (...args: any[]) => log(Level.NOTICE, args);
	export const info = (...args: any[]) => log(Level.INFO, args);
	export const verb = (...args: any[]) => log(Level.VERBOSE, args);
	export const debug = (...args: any[]) => log(Level.DEBUG, args);
	export const wth = (...args: any[]) => log(Level.WHO_CARES, args);
}
