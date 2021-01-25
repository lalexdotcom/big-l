export namespace Timer {
	export function timeSync<FT extends (...args: any[]) => any>(
		cb: FT,
		...args: Parameters<FT>
	): { result: ReturnType<FT>; time: number } {
		const start = new Date().valueOf();
		const result = cb(...args);
		return { result, time: new Date().valueOf() - start };
	}

	export async function timeAsync<PT, FT extends (...args: any[]) => Promise<PT>>(
		cb: FT,
		...args: Parameters<FT>
	): Promise<{ result: PT; time: number }> {
		const start = new Date().valueOf();
		const result = await cb(...args);
		return { result, time: new Date().valueOf() - start };
	}
}
