export namespace EnvUtils {
	export function isMobile() {
		return isBrowser() && !!navigator.userAgent.toLowerCase().match(/mobile/i);
	}

	export function isNode() {
		return typeof process !== "undefined" && process.versions != null && process.versions.node != null;
	}

	export function isBrowser() {
		return typeof window !== "undefined" && typeof window.document !== "undefined";
	}

	export function isWebWorker() {
		return typeof self === "object" && self.constructor && self.constructor.name === "DedicatedWorkerGlobalScope";
	}
}
