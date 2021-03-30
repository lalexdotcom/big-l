export namespace TimeUtils {
	export function waitFor(time: number): Promise<void> {
		return new Promise(res => setTimeout(res, time));
	}
}
