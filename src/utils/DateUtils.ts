import { format, parse } from "date-fns";

export namespace DateUtils {
	export const ISO_TZ_FORMAT = "yyyy-MM-dd'T'HH:mm:ss.SSSXX";

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
}
