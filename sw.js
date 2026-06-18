//#region node_modules/serwist/dist/chunks/waitUntil-BHDx3Rgo.js
var e = {
	googleAnalytics: "googleAnalytics",
	precache: "precache-v2",
	prefix: "serwist",
	runtime: "runtime",
	suffix: typeof registration < "u" ? registration.scope : ""
}, t = (t) => [
	e.prefix,
	t,
	e.suffix
].filter((e) => e && e.length > 0).join("-"), n = (t) => {
	for (let n of Object.keys(e)) t(n);
}, r = {
	updateDetails: (t) => {
		n((n) => {
			let r = t[n];
			typeof r == "string" && (e[n] = r);
		});
	},
	getGoogleAnalyticsName: (n) => n || t(e.googleAnalytics),
	getPrecacheName: (n) => n || t(e.precache),
	getPrefix: () => e.prefix,
	getRuntimeName: (n) => n || t(e.runtime),
	getSuffix: () => e.suffix
}, i;
function a() {
	if (i === void 0) {
		let e = new Response("");
		if ("body" in e) try {
			new Response(e.body), i = !0;
		} catch {
			i = !1;
		}
		i = !1;
	}
	return i;
}
var o = (e, ...t) => {
	let n = e;
	return t.length > 0 && (n += ` :: ${JSON.stringify(t)}`), n;
}, s = class extends Error {
	details;
	constructor(e, t) {
		let n = o(e, t);
		super(n), this.name = e, this.details = t;
	}
}, c = (e) => new URL(String(e), location.href).href.replace(RegExp(`^${location.origin}`), "");
function l(e) {
	return new Promise((t) => setTimeout(t, e));
}
var u = /* @__PURE__ */ new Set();
function d(e, t) {
	let n = new URL(e);
	for (let e of t) n.searchParams.delete(e);
	return n.href;
}
async function f(e, t, n, r) {
	let i = d(t.url, n);
	if (t.url === i) return e.match(t, r);
	let a = {
		...r,
		ignoreSearch: !0
	}, o = await e.keys(t, a);
	for (let t of o) if (i === d(t.url, n)) return e.match(t, r);
}
var p = class {
	promise;
	resolve;
	reject;
	constructor() {
		this.promise = new Promise((e, t) => {
			this.resolve = e, this.reject = t;
		});
	}
}, m = async () => {
	for (let e of u) await e();
}, h = "-precache-", g = async (e, t = h) => {
	let n = (await self.caches.keys()).filter((n) => n.includes(t) && n.includes(self.registration.scope) && n !== e);
	return await Promise.all(n.map((e) => self.caches.delete(e))), n;
}, ee = (e) => {
	self.addEventListener("activate", (t) => {
		t.waitUntil(g(r.getPrecacheName(e)).then((e) => {}));
	});
}, te = () => {
	self.addEventListener("activate", () => self.clients.claim());
}, _ = (e, t) => {
	let n = t();
	return e.waitUntil(n), n;
}, v = (e, t) => t.some((t) => e instanceof t), ne, re;
function ie() {
	return ne ||= [
		IDBDatabase,
		IDBObjectStore,
		IDBIndex,
		IDBCursor,
		IDBTransaction
	];
}
function ae() {
	return re ||= [
		IDBCursor.prototype.advance,
		IDBCursor.prototype.continue,
		IDBCursor.prototype.continuePrimaryKey
	];
}
var y = /* @__PURE__ */ new WeakMap(), b = /* @__PURE__ */ new WeakMap(), x = /* @__PURE__ */ new WeakMap();
function oe(e) {
	let t = new Promise((t, n) => {
		let r = () => {
			e.removeEventListener("success", i), e.removeEventListener("error", a);
		}, i = () => {
			t(w(e.result)), r();
		}, a = () => {
			n(e.error), r();
		};
		e.addEventListener("success", i), e.addEventListener("error", a);
	});
	return x.set(t, e), t;
}
function se(e) {
	if (y.has(e)) return;
	let t = new Promise((t, n) => {
		let r = () => {
			e.removeEventListener("complete", i), e.removeEventListener("error", a), e.removeEventListener("abort", a);
		}, i = () => {
			t(), r();
		}, a = () => {
			n(e.error || new DOMException("AbortError", "AbortError")), r();
		};
		e.addEventListener("complete", i), e.addEventListener("error", a), e.addEventListener("abort", a);
	});
	y.set(e, t);
}
var S = {
	get(e, t, n) {
		if (e instanceof IDBTransaction) {
			if (t === "done") return y.get(e);
			if (t === "store") return n.objectStoreNames[1] ? void 0 : n.objectStore(n.objectStoreNames[0]);
		}
		return w(e[t]);
	},
	set(e, t, n) {
		return e[t] = n, !0;
	},
	has(e, t) {
		return e instanceof IDBTransaction && (t === "done" || t === "store") ? !0 : t in e;
	}
};
function C(e) {
	S = e(S);
}
function ce(e) {
	return ae().includes(e) ? function(...t) {
		return e.apply(T(this), t), w(this.request);
	} : function(...t) {
		return w(e.apply(T(this), t));
	};
}
function le(e) {
	return typeof e == "function" ? ce(e) : (e instanceof IDBTransaction && se(e), v(e, ie()) ? new Proxy(e, S) : e);
}
function w(e) {
	if (e instanceof IDBRequest) return oe(e);
	if (b.has(e)) return b.get(e);
	let t = le(e);
	return t !== e && (b.set(e, t), x.set(t, e)), t;
}
var T = (e) => x.get(e);
function ue(e, t, { blocked: n, upgrade: r, blocking: i, terminated: a } = {}) {
	let o = indexedDB.open(e, t), s = w(o);
	return r && o.addEventListener("upgradeneeded", (e) => {
		r(w(o.result), e.oldVersion, e.newVersion, w(o.transaction), e);
	}), n && o.addEventListener("blocked", (e) => n(e.oldVersion, e.newVersion, e)), s.then((e) => {
		a && e.addEventListener("close", () => a()), i && e.addEventListener("versionchange", (e) => i(e.oldVersion, e.newVersion, e));
	}).catch(() => {}), s;
}
function de(e, { blocked: t } = {}) {
	let n = indexedDB.deleteDatabase(e);
	return t && n.addEventListener("blocked", (e) => t(e.oldVersion, e)), w(n).then(() => void 0);
}
var fe = [
	"get",
	"getKey",
	"getAll",
	"getAllKeys",
	"count"
], pe = [
	"put",
	"add",
	"delete",
	"clear"
], E = /* @__PURE__ */ new Map();
function D(e, t) {
	if (!(e instanceof IDBDatabase && !(t in e) && typeof t == "string")) return;
	if (E.get(t)) return E.get(t);
	let n = t.replace(/FromIndex$/, ""), r = t !== n, i = pe.includes(n);
	if (!(n in (r ? IDBIndex : IDBObjectStore).prototype) || !(i || fe.includes(n))) return;
	let a = async function(e, ...t) {
		let a = this.transaction(e, i ? "readwrite" : "readonly"), o = a.store;
		return r && (o = o.index(t.shift())), (await Promise.all([o[n](...t), i && a.done]))[0];
	};
	return E.set(t, a), a;
}
C((e) => ({
	...e,
	get: (t, n, r) => D(t, n) || e.get(t, n, r),
	has: (t, n) => !!D(t, n) || e.has(t, n)
}));
var me = [
	"continue",
	"continuePrimaryKey",
	"advance"
], O = {}, k = /* @__PURE__ */ new WeakMap(), A = /* @__PURE__ */ new WeakMap(), he = { get(e, t) {
	if (!me.includes(t)) return e[t];
	let n = O[t];
	return n ||= O[t] = function(...e) {
		k.set(this, A.get(this)[t](...e));
	}, n;
} };
async function* ge(...e) {
	let t = this;
	if (t instanceof IDBCursor || (t = await t.openCursor(...e)), !t) return;
	t = t;
	let n = new Proxy(t, he);
	for (A.set(n, t), x.set(n, T(t)); t;) yield n, t = await (k.get(n) || t.continue()), k.delete(n);
}
function j(e, t) {
	return t === Symbol.asyncIterator && v(e, [
		IDBIndex,
		IDBObjectStore,
		IDBCursor
	]) || t === "iterate" && v(e, [IDBIndex, IDBObjectStore]);
}
C((e) => ({
	...e,
	get(t, n, r) {
		return j(t, n) ? ge : e.get(t, n, r);
	},
	has(t, n) {
		return j(t, n) || e.has(t, n);
	}
}));
//#endregion
//#region node_modules/serwist/dist/chunks/printInstallDetails-c9A08ZVZ.js
var _e = async (e, t) => {
	let n = null;
	if (e.url && (n = new URL(e.url).origin), n !== self.location.origin) throw new s("cross-origin-copy-response", { origin: n });
	let r = e.clone(), i = {
		headers: new Headers(r.headers),
		status: r.status,
		statusText: r.statusText
	}, o = t ? t(i) : i, c = a() ? r.body : await r.blob();
	return new Response(c, o);
}, ve = () => {
	self.__WB_DISABLE_DEV_LOGS = !0;
}, M = 3, ye = "serwist-background-sync", N = "requests", P = "queueName", be = class {
	_db = null;
	async addEntry(e) {
		let t = (await this.getDb()).transaction(N, "readwrite", { durability: "relaxed" });
		await t.store.add(e), await t.done;
	}
	async getFirstEntryId() {
		return (await (await this.getDb()).transaction(N).store.openCursor())?.value.id;
	}
	async getAllEntriesByQueueName(e) {
		return await (await this.getDb()).getAllFromIndex(N, P, IDBKeyRange.only(e)) || [];
	}
	async getEntryCountByQueueName(e) {
		return (await this.getDb()).countFromIndex(N, P, IDBKeyRange.only(e));
	}
	async deleteEntry(e) {
		await (await this.getDb()).delete(N, e);
	}
	async getFirstEntryByQueueName(e) {
		return await this.getEndEntryFromIndex(IDBKeyRange.only(e), "next");
	}
	async getLastEntryByQueueName(e) {
		return await this.getEndEntryFromIndex(IDBKeyRange.only(e), "prev");
	}
	async getEndEntryFromIndex(e, t) {
		return (await (await this.getDb()).transaction(N).store.index(P).openCursor(e, t))?.value;
	}
	async getDb() {
		return this._db ||= await ue(ye, M, { upgrade: this._upgradeDb }), this._db;
	}
	_upgradeDb(e, t) {
		t > 0 && t < M && e.objectStoreNames.contains(N) && e.deleteObjectStore(N), e.createObjectStore(N, {
			autoIncrement: !0,
			keyPath: "id"
		}).createIndex(P, P, { unique: !1 });
	}
}, xe = class {
	_queueName;
	_queueDb;
	constructor(e) {
		this._queueName = e, this._queueDb = new be();
	}
	async pushEntry(e) {
		delete e.id, e.queueName = this._queueName, await this._queueDb.addEntry(e);
	}
	async unshiftEntry(e) {
		let t = await this._queueDb.getFirstEntryId();
		t ? e.id = t - 1 : delete e.id, e.queueName = this._queueName, await this._queueDb.addEntry(e);
	}
	async popEntry() {
		return this._removeEntry(await this._queueDb.getLastEntryByQueueName(this._queueName));
	}
	async shiftEntry() {
		return this._removeEntry(await this._queueDb.getFirstEntryByQueueName(this._queueName));
	}
	async getAll() {
		return await this._queueDb.getAllEntriesByQueueName(this._queueName);
	}
	async size() {
		return await this._queueDb.getEntryCountByQueueName(this._queueName);
	}
	async deleteEntry(e) {
		await this._queueDb.deleteEntry(e);
	}
	async _removeEntry(e) {
		return e && await this.deleteEntry(e.id), e;
	}
}, Se = [
	"method",
	"referrer",
	"referrerPolicy",
	"mode",
	"credentials",
	"cache",
	"redirect",
	"integrity",
	"keepalive"
], F = class e {
	_requestData;
	static async fromRequest(t) {
		let n = {
			url: t.url,
			headers: {}
		};
		t.method !== "GET" && (n.body = await t.clone().arrayBuffer()), t.headers.forEach((e, t) => {
			n.headers[t] = e;
		});
		for (let e of Se) t[e] !== void 0 && (n[e] = t[e]);
		return new e(n);
	}
	constructor(e) {
		e.mode === "navigate" && (e.mode = "same-origin"), this._requestData = e;
	}
	toObject() {
		let e = Object.assign({}, this._requestData);
		return e.headers = Object.assign({}, this._requestData.headers), e.body &&= e.body.slice(0), e;
	}
	toRequest() {
		return new Request(this._requestData.url, this._requestData);
	}
	clone() {
		return new e(this.toObject());
	}
}, I = "serwist-background-sync", Ce = 1440 * 7, L = /* @__PURE__ */ new Set(), we = (e) => {
	let t = {
		request: new F(e.requestData).toRequest(),
		timestamp: e.timestamp
	};
	return e.metadata && (t.metadata = e.metadata), t;
}, Te = class {
	_name;
	_onSync;
	_maxRetentionTime;
	_queueStore;
	_forceSyncFallback;
	_syncInProgress = !1;
	_requestsAddedDuringSync = !1;
	constructor(e, { forceSyncFallback: t, onSync: n, maxRetentionTime: r } = {}) {
		if (L.has(e)) throw new s("duplicate-queue-name", { name: e });
		L.add(e), this._name = e, this._onSync = n || this.replayRequests, this._maxRetentionTime = r || Ce, this._forceSyncFallback = !!t, this._queueStore = new xe(this._name), this._addSyncListener();
	}
	get name() {
		return this._name;
	}
	async pushRequest(e) {
		await this._addRequest(e, "push");
	}
	async unshiftRequest(e) {
		await this._addRequest(e, "unshift");
	}
	async popRequest() {
		return this._removeRequest("pop");
	}
	async shiftRequest() {
		return this._removeRequest("shift");
	}
	async getAll() {
		let e = await this._queueStore.getAll(), t = Date.now(), n = [];
		for (let r of e) {
			let e = this._maxRetentionTime * 60 * 1e3;
			t - r.timestamp > e ? await this._queueStore.deleteEntry(r.id) : n.push(we(r));
		}
		return n;
	}
	async size() {
		return await this._queueStore.size();
	}
	async _addRequest({ request: e, metadata: t, timestamp: n = Date.now() }, r) {
		let i = {
			requestData: (await F.fromRequest(e.clone())).toObject(),
			timestamp: n
		};
		switch (t && (i.metadata = t), r) {
			case "push":
				await this._queueStore.pushEntry(i);
				break;
			case "unshift":
				await this._queueStore.unshiftEntry(i);
				break;
		}
		this._syncInProgress ? this._requestsAddedDuringSync = !0 : await this.registerSync();
	}
	async _removeRequest(e) {
		let t = Date.now(), n;
		switch (e) {
			case "pop":
				n = await this._queueStore.popEntry();
				break;
			case "shift":
				n = await this._queueStore.shiftEntry();
				break;
		}
		if (n) {
			let r = this._maxRetentionTime * 60 * 1e3;
			return t - n.timestamp > r ? this._removeRequest(e) : we(n);
		}
	}
	async replayRequests() {
		let e;
		for (; e = await this.shiftRequest();) try {
			await fetch(e.request.clone());
		} catch {
			throw await this.unshiftRequest(e), new s("queue-replay-failed", { name: this._name });
		}
	}
	async registerSync() {
		if ("sync" in self.registration && !this._forceSyncFallback) try {
			await self.registration.sync.register(`${I}:${this._name}`);
		} catch {}
	}
	_addSyncListener() {
		"sync" in self.registration && !this._forceSyncFallback ? self.addEventListener("sync", (e) => {
			e.tag === `${I}:${this._name}` && e.waitUntil((async () => {
				this._syncInProgress = !0;
				let t;
				try {
					await this._onSync({ queue: this });
				} catch (e) {
					if (e instanceof Error) throw t = e, t;
				} finally {
					this._requestsAddedDuringSync && !(t && !e.lastChance) && await this.registerSync(), this._syncInProgress = !1, this._requestsAddedDuringSync = !1;
				}
			})());
		}) : this._onSync({ queue: this });
	}
	static get _queueNames() {
		return L;
	}
}, Ee = class {
	_queue;
	constructor(e, t) {
		this._queue = new Te(e, t);
	}
	async fetchDidFail({ request: e }) {
		await this._queue.pushRequest({ request: e });
	}
}, De = { cacheWillUpdate: async ({ response: e }) => e.status === 200 || e.status === 0 ? e : null };
function R(e) {
	return typeof e == "string" ? new Request(e) : e;
}
var Oe = class {
	event;
	request;
	url;
	params;
	_cacheKeys = {};
	_strategy;
	_handlerDeferred;
	_extendLifetimePromises;
	_plugins;
	_pluginStateMap;
	constructor(e, t) {
		this.event = t.event, this.request = t.request, t.url && (this.url = t.url, this.params = t.params), this._strategy = e, this._handlerDeferred = new p(), this._extendLifetimePromises = [], this._plugins = [...e.plugins], this._pluginStateMap = /* @__PURE__ */ new Map();
		for (let e of this._plugins) this._pluginStateMap.set(e, {});
		this.event.waitUntil(this._handlerDeferred.promise);
	}
	async fetch(e) {
		let { event: t } = this, n = R(e), r = await this.getPreloadResponse();
		if (r) return r;
		let i = this.hasCallback("fetchDidFail") ? n.clone() : null;
		try {
			for (let e of this.iterateCallbacks("requestWillFetch")) n = await e({
				request: n.clone(),
				event: t
			});
		} catch (e) {
			if (e instanceof Error) throw new s("plugin-error-request-will-fetch", { thrownErrorMessage: e.message });
		}
		let a = n.clone();
		try {
			let e;
			e = await fetch(n, n.mode === "navigate" ? void 0 : this._strategy.fetchOptions);
			for (let n of this.iterateCallbacks("fetchDidSucceed")) e = await n({
				event: t,
				request: a,
				response: e
			});
			return e;
		} catch (e) {
			throw i && await this.runCallbacks("fetchDidFail", {
				error: e,
				event: t,
				originalRequest: i.clone(),
				request: a.clone()
			}), e;
		}
	}
	async fetchAndCachePut(e) {
		let t = await this.fetch(e), n = t.clone();
		return this.waitUntil(this.cachePut(e, n)), t;
	}
	async cacheMatch(e) {
		let t = R(e), n, { cacheName: r, matchOptions: i } = this._strategy, a = await this.getCacheKey(t, "read"), o = {
			...i,
			cacheName: r
		};
		n = await caches.match(a, o);
		for (let e of this.iterateCallbacks("cachedResponseWillBeUsed")) n = await e({
			cacheName: r,
			matchOptions: i,
			cachedResponse: n,
			request: a,
			event: this.event
		}) || void 0;
		return n;
	}
	async cachePut(e, t) {
		let n = R(e);
		await l(0);
		let r = await this.getCacheKey(n, "write");
		if (!t) throw new s("cache-put-with-no-response", { url: c(r.url) });
		let i = await this._ensureResponseSafeToCache(t);
		if (!i) return !1;
		let { cacheName: a, matchOptions: o } = this._strategy, u = await self.caches.open(a), d = this.hasCallback("cacheDidUpdate"), p = d ? await f(u, r.clone(), ["__WB_REVISION__"], o) : null;
		try {
			await u.put(r, d ? i.clone() : i);
		} catch (e) {
			if (e instanceof Error) throw e.name === "QuotaExceededError" && await m(), e;
		}
		for (let e of this.iterateCallbacks("cacheDidUpdate")) await e({
			cacheName: a,
			oldResponse: p,
			newResponse: i.clone(),
			request: r,
			event: this.event
		});
		return !0;
	}
	async getCacheKey(e, t) {
		let n = `${e.url} | ${t}`;
		if (!this._cacheKeys[n]) {
			let r = e;
			for (let e of this.iterateCallbacks("cacheKeyWillBeUsed")) r = R(await e({
				mode: t,
				request: r,
				event: this.event,
				params: this.params
			}));
			this._cacheKeys[n] = r;
		}
		return this._cacheKeys[n];
	}
	hasCallback(e) {
		for (let t of this._strategy.plugins) if (e in t) return !0;
		return !1;
	}
	async runCallbacks(e, t) {
		for (let n of this.iterateCallbacks(e)) await n(t);
	}
	*iterateCallbacks(e) {
		for (let t of this._strategy.plugins) if (typeof t[e] == "function") {
			let n = this._pluginStateMap.get(t);
			yield (r) => {
				let i = {
					...r,
					state: n
				};
				return t[e](i);
			};
		}
	}
	waitUntil(e) {
		return this._extendLifetimePromises.push(e), e;
	}
	async doneWaiting() {
		let e;
		for (; e = this._extendLifetimePromises.shift();) await e;
	}
	destroy() {
		this._handlerDeferred.resolve(null);
	}
	async getPreloadResponse() {
		if (this.event instanceof FetchEvent && this.event.request.mode === "navigate" && "preloadResponse" in this.event) try {
			let e = await this.event.preloadResponse;
			if (e) return e;
		} catch {
			return;
		}
	}
	async _ensureResponseSafeToCache(e) {
		let t = e, n = !1;
		for (let e of this.iterateCallbacks("cacheWillUpdate")) if (t = await e({
			request: this.request,
			response: t,
			event: this.event
		}) || void 0, n = !0, !t) break;
		return n || t && t.status !== 200 && (t = void 0), t;
	}
}, z = class {
	cacheName;
	plugins;
	fetchOptions;
	matchOptions;
	constructor(e = {}) {
		this.cacheName = r.getRuntimeName(e.cacheName), this.plugins = e.plugins || [], this.fetchOptions = e.fetchOptions, this.matchOptions = e.matchOptions;
	}
	handle(e) {
		let [t] = this.handleAll(e);
		return t;
	}
	handleAll(e) {
		e instanceof FetchEvent && (e = {
			event: e,
			request: e.request
		});
		let t = e.event, n = typeof e.request == "string" ? new Request(e.request) : e.request, r = new Oe(this, e.url ? {
			event: t,
			request: n,
			url: e.url,
			params: e.params
		} : {
			event: t,
			request: n
		}), i = this._getResponse(r, n, t);
		return [i, this._awaitComplete(i, r, n, t)];
	}
	async _getResponse(e, t, n) {
		await e.runCallbacks("handlerWillStart", {
			event: n,
			request: t
		});
		let r;
		try {
			if (r = await this._handle(t, e), r === void 0 || r.type === "error") throw new s("no-response", { url: t.url });
		} catch (i) {
			if (i instanceof Error) {
				for (let a of e.iterateCallbacks("handlerDidError")) if (r = await a({
					error: i,
					event: n,
					request: t
				}), r !== void 0) break;
			}
			if (!r) throw i;
		}
		for (let i of e.iterateCallbacks("handlerWillRespond")) r = await i({
			event: n,
			request: t,
			response: r
		});
		return r;
	}
	async _awaitComplete(e, t, n, r) {
		let i, a;
		try {
			i = await e;
		} catch {}
		try {
			await t.runCallbacks("handlerDidRespond", {
				event: r,
				request: n,
				response: i
			}), await t.doneWaiting();
		} catch (e) {
			e instanceof Error && (a = e);
		}
		if (await t.runCallbacks("handlerDidComplete", {
			event: r,
			request: n,
			response: i,
			error: a
		}), t.destroy(), a) throw a;
	}
}, B = class extends z {
	_networkTimeoutSeconds;
	constructor(e = {}) {
		super(e), this.plugins.some((e) => "cacheWillUpdate" in e) || this.plugins.unshift(De), this._networkTimeoutSeconds = e.networkTimeoutSeconds || 0;
	}
	async _handle(e, t) {
		let n = [], r = [], i;
		if (this._networkTimeoutSeconds) {
			let { id: a, promise: o } = this._getTimeoutPromise({
				request: e,
				logs: n,
				handler: t
			});
			i = a, r.push(o);
		}
		let a = this._getNetworkPromise({
			timeoutId: i,
			request: e,
			logs: n,
			handler: t
		});
		r.push(a);
		let o = await t.waitUntil((async () => await t.waitUntil(Promise.race(r)) || await a)());
		if (!o) throw new s("no-response", { url: e.url });
		return o;
	}
	_getTimeoutPromise({ request: e, logs: t, handler: n }) {
		let r;
		return {
			promise: new Promise((t) => {
				r = setTimeout(async () => {
					t(await n.cacheMatch(e));
				}, this._networkTimeoutSeconds * 1e3);
			}),
			id: r
		};
	}
	async _getNetworkPromise({ timeoutId: e, request: t, logs: n, handler: r }) {
		let i, a;
		try {
			a = await r.fetchAndCachePut(t);
		} catch (e) {
			e instanceof Error && (i = e);
		}
		return e && clearTimeout(e), (i || !a) && (a = await r.cacheMatch(t)), a;
	}
}, ke = class extends z {
	_networkTimeoutSeconds;
	constructor(e = {}) {
		super(e), this._networkTimeoutSeconds = e.networkTimeoutSeconds || 0;
	}
	async _handle(e, t) {
		let n, r;
		try {
			let n = [t.fetch(e)];
			if (this._networkTimeoutSeconds) {
				let e = l(this._networkTimeoutSeconds * 1e3);
				n.push(e);
			}
			if (r = await Promise.race(n), !r) throw Error(`Timed out the network response after ${this._networkTimeoutSeconds} seconds.`);
		} catch (e) {
			e instanceof Error && (n = e);
		}
		if (!r) throw new s("no-response", {
			url: e.url,
			error: n
		});
		return r;
	}
}, V = (e) => e && typeof e == "object" ? e : { handle: e }, H = class {
	handler;
	match;
	method;
	catchHandler;
	constructor(e, t, n = "GET") {
		this.handler = V(t), this.match = e, this.method = n;
	}
	setCatchHandler(e) {
		this.catchHandler = V(e);
	}
}, Ae = class e extends z {
	_fallbackToNetwork;
	static defaultPrecacheCacheabilityPlugin = { async cacheWillUpdate({ response: e }) {
		return !e || e.status >= 400 ? null : e;
	} };
	static copyRedirectedCacheableResponsesPlugin = { async cacheWillUpdate({ response: e }) {
		return e.redirected ? await _e(e) : e;
	} };
	constructor(t = {}) {
		t.cacheName = r.getPrecacheName(t.cacheName), super(t), this._fallbackToNetwork = t.fallbackToNetwork !== !1, this.plugins.push(e.copyRedirectedCacheableResponsesPlugin);
	}
	async _handle(e, t) {
		return await t.getPreloadResponse() || await t.cacheMatch(e) || (t.event && t.event.type === "install" ? await this._handleInstall(e, t) : await this._handleFetch(e, t));
	}
	async _handleFetch(e, t) {
		let n, r = t.params || {};
		if (this._fallbackToNetwork) {
			let i = r.integrity, a = e.integrity, o = !a || a === i;
			n = await t.fetch(new Request(e, { integrity: e.mode === "no-cors" ? void 0 : a || i })), i && o && e.mode !== "no-cors" && (this._useDefaultCacheabilityPluginIfNeeded(), await t.cachePut(e, n.clone()));
		} else throw new s("missing-precache-entry", {
			cacheName: this.cacheName,
			url: e.url
		});
		return n;
	}
	async _handleInstall(e, t) {
		this._useDefaultCacheabilityPluginIfNeeded();
		let n = await t.fetch(e);
		if (!await t.cachePut(e, n.clone())) throw new s("bad-precaching-response", {
			url: e.url,
			status: n.status
		});
		return n;
	}
	_useDefaultCacheabilityPluginIfNeeded() {
		let t = null, n = 0;
		for (let [r, i] of this.plugins.entries()) i !== e.copyRedirectedCacheableResponsesPlugin && (i === e.defaultPrecacheCacheabilityPlugin && (t = r), i.cacheWillUpdate && n++);
		n === 0 ? this.plugins.push(e.defaultPrecacheCacheabilityPlugin) : n > 1 && t !== null && this.plugins.splice(t, 1);
	}
}, je = class extends H {
	_allowlist;
	_denylist;
	constructor(e, { allowlist: t = [/./], denylist: n = [] } = {}) {
		super((e) => this._match(e), e), this._allowlist = t, this._denylist = n;
	}
	_match({ url: e, request: t }) {
		if (t && t.mode !== "navigate") return !1;
		let n = e.pathname + e.search;
		for (let e of this._denylist) if (e.test(n)) return !1;
		return !!this._allowlist.some((e) => e.test(n));
	}
}, Me = () => !!self.registration?.navigationPreload, Ne = (e) => {
	Me() && self.addEventListener("activate", (t) => {
		t.waitUntil(self.registration.navigationPreload.enable().then(() => {
			e && self.registration.navigationPreload.setHeaderValue(e);
		}));
	});
}, Pe = (e, t = []) => {
	for (let n of [...e.searchParams.keys()]) t.some((e) => e.test(n)) && e.searchParams.delete(n);
	return e;
};
function* Fe(e, { directoryIndex: t = "index.html", ignoreURLParametersMatching: n = [/^utm_/, /^fbclid$/], cleanURLs: r = !0, urlManipulation: i } = {}) {
	let a = new URL(e, location.href);
	a.hash = "", yield a.href;
	let o = Pe(a, n);
	if (yield o.href, t && o.pathname.endsWith("/")) {
		let e = new URL(o.href);
		e.pathname += t, yield e.href;
	}
	if (r) {
		let e = new URL(o.href);
		e.pathname += ".html", yield e.href;
	}
	if (i) {
		let e = i({ url: a });
		for (let t of e) yield t.href;
	}
}
var Ie = class extends H {
	constructor(e, t, n) {
		super(({ url: t }) => {
			let n = e.exec(t.href);
			if (n && !(t.origin !== location.origin && n.index !== 0)) return n.slice(1);
		}, t, n);
	}
}, Le = (e) => {
	r.updateDetails(e);
}, Re = "__WB_REVISION__", ze = (e) => {
	if (!e) throw new s("add-to-cache-list-unexpected-type", { entry: e });
	if (typeof e == "string") {
		let t = new URL(e, location.href);
		return {
			cacheKey: t.href,
			url: t.href
		};
	}
	let { revision: t, url: n } = e;
	if (!n) throw new s("add-to-cache-list-unexpected-type", { entry: e });
	if (!t) {
		let e = new URL(n, location.href);
		return {
			cacheKey: e.href,
			url: e.href
		};
	}
	let r = new URL(n, location.href), i = new URL(n, location.href);
	return r.searchParams.set(Re, t), {
		cacheKey: r.href,
		url: i.href
	};
}, Be = class {
	updatedURLs = [];
	notUpdatedURLs = [];
	handlerWillStart = async ({ request: e, state: t }) => {
		t && (t.originalRequest = e);
	};
	cachedResponseWillBeUsed = async ({ event: e, state: t, cachedResponse: n }) => {
		if (e.type === "install" && t?.originalRequest && t.originalRequest instanceof Request) {
			let e = t.originalRequest.url;
			n ? this.notUpdatedURLs.push(e) : this.updatedURLs.push(e);
		}
		return n;
	};
}, Ve = (e, t, n) => {
	if (typeof e == "string") {
		let r = new URL(e, location.href);
		return new H(({ url: e }) => e.href === r.href, t, n);
	}
	if (e instanceof RegExp) return new Ie(e, t, n);
	if (typeof e == "function") return new H(e, t, n);
	if (e instanceof H) return e;
	throw new s("unsupported-route-type", {
		moduleName: "serwist",
		funcName: "parseRoute",
		paramName: "capture"
	});
}, He = async (e, t, n) => {
	let r = t.map((e, t) => ({
		index: t,
		item: e
	})), i = async (e) => {
		let t = [];
		for (;;) {
			let i = r.pop();
			if (!i) return e(t);
			let a = await n(i.item);
			t.push({
				result: a,
				index: i.index
			});
		}
	}, a = Array.from({ length: e }, () => new Promise(i));
	return (await Promise.all(a)).flat().sort((e, t) => e.index < t.index ? -1 : 1).map((e) => e.result);
};
typeof navigator < "u" && /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
var Ue = "serwist-expiration", U = "cache-entries", W = (e) => {
	let t = new URL(e, location.href);
	return t.hash = "", t.href;
}, We = class {
	_cacheName;
	_db = null;
	constructor(e) {
		this._cacheName = e;
	}
	_getId(e) {
		return `${this._cacheName}|${W(e)}`;
	}
	_upgradeDb(e) {
		let t = e.createObjectStore(U, { keyPath: "id" });
		t.createIndex("cacheName", "cacheName", { unique: !1 }), t.createIndex("timestamp", "timestamp", { unique: !1 });
	}
	_upgradeDbAndDeleteOldDbs(e) {
		this._upgradeDb(e), this._cacheName && de(this._cacheName);
	}
	async setTimestamp(e, t) {
		e = W(e);
		let n = {
			id: this._getId(e),
			cacheName: this._cacheName,
			url: e,
			timestamp: t
		}, r = (await this.getDb()).transaction(U, "readwrite", { durability: "relaxed" });
		await r.store.put(n), await r.done;
	}
	async getTimestamp(e) {
		return (await (await this.getDb()).get(U, this._getId(e)))?.timestamp;
	}
	async expireEntries(e, t) {
		let n = await (await this.getDb()).transaction(U, "readwrite").store.index("timestamp").openCursor(null, "prev"), r = [], i = 0;
		for (; n;) {
			let a = n.value;
			a.cacheName === this._cacheName && (e && a.timestamp < e || t && i >= t ? (n.delete(), r.push(a.url)) : i++), n = await n.continue();
		}
		return r;
	}
	async getDb() {
		return this._db ||= await ue(Ue, 1, { upgrade: this._upgradeDbAndDeleteOldDbs.bind(this) }), this._db;
	}
}, Ge = class {
	_isRunning = !1;
	_rerunRequested = !1;
	_maxEntries;
	_maxAgeSeconds;
	_matchOptions;
	_cacheName;
	_timestampModel;
	constructor(e, t = {}) {
		this._maxEntries = t.maxEntries, this._maxAgeSeconds = t.maxAgeSeconds, this._matchOptions = t.matchOptions, this._cacheName = e, this._timestampModel = new We(e);
	}
	async expireEntries() {
		if (this._isRunning) {
			this._rerunRequested = !0;
			return;
		}
		this._isRunning = !0;
		let e = this._maxAgeSeconds ? Date.now() - this._maxAgeSeconds * 1e3 : 0, t = await this._timestampModel.expireEntries(e, this._maxEntries), n = await self.caches.open(this._cacheName);
		for (let e of t) await n.delete(e, this._matchOptions);
		this._isRunning = !1, this._rerunRequested && (this._rerunRequested = !1, this.expireEntries());
	}
	async updateTimestamp(e) {
		await this._timestampModel.setTimestamp(e, Date.now());
	}
	async isURLExpired(e) {
		if (!this._maxAgeSeconds) return !1;
		let t = await this._timestampModel.getTimestamp(e), n = Date.now() - this._maxAgeSeconds * 1e3;
		return t === void 0 ? !0 : t < n;
	}
	async delete() {
		this._rerunRequested = !1, await this._timestampModel.expireEntries(Infinity);
	}
}, Ke = (e) => {
	u.add(e);
}, G = class {
	_config;
	_cacheExpirations;
	constructor(e = {}) {
		this._config = e, this._cacheExpirations = /* @__PURE__ */ new Map(), this._config.maxAgeFrom || (this._config.maxAgeFrom = "last-fetched"), this._config.purgeOnQuotaError && Ke(() => this.deleteCacheAndMetadata());
	}
	_getCacheExpiration(e) {
		if (e === r.getRuntimeName()) throw new s("expire-custom-caches-only");
		let t = this._cacheExpirations.get(e);
		return t || (t = new Ge(e, this._config), this._cacheExpirations.set(e, t)), t;
	}
	cachedResponseWillBeUsed({ event: e, cacheName: t, request: n, cachedResponse: r }) {
		if (!r) return null;
		let i = this._isResponseDateFresh(r), a = this._getCacheExpiration(t), o = this._config.maxAgeFrom === "last-used", s = (async () => {
			o && await a.updateTimestamp(n.url), await a.expireEntries();
		})();
		try {
			e.waitUntil(s);
		} catch {}
		return i ? r : null;
	}
	_isResponseDateFresh(e) {
		if (this._config.maxAgeFrom === "last-used") return !0;
		let t = Date.now();
		if (!this._config.maxAgeSeconds) return !0;
		let n = this._getDateHeaderTimestamp(e);
		return n === null ? !0 : n >= t - this._config.maxAgeSeconds * 1e3;
	}
	_getDateHeaderTimestamp(e) {
		if (!e.headers.has("date")) return null;
		let t = e.headers.get("date"), n = new Date(t).getTime();
		return Number.isNaN(n) ? null : n;
	}
	async cacheDidUpdate({ cacheName: e, request: t }) {
		let n = this._getCacheExpiration(e);
		await n.updateTimestamp(t.url), await n.expireEntries();
	}
	async deleteCacheAndMetadata() {
		for (let [e, t] of this._cacheExpirations) await self.caches.delete(e), await t.delete();
		this._cacheExpirations = /* @__PURE__ */ new Map();
	}
}, qe = "serwist-google-analytics", Je = 2880, Ye = /^\/(\w+\/)?collect/, Xe = (e) => async ({ queue: t }) => {
	let n;
	for (; n = await t.shiftRequest();) {
		let { request: r, timestamp: i } = n, a = new URL(r.url);
		try {
			let t = r.method === "POST" ? new URLSearchParams(await r.clone().text()) : a.searchParams, n = i - (Number(t.get("qt")) || 0), o = Date.now() - n;
			if (t.set("qt", String(o)), e.parameterOverrides) for (let n of Object.keys(e.parameterOverrides)) {
				let r = e.parameterOverrides[n];
				t.set(n, r);
			}
			typeof e.hitFilter == "function" && e.hitFilter.call(null, t), await fetch(new Request(a.origin + a.pathname, {
				body: t.toString(),
				method: "POST",
				mode: "cors",
				credentials: "omit",
				headers: { "Content-Type": "text/plain" }
			}));
		} catch (e) {
			throw await t.unshiftRequest(n), e;
		}
	}
}, Ze = (e) => {
	let t = ({ url: e }) => e.hostname === "www.google-analytics.com" && Ye.test(e.pathname), n = new ke({ plugins: [e] });
	return [new H(t, n, "GET"), new H(t, n, "POST")];
}, Qe = (e) => new H(({ url: e }) => e.hostname === "www.google-analytics.com" && e.pathname === "/analytics.js", new B({ cacheName: e }), "GET"), $e = (e) => new H(({ url: e }) => e.hostname === "www.googletagmanager.com" && e.pathname === "/gtag/js", new B({ cacheName: e }), "GET"), et = (e) => new H(({ url: e }) => e.hostname === "www.googletagmanager.com" && e.pathname === "/gtm.js", new B({ cacheName: e }), "GET"), K = ({ serwist: e, cacheName: t, ...n }) => {
	let i = r.getGoogleAnalyticsName(t), a = new Ee(qe, {
		maxRetentionTime: Je,
		onSync: Xe(n)
	}), o = [
		et(i),
		Qe(i),
		$e(i),
		...Ze(a)
	];
	for (let t of o) e.registerRoute(t);
}, tt = class {
	_fallbackUrls;
	_serwist;
	constructor({ fallbackUrls: e, serwist: t }) {
		this._fallbackUrls = e, this._serwist = t;
	}
	async handlerDidError(e) {
		for (let t of this._fallbackUrls) if (typeof t == "string") {
			let e = await this._serwist.matchPrecache(t);
			if (e !== void 0) return e;
		} else if (t.matcher(e)) {
			let e = await this._serwist.matchPrecache(t.url);
			if (e !== void 0) return e;
		}
	}
}, q = class extends z {
	async _handle(e, t) {
		let n = await t.cacheMatch(e), r;
		if (!n) try {
			n = await t.fetchAndCachePut(e);
		} catch (e) {
			e instanceof Error && (r = e);
		}
		if (!n) throw new s("no-response", {
			url: e.url,
			error: r
		});
		return n;
	}
}, J = class extends z {
	constructor(e = {}) {
		super(e), this.plugins.some((e) => "cacheWillUpdate" in e) || this.plugins.unshift(De);
	}
	async _handle(e, t) {
		let n = t.fetchAndCachePut(e).catch(() => {});
		t.waitUntil(n);
		let r = await t.cacheMatch(e), i;
		if (!r) try {
			r = await n;
		} catch (e) {
			e instanceof Error && (i = e);
		}
		if (!r) throw new s("no-response", {
			url: e.url,
			error: i
		});
		return r;
	}
}, nt = class extends H {
	constructor(e, t) {
		super(({ request: n }) => {
			let r = e.getUrlsToPrecacheKeys();
			for (let i of Fe(n.url, t)) {
				let t = r.get(i);
				if (t) return {
					cacheKey: t,
					integrity: e.getIntegrityForPrecacheKey(t)
				};
			}
		}, e.precacheStrategy);
	}
}, rt = class {
	_precacheController;
	constructor({ precacheController: e }) {
		this._precacheController = e;
	}
	cacheKeyWillBeUsed = async ({ request: e, params: t }) => {
		let n = t?.cacheKey || this._precacheController.getPrecacheKeyForUrl(e.url);
		return n ? new Request(n, { headers: e.headers }) : e;
	};
}, it = (e, t = {}) => {
	let { cacheName: n, plugins: i = [], fetchOptions: a, matchOptions: o, fallbackToNetwork: s, directoryIndex: c, ignoreURLParametersMatching: l, cleanURLs: u, urlManipulation: d, cleanupOutdatedCaches: f, concurrency: p = 10, navigateFallback: m, navigateFallbackAllowlist: h, navigateFallbackDenylist: g } = t ?? {};
	return {
		precacheStrategyOptions: {
			cacheName: r.getPrecacheName(n),
			plugins: [...i, new rt({ precacheController: e })],
			fetchOptions: a,
			matchOptions: o,
			fallbackToNetwork: s
		},
		precacheRouteOptions: {
			directoryIndex: c,
			ignoreURLParametersMatching: l,
			cleanURLs: u,
			urlManipulation: d
		},
		precacheMiscOptions: {
			cleanupOutdatedCaches: f,
			concurrency: p,
			navigateFallback: m,
			navigateFallbackAllowlist: h,
			navigateFallbackDenylist: g
		}
	};
}, at = class {
	_urlsToCacheKeys = /* @__PURE__ */ new Map();
	_urlsToCacheModes = /* @__PURE__ */ new Map();
	_cacheKeysToIntegrities = /* @__PURE__ */ new Map();
	_concurrentPrecaching;
	_precacheStrategy;
	_routes;
	_defaultHandlerMap;
	_catchHandler;
	_requestRules;
	constructor({ precacheEntries: e, precacheOptions: t, skipWaiting: n = !1, importScripts: r, navigationPreload: i = !1, cacheId: a, clientsClaim: o = !1, runtimeCaching: s, offlineAnalyticsConfig: c, disableDevLogs: l = !1, fallbacks: u, requestRules: d } = {}) {
		let { precacheStrategyOptions: f, precacheRouteOptions: p, precacheMiscOptions: m } = it(this, t);
		if (this._concurrentPrecaching = m.concurrency, this._precacheStrategy = new Ae(f), this._routes = /* @__PURE__ */ new Map(), this._defaultHandlerMap = /* @__PURE__ */ new Map(), this._requestRules = d, this.handleInstall = this.handleInstall.bind(this), this.handleActivate = this.handleActivate.bind(this), this.handleFetch = this.handleFetch.bind(this), this.handleCache = this.handleCache.bind(this), r && r.length > 0 && self.importScripts(...r), i && Ne(), a !== void 0 && Le({ prefix: a }), n ? self.skipWaiting() : self.addEventListener("message", (e) => {
			e.data && e.data.type === "SKIP_WAITING" && self.skipWaiting();
		}), o && te(), e && e.length > 0 && this.addToPrecacheList(e), m.cleanupOutdatedCaches && ee(f.cacheName), this.registerRoute(new nt(this, p)), m.navigateFallback && this.registerRoute(new je(this.createHandlerBoundToUrl(m.navigateFallback), {
			allowlist: m.navigateFallbackAllowlist,
			denylist: m.navigateFallbackDenylist
		})), c !== void 0 && (typeof c == "boolean" ? c && K({ serwist: this }) : K({
			...c,
			serwist: this
		})), s !== void 0) {
			if (u !== void 0) {
				let e = new tt({
					fallbackUrls: u.entries,
					serwist: this
				});
				s.forEach((t) => {
					t.handler instanceof z && !t.handler.plugins.some((e) => "handlerDidError" in e) && t.handler.plugins.push(e);
				});
			}
			for (let e of s) this.registerCapture(e.matcher, e.handler, e.method);
		}
		l && ve();
	}
	get precacheStrategy() {
		return this._precacheStrategy;
	}
	get routes() {
		return this._routes;
	}
	addEventListeners() {
		self.addEventListener("install", this.handleInstall), self.addEventListener("activate", this.handleActivate), self.addEventListener("fetch", this.handleFetch), self.addEventListener("message", this.handleCache);
	}
	addToPrecacheList(e) {
		let t = [];
		for (let n of e) {
			typeof n == "string" ? t.push(n) : n && !n.integrity && n.revision === void 0 && t.push(n.url);
			let { cacheKey: e, url: r } = ze(n), i = typeof n != "string" && n.revision ? "reload" : "default";
			if (this._urlsToCacheKeys.has(r) && this._urlsToCacheKeys.get(r) !== e) throw new s("add-to-cache-list-conflicting-entries", {
				firstEntry: this._urlsToCacheKeys.get(r),
				secondEntry: e
			});
			if (typeof n != "string" && n.integrity) {
				if (this._cacheKeysToIntegrities.has(e) && this._cacheKeysToIntegrities.get(e) !== n.integrity) throw new s("add-to-cache-list-conflicting-integrities", { url: r });
				this._cacheKeysToIntegrities.set(e, n.integrity);
			}
			this._urlsToCacheKeys.set(r, e), this._urlsToCacheModes.set(r, i);
		}
		if (t.length > 0) {
			let e = `Serwist is precaching URLs without revision info: ${t.join(", ")}\nThis is generally NOT safe. Learn more at https://bit.ly/wb-precache`;
			console.warn(e);
		}
	}
	handleInstall(e) {
		return this.registerRequestRules(e), _(e, async () => {
			let t = new Be();
			this.precacheStrategy.plugins.push(t), await He(this._concurrentPrecaching, Array.from(this._urlsToCacheKeys.entries()), async ([t, n]) => {
				let r = this._cacheKeysToIntegrities.get(n), i = this._urlsToCacheModes.get(t), a = new Request(t, {
					integrity: r,
					cache: i,
					credentials: "same-origin"
				});
				await Promise.all(this.precacheStrategy.handleAll({
					event: e,
					request: a,
					url: new URL(a.url),
					params: { cacheKey: n }
				}));
			});
			let { updatedURLs: n, notUpdatedURLs: r } = t;
			return {
				updatedURLs: n,
				notUpdatedURLs: r
			};
		});
	}
	async registerRequestRules(e) {
		if (this._requestRules && e?.addRoutes) try {
			await e.addRoutes(this._requestRules), this._requestRules = void 0;
		} catch (e) {
			throw e;
		}
	}
	handleActivate(e) {
		return _(e, async () => {
			let e = await self.caches.open(this.precacheStrategy.cacheName), t = await e.keys(), n = new Set(this._urlsToCacheKeys.values()), r = [];
			for (let i of t) n.has(i.url) || (await e.delete(i), r.push(i.url));
			return { deletedCacheRequests: r };
		});
	}
	handleFetch(e) {
		let { request: t } = e, n = this.handleRequest({
			request: t,
			event: e
		});
		n && e.respondWith(n);
	}
	handleCache(e) {
		if (e.data && e.data.type === "CACHE_URLS") {
			let { payload: t } = e.data, n = Promise.all(t.urlsToCache.map((t) => {
				let n;
				return n = typeof t == "string" ? new Request(t) : new Request(...t), this.handleRequest({
					request: n,
					event: e
				});
			}));
			e.waitUntil(n), e.ports?.[0] && n.then(() => e.ports[0].postMessage(!0));
		}
	}
	setDefaultHandler(e, t = "GET") {
		this._defaultHandlerMap.set(t, V(e));
	}
	setCatchHandler(e) {
		this._catchHandler = V(e);
	}
	registerCapture(e, t, n) {
		let r = Ve(e, t, n);
		return this.registerRoute(r), r;
	}
	registerRoute(e) {
		this._routes.has(e.method) || this._routes.set(e.method, []), this._routes.get(e.method).push(e);
	}
	unregisterRoute(e) {
		if (!this._routes.has(e.method)) throw new s("unregister-route-but-not-found-with-method", { method: e.method });
		let t = this._routes.get(e.method).indexOf(e);
		if (t > -1) this._routes.get(e.method).splice(t, 1);
		else throw new s("unregister-route-route-not-registered");
	}
	getUrlsToPrecacheKeys() {
		return this._urlsToCacheKeys;
	}
	getPrecachedUrls() {
		return [...this._urlsToCacheKeys.keys()];
	}
	getPrecacheKeyForUrl(e) {
		let t = new URL(e, location.href);
		return this._urlsToCacheKeys.get(t.href);
	}
	getIntegrityForPrecacheKey(e) {
		return this._cacheKeysToIntegrities.get(e);
	}
	async matchPrecache(e) {
		let t = e instanceof Request ? e.url : e, n = this.getPrecacheKeyForUrl(t);
		if (n) return (await self.caches.open(this.precacheStrategy.cacheName)).match(n);
	}
	createHandlerBoundToUrl(e) {
		let t = this.getPrecacheKeyForUrl(e);
		if (!t) throw new s("non-precached-url", { url: e });
		return (n) => (n.request = new Request(e), n.params = {
			cacheKey: t,
			...n.params
		}, this.precacheStrategy.handle(n));
	}
	handleRequest({ request: e, event: t }) {
		let n = new URL(e.url, location.href);
		if (!n.protocol.startsWith("http")) return;
		let r = n.origin === location.origin, { params: i, route: a } = this.findMatchingRoute({
			event: t,
			request: e,
			sameOrigin: r,
			url: n
		}), o = a?.handler, s = e.method;
		if (!o && this._defaultHandlerMap.has(s) && (o = this._defaultHandlerMap.get(s)), !o) return;
		let c;
		try {
			c = o.handle({
				url: n,
				request: e,
				event: t,
				params: i
			});
		} catch (e) {
			c = Promise.reject(e);
		}
		let l = a?.catchHandler;
		return c instanceof Promise && (this._catchHandler || l) && (c = c.catch(async (r) => {
			if (l) try {
				return await l.handle({
					url: n,
					request: e,
					event: t,
					params: i
				});
			} catch (e) {
				e instanceof Error && (r = e);
			}
			if (this._catchHandler) return this._catchHandler.handle({
				url: n,
				request: e,
				event: t
			});
			throw r;
		})), c;
	}
	findMatchingRoute({ url: e, sameOrigin: t, request: n, event: r }) {
		let i = this._routes.get(n.method) || [];
		for (let a of i) {
			let i, o = a.match({
				url: e,
				sameOrigin: t,
				request: n,
				event: r
			});
			if (o) return i = o, (Array.isArray(i) && i.length === 0 || o.constructor === Object && Object.keys(o).length === 0 || typeof o == "boolean") && (i = void 0), {
				route: a,
				params: i
			};
		}
		return {};
	}
}, Y = 60 * 1e3 * 60 * 24;
7 * Y;
var X = 29.53 * Y;
365.2425 * Y, new Intl.RelativeTimeFormat("default", {
	numeric: "always",
	style: "short"
});
//#endregion
//#region src/sw.ts
var Z = class {
	#e;
	#t;
	constructor({ statuses: e = [200], headers: t }) {
		this.#e = e, t && (this.#t = new Headers(t));
	}
	async cacheWillUpdate({ response: e }) {
		if (!this.#e.includes(e.status)) return null;
		if (!this.#t) return e;
		for (let [t, n] of this.#t) if (!e.headers.get(t)?.startsWith(n)) return null;
		return e;
	}
}, Q = new at({
	precacheEntries: [
		{
			url: "index.html",
			revision: "ef5c08262088ccaf705bce1e6872d3cf"
		},
		{
			url: "assets/sprite-EDjWs5PV.svg",
			revision: null
		},
		{
			url: "assets/search-words.worker-DFRHCWJF.js",
			revision: null
		},
		{
			url: "assets/search-kanji.worker-nXPUGFE3.js",
			revision: null
		},
		{
			url: "assets/reviews-zpUDKLsh.js",
			revision: null
		},
		{
			url: "assets/map-C2LvQMbq.js",
			revision: null
		},
		{
			url: "assets/kanji-mNY5pxRp.js",
			revision: null
		},
		{
			url: "assets/kanji-components-CyH_YH_E.js",
			revision: null
		},
		{
			url: "assets/kana-LUYZjPI9.js",
			revision: null
		},
		{
			url: "assets/index-xsJywjWn.css",
			revision: null
		},
		{
			url: "assets/index-CobiPdAH.js",
			revision: null
		},
		{
			url: "assets/group-by-D_fUBUIP.js",
			revision: null
		},
		{
			url: "assets/fsrs-DmOh6-6L.js",
			revision: null
		},
		{
			url: "assets/formats-fKl6e9VR.js",
			revision: null
		},
		{
			url: "assets/dist-D6bkPOSp.js",
			revision: null
		},
		{
			url: "assets/dist-BopinKp5.js",
			revision: null
		},
		{
			url: "assets/decks-DnxD1rMj.js",
			revision: null
		},
		{
			url: "assets/decks-DbflEnKu.js",
			revision: null
		},
		{
			url: "assets/decks-CtunamtI.js",
			revision: null
		},
		{
			url: "assets/db-DMHMtsdd.js",
			revision: null
		},
		{
			url: "assets/component-picker.worker-DvoCqwhu.js",
			revision: null
		},
		{
			url: "assets/WordWritingSelect-Ck1qVbb9.js",
			revision: null
		},
		{
			url: "assets/WordWritingSelect-BOwnpk5D.css",
			revision: null
		},
		{
			url: "assets/WordView-tGeh0t50.js",
			revision: null
		},
		{
			url: "assets/WordView-BCaN4bIv.css",
			revision: null
		},
		{
			url: "assets/WordListItem-mo_cbGTp.css",
			revision: null
		},
		{
			url: "assets/WordListItem-Cg8qcdWx.js",
			revision: null
		},
		{
			url: "assets/WordKanjiListItem-D9ltwX3-.css",
			revision: null
		},
		{
			url: "assets/WordKanjiListItem-CV3hlko7.js",
			revision: null
		},
		{
			url: "assets/SettingsView-a0bHbhhC.js",
			revision: null
		},
		{
			url: "assets/SettingsView-2Woo4irg.css",
			revision: null
		},
		{
			url: "assets/ReviewView-df3nR1no.js",
			revision: null
		},
		{
			url: "assets/ReviewView-BL5F1Cax.css",
			revision: null
		},
		{
			url: "assets/ReviewSummaryView-E1-__hfu.js",
			revision: null
		},
		{
			url: "assets/ReviewSummaryView-BbM7jY9G.css",
			revision: null
		},
		{
			url: "assets/RemoteSyncSyncButton-Cwfjzp0w.js",
			revision: null
		},
		{
			url: "assets/PracticeDeckView-Cn73zld0.js",
			revision: null
		},
		{
			url: "assets/PracticeDeckView-BMRKKRoN.css",
			revision: null
		},
		{
			url: "assets/KanjiWordList-yCN1grSB.js",
			revision: null
		},
		{
			url: "assets/KanjiWordList-BiODBHh7.css",
			revision: null
		},
		{
			url: "assets/KanjiView-cmmNCiZH.css",
			revision: null
		},
		{
			url: "assets/KanjiView-CkfUyQzE.js",
			revision: null
		},
		{
			url: "assets/KanjiComponentView-EGl-luqt.js",
			revision: null
		},
		{
			url: "assets/KanjiComponentView-Bp5E1jwo.css",
			revision: null
		},
		{
			url: "assets/KanjiAsideView-DjZDBtrg.css",
			revision: null
		},
		{
			url: "assets/KanjiAsideView-B82PzlPQ.js",
			revision: null
		},
		{
			url: "assets/KanaView-BK9PboFK.js",
			revision: null
		},
		{
			url: "assets/KanaTitle-Wm6XCYDz.css",
			revision: null
		},
		{
			url: "assets/KanaTitle-DBNqOmSo.js",
			revision: null
		},
		{
			url: "assets/KanaAsideView-BFwcSpQc.css",
			revision: null
		},
		{
			url: "assets/KanaAsideView-B8n_FD4z.js",
			revision: null
		},
		{
			url: "assets/HomeView-CByMpJpP.css",
			revision: null
		},
		{
			url: "assets/HomeView-B_HXnlNy.js",
			revision: null
		},
		{
			url: "assets/DictionaryView-g0Z1ndya.css",
			revision: null
		},
		{
			url: "assets/DictionaryView-Dc_BPA3O.js",
			revision: null
		},
		{
			url: "assets/DecksView-Q87YoR23.js",
			revision: null
		},
		{
			url: "assets/DecksView-DJJK40FZ.css",
			revision: null
		},
		{
			url: "assets/DeckBrowserView-CnU_h0AP.js",
			revision: null
		},
		{
			url: "assets/DeckBrowserView-B7HiPrbp.css",
			revision: null
		},
		{
			url: "assets/CardRetrievabilityLabel-W6oZdoEL.js",
			revision: null
		},
		{
			url: "assets/CardRetrievabilityLabel-BDshkbrY.css",
			revision: null
		},
		{
			url: "assets/CardAsideNav-UXYa7Tmc.js",
			revision: null
		},
		{
			url: "assets/CardAsideNav-GTrwPYiV.css",
			revision: null
		},
		{
			url: "assets/AppTextArea-_JpOlQcT.js",
			revision: null
		},
		{
			url: "assets/AppTextArea-K1PWDzuO.css",
			revision: null
		},
		{
			url: "assets/AppNumberInput-iEYgssBc.js",
			revision: null
		},
		{
			url: "assets/AppNumberInput-Ck82B-wW.css",
			revision: null
		},
		{
			url: "assets/AppLoading-DcVIUJWy.js",
			revision: null
		},
		{
			url: "assets/AppCheckbox-Nt2IHaki.css",
			revision: null
		},
		{
			url: "assets/AppCheckbox-DGSL7g6U.js",
			revision: null
		},
		{
			url: "assets/AboutView-CCMndbF4.js",
			revision: null
		},
		{
			url: "assets/AboutView-0JQTlgw4.css",
			revision: null
		},
		{
			url: "robots.txt",
			revision: "5e0bd1c281a62a380d7a948085bfe2d1"
		},
		{
			url: "favicon.ico",
			revision: "06b709863a75fd56b00564cbc1402934"
		},
		{
			url: "icon.svg",
			revision: "02854578dd73b9dd133e03d5e4a63469"
		},
		{
			url: "icon-mask.png",
			revision: "8cf586883d47b13c93c9f309e1c38c63"
		},
		{
			url: "icon-512.png",
			revision: "78ffd1cff89cd8e897bd8f96a7b57321"
		},
		{
			url: "icon-192.png",
			revision: "7d2fbd7640fefbb0fbf32ec060d71762"
		},
		{
			url: "apple-touch-icon.png",
			revision: "48fbafa0594abafee1b49d3c16fb68cf"
		},
		{
			url: "manifest.json",
			revision: "86944e98cb5dc55796af2d44758a6abc"
		}
	],
	skipWaiting: !0,
	clientsClaim: !0,
	navigationPreload: !0
}), $ = new Headers([["Content-Type", "application/json"]]), ot = new Headers([["Content-Type", "image/svg+xml"]]);
Q.registerRoute(new H(({ url: e, sameOrigin: t }) => t && e.pathname.startsWith("/data/index/") && e.pathname.endsWith(".usv"), new J({
	cacheName: "shodoku-data-index",
	plugins: [new G({
		maxAgeSeconds: X,
		maxAgeFrom: "last-used",
		maxEntries: 10
	})]
}))), Q.registerRoute(new H(({ url: e, sameOrigin: t }) => t && e.pathname.startsWith("/data/kanji-lists/") && e.pathname.endsWith(".csv"), new J({
	cacheName: "shodoku-data-kanji-lists",
	plugins: [new G({
		maxAgeSeconds: X,
		maxAgeFrom: "last-used",
		maxEntries: 100
	})]
}))), Q.registerRoute(new H(({ url: e, sameOrigin: t }) => t && e.pathname.startsWith("/data/component-v1/") && e.pathname.endsWith(".json"), new q({
	cacheName: "shodoku-data-components-v1",
	plugins: [new Z({
		statuses: [0, 200],
		headers: $
	}), new G({
		maxAgeSeconds: 3 * X,
		maxAgeFrom: "last-used",
		maxEntries: 500
	})]
}))), Q.registerRoute(new H(({ url: e, sameOrigin: t }) => t && e.pathname.startsWith("/data/kanji-v1/") && e.pathname.endsWith(".json"), new q({
	cacheName: "shodoku-data-kanji-v1",
	plugins: [new Z({
		statuses: [0, 200],
		headers: $
	}), new G({
		maxAgeSeconds: 3 * X,
		maxAgeFrom: "last-used",
		maxEntries: 2e3
	})]
}))), Q.registerRoute(new H(({ url: e, sameOrigin: t }) => t && e.pathname.startsWith("/data/kana-v1/") && e.pathname.endsWith(".json"), new q({
	cacheName: "shodoku-data-kana-v1",
	plugins: [new Z({
		statuses: [0, 200],
		headers: $
	}), new G({
		maxAgeSeconds: 3 * X,
		maxAgeFrom: "last-used"
	})]
}))), Q.registerRoute(new H(({ url: e, sameOrigin: t }) => t && e.pathname.startsWith("/kanjivg/kanji/") && e.pathname.endsWith(".svg"), new q({
	cacheName: "shodoku-kanjivg",
	plugins: [new Z({
		statuses: [0, 200],
		headers: ot
	}), new G({
		maxAgeSeconds: 3 * X,
		maxAgeFrom: "last-used",
		maxEntries: 2e3
	})]
}))), Q.registerRoute(new H(({ url: e, sameOrigin: t }) => t && e.pathname.startsWith("/data/words-v1/") && e.pathname.endsWith(".json"), new q({
	cacheName: "shodoku-data-words-v1",
	plugins: [new Z({
		statuses: [0, 200],
		headers: $
	}), new G({
		maxAgeSeconds: 3 * X,
		maxAgeFrom: "last-used",
		maxEntries: 5e3,
		purgeOnQuotaError: !0
	})]
}))), Q.registerRoute(new H(({ url: e, sameOrigin: t }) => t && e.pathname.startsWith("/data/kanji-vocab-v1/") && e.pathname.endsWith(".json"), new q({
	cacheName: "shodoku-data-kanji-vocab-v1",
	plugins: [new Z({
		statuses: [0, 200],
		headers: $
	}), new G({
		maxAgeSeconds: 3 * X,
		maxAgeFrom: "last-used",
		maxEntries: 500,
		purgeOnQuotaError: !0
	})]
}))), Q.registerRoute(new H(({ url: e, sameOrigin: t }) => t && e.pathname.startsWith("/data/sentences-v1/") && e.pathname.endsWith(".json"), new q({
	cacheName: "shodoku-data-sentences-v1",
	plugins: [new Z({
		statuses: [0, 200],
		headers: $
	}), new G({
		maxAgeSeconds: 3 * X,
		maxAgeFrom: "last-used",
		maxEntries: 3e3,
		purgeOnQuotaError: !0
	})]
}))), Q.registerRoute(new H(({ url: e, sameOrigin: t }) => t && e.pathname.startsWith("/data/words-sentences-v2/") && e.pathname.endsWith(".json"), new q({
	cacheName: "shodoku-data-words-sentences-v2",
	plugins: [new Z({
		statuses: [0, 200],
		headers: $
	}), new G({
		maxAgeSeconds: 3 * X,
		maxAgeFrom: "last-used",
		maxEntries: 1e3,
		purgeOnQuotaError: !0
	})]
}))), Q.addEventListeners();
//#endregion

//# sourceMappingURL=sw.js.map