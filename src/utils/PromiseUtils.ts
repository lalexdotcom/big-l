export namespace PromiseUtils {
	export type PromiseFunction<T = any> = () => Promise<T>;
	// type PromiseCommand<A extends any[] = any[]> = { generator: PromiseGenerator<A>; args: A };
	type QueuedPromise = { generator: PromiseFunction; index: number };

	const DEFAULT_CONCURRENCY = 10;
	const DEFAULT_NAME = "pool";

	export interface Pool {
		enqueue<P extends PromiseFunction>(promiseGenerator: P): void;
		close(): Promise<any[]>;
	}

	export type PoolOptions = {
		concurrency?: number;
		name?: string;
		rejectOnError?: boolean;
		verbose?: boolean;
	};

	export interface PoolError extends Error {
		catched: any;
	}

	class PoolErrorImpl extends Error implements PoolError {
		catched: any;

		constructor(message: string, catched: any) {
			super(message);
			this.catched = catched;
		}
	}

	class PromisePool implements Pool {
		size: number;

		private name: string;
		private options?: PoolOptions;

		private currentIndex = 0;

		private running: Promise<any>[] = [];
		private enqueued: QueuedPromise[] = [];
		private result: any[] = [];

		private isClosed = false;
		private isDone = false;

		private poolPromise: Promise<any[]>;
		private poolResolve!: (...args: any[]) => void;
		private poolReject!: (...args: any[]) => void;

		constructor(options?: PoolOptions) {
			this.size = options?.concurrency || DEFAULT_CONCURRENCY;
			this.name = options?.name || DEFAULT_NAME;
			this.options = options;
			this.poolPromise = new Promise((res, rej) => {
				this.poolResolve = res;
				this.poolReject = rej;
			});
		}

		enqueue<P extends PromiseFunction>(promiseGenerator: P) {
			if (this.isClosed) throw new Error(`[${this.name}] PromisePool already closed`);
			if (this.isDone) throw new Error(`[${this.name}] PromisePool already performed`);
			this.log(`Enqueue promise@${this.currentIndex}`);
			this.enqueued.push({ index: this.currentIndex++, generator: promiseGenerator });
			this.runNext();
		}

		private log(...args: any[]) {
			if (this.options?.verbose) console.debug(`[${this.name}]`, ...args);
		}

		private warn(...args: any[]) {
			if (this.options?.verbose) console.warn(`[${this.name}]`, ...args);
		}

		private error(...args: any[]) {
			if (this.options?.verbose) console.error(`[${this.name}]`, ...args);
		}

		private runNext() {
			if (this.enqueued.length) {
				while (this.running.length < this.size && !!this.enqueued.length) {
					const nextQueuedPromise = this.enqueued.shift();
					this.log(`Run promise ${nextQueuedPromise?.index}`);
					if (nextQueuedPromise) {
						const nextPromise = nextQueuedPromise.generator();
						nextPromise
							.then(res => this.promiseDone(nextPromise, nextQueuedPromise.index, res))
							.catch(err => this.promiseRejected(nextPromise, nextQueuedPromise.index, err));
						this.running.push(nextPromise);
					}
				}
			} else if (!this.running.length) {
				if (this.isClosed) {
					this.log("No more queue: resolving");
					this.isDone = true;
					this.poolResolve(this.result);
				} else {
					this.log("Waiting for new promises or close instruction");
				}
			} else {
				this.log(`${this.running.length} promises still running`);
			}
		}

		get promise() {
			return this.poolPromise;
		}

		private promiseDone(p: Promise<void>, result: any, index: number) {
			if (this.isDone) return;
			const promiseIndex = this.running.indexOf(p);
			if (promiseIndex >= 0) {
				this.running.splice(promiseIndex, 1);
				this.result[index] = result;
				this.log(`Promise ${index} done with`, typeof result);
				this.runNext();
			} else {
				this.warn("Unknown promise resolved");
			}
		}

		private promiseRejected(p: Promise<void>, error: any, index: number) {
			if (this.isDone) return;
			const promiseIndex = this.running.indexOf(p);
			if (promiseIndex >= 0) {
				this.running.splice(promiseIndex, 1);
				this.result[index] = new PoolErrorImpl(`Promise ${index} was rejected`, error);
				if (this.options?.rejectOnError) {
					this.isDone = true;
					this.poolReject(error);
				} else {
					this.runNext();
				}
				this.error(`Promise ${index} error`, error);
			} else {
				this.warn("Unknown promise resolved");
			}
		}

		get pending(): number {
			return this.enqueued.length;
		}

		close() {
			this.log("Close pool");
			this.isClosed = true;
			this.runNext();
			return this.poolPromise;
		}
	}

	export function pool(concurrency = 10, name?: string): Pool {
		return new PromisePool({ concurrency, name });
	}

	export function parallel(commands: PromiseFunction[], options?: PoolOptions): Promise<any[]> {
		if (!commands.length) return Promise.resolve([]);
		const parallelPool = new PromisePool({ concurrency: Number.POSITIVE_INFINITY, ...options });
		for (const cmd of commands) parallelPool.enqueue(cmd);
		return parallelPool.close();
	}

	export function serie(commands: PromiseFunction[], options?: Omit<PoolOptions, "concurrency">): Promise<any[]> {
		if (!commands.length) return Promise.resolve([]);
		const parallelPool = new PromisePool({ ...options, concurrency: 1 });
		for (const cmd of commands) parallelPool.enqueue(cmd);
		return parallelPool.close();
	}
}
