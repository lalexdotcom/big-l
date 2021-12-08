import { EnvUtils } from "../utils/EnvUtils";
import { LogLevel, LogOptions } from "./types";

const inNode = EnvUtils.isNode();

type LogLevelParam = { label: string; paddedLabel?: string; methods: typeof console.info[] };

export const DEFAULT_LOGGER_OPTIONS: Required<LogOptions> = {
	enabled: true,
	stack: false,
	date: false,
	time: false,
	level: LogLevel.WHO_CARES,
	pad: true,
};

export const LEVEL_PARAMS: {
	[key in LogLevel]: LogLevelParam;
} = {
	[LogLevel.EMERGENCY]: {
		label: "EMERGENCY",
		methods: [console.error, console.trace],
	},
	[LogLevel.ALERT]: {
		label: "ALERT",
		methods: [console.error, console.trace],
	},
	[LogLevel.CRITICAL]: {
		label: "CRITICAL",
		methods: [console.error, console.trace],
	},
	[LogLevel.ERROR]: {
		label: "ERROR",
		methods: [console.error],
	},
	[LogLevel.WARNING]: {
		label: "WARNING",
		methods: [console.warn],
	},
	[LogLevel.NOTICE]: {
		label: "NOTICE",
		methods: [console.info],
	},
	[LogLevel.INFO]: {
		label: "INFO",
		methods: [console.info],
	},
	[LogLevel.VERBOSE]: {
		label: "VERBOSE",
		methods: [console.debug],
	},
	[LogLevel.DEBUG]: {
		label: "DEBUG",
		methods: [console.debug],
	},
	[LogLevel.WHO_CARES]: {
		label: "WHO CARES?",
		methods: [console.debug],
	},
};
if (inNode) {
	const padSize = Math.max(...Object.values(LEVEL_PARAMS).map(info => info.label.length));
	for (const lvl of Object.values(LEVEL_PARAMS)) {
		lvl.paddedLabel = lvl.label
			.padEnd(lvl.label.length + (padSize - lvl.label.length) / 2, " ")
			.padStart(padSize, " ");
	}
}
