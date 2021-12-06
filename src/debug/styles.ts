import { EnvUtils } from "../utils/EnvUtils";
import { ObjectUtils } from "../utils/ObjectUtils";
import { LogLevel } from "./types";

const inBrowser = EnvUtils.isBrowser();

type LogLevelStyle = {
	backgroundColor?: string;
	color?: string;
};

const levelStyles: {
	[key in LogLevel]: LogLevelStyle;
} = {
	[LogLevel.EMERGENCY]: {
		backgroundColor: "red",
	},
	[LogLevel.ALERT]: {
		backgroundColor: "red",
	},
	[LogLevel.CRITICAL]: {
		backgroundColor: "red",
	},
	[LogLevel.ERROR]: {
		backgroundColor: "red",
	},
	[LogLevel.WARNING]: {
		backgroundColor: "orange",
	},
	[LogLevel.NOTICE]: {
		backgroundColor: "blue",
	},
	[LogLevel.INFO]: {},
	[LogLevel.VERBOSE]: {
		backgroundColor: "green",
	},
	[LogLevel.DEBUG]: {
		backgroundColor: "yellow",
		color: "black",
	},
	[LogLevel.WHO_CARES]: {
		backgroundColor: "lightgray",
		color: "black",
	},
};

export const LEVEL_STYLES = ObjectUtils.map(levelStyles, (sty: LogLevelStyle) => {
	const fullStyle = { ...DEFAULT_LEVEL_STYLE, ...sty };
	return {
		style: fullStyle,
		css: inBrowser ? css(fullStyle) : undefined,
	};
});

// Constants

const DEFAULT_LEVEL_STYLE = {
	backgroundColor: "grey",
	color: "white",
};

const DEFAULT_BROWSER_STYLE = {
	padding: "2px 4px",
	"border-radius": "2px",
};

export const css = (style: LogLevelStyle): string => {
	// const style = LEVEL_STYLES[level];

	const STYLE_MAP: { [key in keyof LogLevelStyle]: string } = {
		backgroundColor: "background-color",
	};

	const cssObject: Record<string, unknown> = { ...DEFAULT_BROWSER_STYLE };
	for (const [styleKey, styleValue] of Object.entries(style)) {
		const cssKey = STYLE_MAP[<keyof LogLevelStyle>styleKey] || styleKey;
		cssObject[cssKey] = styleValue;
	}

	return Object.entries(cssObject)
		.map(([key, value]) => `${key}: ${value}`)
		.join(";");
};
