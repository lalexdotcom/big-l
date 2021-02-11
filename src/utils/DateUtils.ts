import { format, parse } from "date-fns";
import { isValid } from "date-fns/esm";

export namespace DateUtils {
	export namespace Format {
		export const ISO_TZ = "yyyy-MM-dd'T'HH:mm:ss.SSSXX";
		export const MYSQL_DATE = "yyyy-MM-dd";
		export const MYSQL_DATETIME = `${MYSQL_DATE} HH-mm-ss`;
	}

	export function formatISOTZ(date: undefined): undefined;
	export function formatISOTZ(date: null): null;
	export function formatISOTZ(date: Date): string;
	export function formatISOTZ(date: Date | null | undefined): string | null | undefined {
		if (!date) return date;
		return format(date, "yyyy-MM-dd'T'HH:mm:ss.SSSXX");
	}

	export function parseISOTZ(str: string): Date {
		return parse(str, "yyyy-MM-dd'T'HH:mm:ss.SSSXX", new Date());
	}

	export function valid(dte: Date | undefined): Date | undefined;
	export function valid(dte: Date | undefined, replace: Date): Date;
	export function valid<T>(dte: Date | undefined, replace: T): Date | T;
	export function valid<T>(dte: Date | undefined, replace?: T): Date | undefined | T {
		return isValid(dte) ? dte : replace;
	}
}
