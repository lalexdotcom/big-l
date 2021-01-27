import { format, parse } from "date-fns";

export namespace DateUtils {
	export function formatISOTZ(date: Date): string {
		return format(date, "yyyy-MM-dd'T'HH:mm:ssXX");
	}

	export function parseISOTZ(str: string): Date {
		return parse(str, "yyyy-MM-dd'T'HH:mm:ssXX", new Date());
	}
}
