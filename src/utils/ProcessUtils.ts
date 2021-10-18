export namespace ProcessUtils {
	type PromiseGenerator<A extends any[] = any[], T = any> = (...args: A) => Promise<T>;
	type PromiseLaunch<A extends any[] = any[]> = { generator: PromiseGenerator<A>; args: A };

	class Pool {
		size: number;

		private running: Promise<any>[] = [];
		private enqueued: PromiseLaunch[] = [];

		private isClosed = false;

		private poolPromise: Promise<void>;
		private poolResolve!: (...args: any[]) => void;
		private poolReject!: (...args: any[]) => void;

		constructor(concurrency = 10) {
			this.size = concurrency;
			this.poolPromise = new Promise((res, rej) => {
				this.poolResolve = res;
				this.poolReject = rej;
			});
			console.log("Promise is", this.poolPromise, this.poolResolve, this.poolReject);
		}

		enqueue<P extends PromiseGenerator>(promiseGenerator: P, ...args: Parameters<P>) {
			console.log("Enqueue");
			this.enqueued.push({ generator: promiseGenerator, args });
			this.runNext();
		}

		private runNext() {
			if (this.enqueued.length) {
				while (this.running.length < this.size && !!this.enqueued.length) {
					console.log("Add promise");
					const nextPromiseGenerator = this.enqueued.shift();
					if (nextPromiseGenerator) {
						const nextPromise = nextPromiseGenerator.generator(...nextPromiseGenerator.args);
						nextPromise
							.then(() => this.promiseDone(nextPromise))
							.catch(e => this.promiseRejected(nextPromise, e));
						this.running.push(nextPromise);
					}
				}
			} else if (this.isClosed) {
				// console.log("No more queue, closing...");
				this.poolResolve();
			} else if (!this.running.length) {
				// console.log("Waiting for new promises or close");
			}
		}

		get promise() {
			return this.poolPromise;
		}

		private promiseDone(p: Promise<void>) {
			const promiseIndex = this.running.indexOf(p);
			if (promiseIndex >= 0) {
				this.running.splice(promiseIndex, 1);
				// console.log("Resolved");
				// console.log(">> Still running", this.running.length);
				this.runNext();
			}
		}

		private promiseRejected(p: Promise<void>, error: any) {
			const promiseIndex = this.running.indexOf(p);
			if (promiseIndex >= 0) {
				this.running.splice(promiseIndex, 1);
				console.error("Error", error.message);
				this.runNext();
			}
		}

		close() {
			this.isClosed = true;
			this.runNext();
		}
	}

	export function pool(concurrency = 10) {
		return new Pool(concurrency);
	}
}
