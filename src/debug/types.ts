// Types
export enum LogLevel {
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

export type LogOptions = {
	enabled?: boolean;
	stack?: boolean;
	date?: boolean;
	time?: boolean;
	level?: LogLevel;
	pad?: boolean;
};
