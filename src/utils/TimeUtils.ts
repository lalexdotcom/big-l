export namespace TimeUtils {
	export function waitFor(timeInMs: number): Promise<void> {
		return new Promise(res => setTimeout(res, timeInMs));
	}
}
