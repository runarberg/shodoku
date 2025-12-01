const ye = (a, ...e) => {
  let t = a;
  return e.length > 0 && (t += ` :: ${JSON.stringify(e)}`), t;
}, _e = ye;
class u extends Error {
  details;
  constructor(e, t) {
    const s = _e(e, t);
    super(s), this.name = e, this.details = t;
  }
}
const be = (a) => new URL(String(a), location.href).href.replace(new RegExp(`^${location.origin}`), ""), y = {
  googleAnalytics: "googleAnalytics",
  precache: "precache-v2",
  prefix: "serwist",
  runtime: "runtime",
  suffix: typeof registration < "u" ? registration.scope : ""
}, M = (a) => [
  y.prefix,
  a,
  y.suffix
].filter((e) => e && e.length > 0).join("-"), ve = (a) => {
  for (const e of Object.keys(y))
    a(e);
}, C = {
  updateDetails: (a) => {
    ve((e) => {
      const t = a[e];
      typeof t == "string" && (y[e] = t);
    });
  },
  getGoogleAnalyticsName: (a) => a || M(y.googleAnalytics),
  getPrecacheName: (a) => a || M(y.precache),
  getPrefix: () => y.prefix,
  getRuntimeName: (a) => a || M(y.runtime),
  getSuffix: () => y.suffix
};
class Re {
  promise;
  resolve;
  reject;
  constructor() {
    this.promise = new Promise((e, t) => {
      this.resolve = e, this.reject = t;
    });
  }
}
function J(a, e) {
  const t = new URL(a);
  for (const s of e)
    t.searchParams.delete(s);
  return t.href;
}
async function Ee(a, e, t, s) {
  const n = J(e.url, t);
  if (e.url === n)
    return a.match(e, s);
  const r = {
    ...s,
    ignoreSearch: !0
  }, i = await a.keys(e, r);
  for (const o of i) {
    const c = J(o.url, t);
    if (n === c)
      return a.match(o, s);
  }
}
const oe = /* @__PURE__ */ new Set(), Ce = async () => {
  for (const a of oe)
    await a();
};
function ce(a) {
  return new Promise((e) => setTimeout(e, a));
}
let N;
function xe() {
  if (N === void 0) {
    const a = new Response("");
    if ("body" in a)
      try {
        new Response(a.body), N = !0;
      } catch {
        N = !1;
      }
    N = !1;
  }
  return N;
}
const De = "-precache-", ke = async (a, e = De) => {
  const s = (await self.caches.keys()).filter((n) => n.includes(e) && n.includes(self.registration.scope) && n !== a);
  return await Promise.all(s.map((n) => self.caches.delete(n))), s;
}, Se = (a) => {
  self.addEventListener("activate", (e) => {
    e.waitUntil(ke(C.getPrecacheName(a)).then((t) => {
    }));
  });
}, Ne = () => {
  self.addEventListener("activate", () => self.clients.claim());
}, $ = (a, e) => {
  const t = e();
  return a.waitUntil(t), t;
}, W = (a, e) => e.some((t) => a instanceof t);
let Y, X;
function Te() {
  return Y || (Y = [
    IDBDatabase,
    IDBObjectStore,
    IDBIndex,
    IDBCursor,
    IDBTransaction
  ]);
}
function Pe() {
  return X || (X = [
    IDBCursor.prototype.advance,
    IDBCursor.prototype.continue,
    IDBCursor.prototype.continuePrimaryKey
  ]);
}
const H = /* @__PURE__ */ new WeakMap(), B = /* @__PURE__ */ new WeakMap(), j = /* @__PURE__ */ new WeakMap();
function Ae(a) {
  const e = new Promise((t, s) => {
    const n = () => {
      a.removeEventListener("success", r), a.removeEventListener("error", i);
    }, r = () => {
      t(v(a.result)), n();
    }, i = () => {
      s(a.error), n();
    };
    a.addEventListener("success", r), a.addEventListener("error", i);
  });
  return j.set(e, a), e;
}
function Ie(a) {
  if (H.has(a))
    return;
  const e = new Promise((t, s) => {
    const n = () => {
      a.removeEventListener("complete", r), a.removeEventListener("error", i), a.removeEventListener("abort", i);
    }, r = () => {
      t(), n();
    }, i = () => {
      s(a.error || new DOMException("AbortError", "AbortError")), n();
    };
    a.addEventListener("complete", r), a.addEventListener("error", i), a.addEventListener("abort", i);
  });
  H.set(a, e);
}
let V = {
  get(a, e, t) {
    if (a instanceof IDBTransaction) {
      if (e === "done")
        return H.get(a);
      if (e === "store")
        return t.objectStoreNames[1] ? void 0 : t.objectStore(t.objectStoreNames[0]);
    }
    return v(a[e]);
  },
  set(a, e, t) {
    return a[e] = t, !0;
  },
  has(a, e) {
    return a instanceof IDBTransaction && (e === "done" || e === "store") ? !0 : e in a;
  }
};
function le(a) {
  V = a(V);
}
function Ue(a) {
  return Pe().includes(a) ? function(...e) {
    return a.apply(G(this), e), v(this.request);
  } : function(...e) {
    return v(a.apply(G(this), e));
  };
}
function qe(a) {
  return typeof a == "function" ? Ue(a) : (a instanceof IDBTransaction && Ie(a), W(a, Te()) ? new Proxy(a, V) : a);
}
function v(a) {
  if (a instanceof IDBRequest)
    return Ae(a);
  if (B.has(a))
    return B.get(a);
  const e = qe(a);
  return e !== a && (B.set(a, e), j.set(e, a)), e;
}
const G = (a) => j.get(a);
function ue(a, e, { blocked: t, upgrade: s, blocking: n, terminated: r } = {}) {
  const i = indexedDB.open(a, e), o = v(i);
  return s && i.addEventListener("upgradeneeded", (c) => {
    s(v(i.result), c.oldVersion, c.newVersion, v(i.transaction), c);
  }), t && i.addEventListener("blocked", (c) => t(
    // Casting due to https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1405
    c.oldVersion,
    c.newVersion,
    c
  )), o.then((c) => {
    r && c.addEventListener("close", () => r()), n && c.addEventListener("versionchange", (l) => n(l.oldVersion, l.newVersion, l));
  }).catch(() => {
  }), o;
}
function je(a, { blocked: e } = {}) {
  const t = indexedDB.deleteDatabase(a);
  return e && t.addEventListener("blocked", (s) => e(
    // Casting due to https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1405
    s.oldVersion,
    s
  )), v(t).then(() => {
  });
}
const Oe = ["get", "getKey", "getAll", "getAllKeys", "count"], Le = ["put", "add", "delete", "clear"], F = /* @__PURE__ */ new Map();
function Z(a, e) {
  if (!(a instanceof IDBDatabase && !(e in a) && typeof e == "string"))
    return;
  if (F.get(e))
    return F.get(e);
  const t = e.replace(/FromIndex$/, ""), s = e !== t, n = Le.includes(t);
  if (
    // Bail if the target doesn't exist on the target. Eg, getAll isn't in Edge.
    !(t in (s ? IDBIndex : IDBObjectStore).prototype) || !(n || Oe.includes(t))
  )
    return;
  const r = async function(i, ...o) {
    const c = this.transaction(i, n ? "readwrite" : "readonly");
    let l = c.store;
    return s && (l = l.index(o.shift())), (await Promise.all([
      l[t](...o),
      n && c.done
    ]))[0];
  };
  return F.set(e, r), r;
}
le((a) => ({
  ...a,
  get: (e, t, s) => Z(e, t) || a.get(e, t, s),
  has: (e, t) => !!Z(e, t) || a.has(e, t)
}));
const Me = ["continue", "continuePrimaryKey", "advance"], ee = {}, Q = /* @__PURE__ */ new WeakMap(), he = /* @__PURE__ */ new WeakMap(), Be = {
  get(a, e) {
    if (!Me.includes(e))
      return a[e];
    let t = ee[e];
    return t || (t = ee[e] = function(...s) {
      Q.set(this, he.get(this)[e](...s));
    }), t;
  }
};
async function* Fe(...a) {
  let e = this;
  if (e instanceof IDBCursor || (e = await e.openCursor(...a)), !e)
    return;
  e = e;
  const t = new Proxy(e, Be);
  for (he.set(t, e), j.set(t, G(e)); e; )
    yield t, e = await (Q.get(t) || e.continue()), Q.delete(t);
}
function te(a, e) {
  return e === Symbol.asyncIterator && W(a, [IDBIndex, IDBObjectStore, IDBCursor]) || e === "iterate" && W(a, [IDBIndex, IDBObjectStore]);
}
le((a) => ({
  ...a,
  get(e, t, s) {
    return te(e, t) ? Fe : a.get(e, t, s);
  },
  has(e, t) {
    return te(e, t) || a.has(e, t);
  }
}));
const de = "GET", q = (a) => a && typeof a == "object" ? a : {
  handle: a
};
class h {
  handler;
  match;
  method;
  catchHandler;
  constructor(e, t, s = de) {
    this.handler = q(t), this.match = e, this.method = s;
  }
  setCatchHandler(e) {
    this.catchHandler = q(e);
  }
}
class Ke extends h {
  _allowlist;
  _denylist;
  constructor(e, { allowlist: t = [
    /./
  ], denylist: s = [] } = {}) {
    super((n) => this._match(n), e), this._allowlist = t, this._denylist = s;
  }
  _match({ url: e, request: t }) {
    if (t && t.mode !== "navigate")
      return !1;
    const s = e.pathname + e.search;
    for (const n of this._denylist)
      if (n.test(s))
        return !1;
    return !!this._allowlist.some((n) => n.test(s));
  }
}
const We = (a, e = []) => {
  for (const t of [
    ...a.searchParams.keys()
  ])
    e.some((s) => s.test(t)) && a.searchParams.delete(t);
  return a;
};
function* He(a, { directoryIndex: e = "index.html", ignoreURLParametersMatching: t = [
  /^utm_/,
  /^fbclid$/
], cleanURLs: s = !0, urlManipulation: n } = {}) {
  const r = new URL(a, location.href);
  r.hash = "", yield r.href;
  const i = We(r, t);
  if (yield i.href, e && i.pathname.endsWith("/")) {
    const o = new URL(i.href);
    o.pathname += e, yield o.href;
  }
  if (s) {
    const o = new URL(i.href);
    o.pathname += ".html", yield o.href;
  }
  if (n) {
    const o = n({
      url: r
    });
    for (const c of o)
      yield c.href;
  }
}
class Ve extends h {
  constructor(e, t, s) {
    const n = ({ url: r }) => {
      const i = e.exec(r.href);
      if (i && !(r.origin !== location.origin && i.index !== 0))
        return i.slice(1);
    };
    super(n, t, s);
  }
}
const Ge = async (a, e, t) => {
  const s = e.map((o, c) => ({
    index: c,
    item: o
  })), n = async (o) => {
    const c = [];
    for (; ; ) {
      const l = s.pop();
      if (!l)
        return o(c);
      const f = await t(l.item);
      c.push({
        result: f,
        index: l.index
      });
    }
  }, r = Array.from({
    length: a
  }, () => new Promise(n));
  return (await Promise.all(r)).flat().sort((o, c) => o.index < c.index ? -1 : 1).map((o) => o.result);
}, Qe = () => {
  self.__WB_DISABLE_DEV_LOGS = !0;
};
function I(a) {
  return typeof a == "string" ? new Request(a) : a;
}
class ze {
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
    this.event = t.event, this.request = t.request, t.url && (this.url = t.url, this.params = t.params), this._strategy = e, this._handlerDeferred = new Re(), this._extendLifetimePromises = [], this._plugins = [
      ...e.plugins
    ], this._pluginStateMap = /* @__PURE__ */ new Map();
    for (const s of this._plugins)
      this._pluginStateMap.set(s, {});
    this.event.waitUntil(this._handlerDeferred.promise);
  }
  async fetch(e) {
    const { event: t } = this;
    let s = I(e);
    const n = await this.getPreloadResponse();
    if (n)
      return n;
    const r = this.hasCallback("fetchDidFail") ? s.clone() : null;
    try {
      for (const o of this.iterateCallbacks("requestWillFetch"))
        s = await o({
          request: s.clone(),
          event: t
        });
    } catch (o) {
      if (o instanceof Error)
        throw new u("plugin-error-request-will-fetch", {
          thrownErrorMessage: o.message
        });
    }
    const i = s.clone();
    try {
      let o;
      o = await fetch(s, s.mode === "navigate" ? void 0 : this._strategy.fetchOptions);
      for (const c of this.iterateCallbacks("fetchDidSucceed"))
        o = await c({
          event: t,
          request: i,
          response: o
        });
      return o;
    } catch (o) {
      throw r && await this.runCallbacks("fetchDidFail", {
        error: o,
        event: t,
        originalRequest: r.clone(),
        request: i.clone()
      }), o;
    }
  }
  async fetchAndCachePut(e) {
    const t = await this.fetch(e), s = t.clone();
    return this.waitUntil(this.cachePut(e, s)), t;
  }
  async cacheMatch(e) {
    const t = I(e);
    let s;
    const { cacheName: n, matchOptions: r } = this._strategy, i = await this.getCacheKey(t, "read"), o = {
      ...r,
      cacheName: n
    };
    s = await caches.match(i, o);
    for (const c of this.iterateCallbacks("cachedResponseWillBeUsed"))
      s = await c({
        cacheName: n,
        matchOptions: r,
        cachedResponse: s,
        request: i,
        event: this.event
      }) || void 0;
    return s;
  }
  async cachePut(e, t) {
    const s = I(e);
    await ce(0);
    const n = await this.getCacheKey(s, "write");
    if (!t)
      throw new u("cache-put-with-no-response", {
        url: be(n.url)
      });
    const r = await this._ensureResponseSafeToCache(t);
    if (!r)
      return !1;
    const { cacheName: i, matchOptions: o } = this._strategy, c = await self.caches.open(i), l = this.hasCallback("cacheDidUpdate"), f = l ? await Ee(c, n.clone(), [
      "__WB_REVISION__"
    ], o) : null;
    try {
      await c.put(n, l ? r.clone() : r);
    } catch (d) {
      if (d instanceof Error)
        throw d.name === "QuotaExceededError" && await Ce(), d;
    }
    for (const d of this.iterateCallbacks("cacheDidUpdate"))
      await d({
        cacheName: i,
        oldResponse: f,
        newResponse: r.clone(),
        request: n,
        event: this.event
      });
    return !0;
  }
  async getCacheKey(e, t) {
    const s = `${e.url} | ${t}`;
    if (!this._cacheKeys[s]) {
      let n = e;
      for (const r of this.iterateCallbacks("cacheKeyWillBeUsed"))
        n = I(await r({
          mode: t,
          request: n,
          event: this.event,
          params: this.params
        }));
      this._cacheKeys[s] = n;
    }
    return this._cacheKeys[s];
  }
  hasCallback(e) {
    for (const t of this._strategy.plugins)
      if (e in t)
        return !0;
    return !1;
  }
  async runCallbacks(e, t) {
    for (const s of this.iterateCallbacks(e))
      await s(t);
  }
  *iterateCallbacks(e) {
    for (const t of this._strategy.plugins)
      if (typeof t[e] == "function") {
        const s = this._pluginStateMap.get(t);
        yield (r) => {
          const i = {
            ...r,
            state: s
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
    for (; e = this._extendLifetimePromises.shift(); )
      await e;
  }
  destroy() {
    this._handlerDeferred.resolve(null);
  }
  async getPreloadResponse() {
    if (this.event instanceof FetchEvent && this.event.request.mode === "navigate" && "preloadResponse" in this.event)
      try {
        const e = await this.event.preloadResponse;
        if (e)
          return e;
      } catch {
        return;
      }
  }
  async _ensureResponseSafeToCache(e) {
    let t = e, s = !1;
    for (const n of this.iterateCallbacks("cacheWillUpdate"))
      if (t = await n({
        request: this.request,
        response: t,
        event: this.event
      }) || void 0, s = !0, !t)
        break;
    return s || t && t.status !== 200 && (t = void 0), t;
  }
}
class S {
  cacheName;
  plugins;
  fetchOptions;
  matchOptions;
  constructor(e = {}) {
    this.cacheName = C.getRuntimeName(e.cacheName), this.plugins = e.plugins || [], this.fetchOptions = e.fetchOptions, this.matchOptions = e.matchOptions;
  }
  handle(e) {
    const [t] = this.handleAll(e);
    return t;
  }
  handleAll(e) {
    e instanceof FetchEvent && (e = {
      event: e,
      request: e.request
    });
    const t = e.event, s = typeof e.request == "string" ? new Request(e.request) : e.request, n = new ze(this, e.url ? {
      event: t,
      request: s,
      url: e.url,
      params: e.params
    } : {
      event: t,
      request: s
    }), r = this._getResponse(n, s, t), i = this._awaitComplete(r, n, s, t);
    return [
      r,
      i
    ];
  }
  async _getResponse(e, t, s) {
    await e.runCallbacks("handlerWillStart", {
      event: s,
      request: t
    });
    let n;
    try {
      if (n = await this._handle(t, e), n === void 0 || n.type === "error")
        throw new u("no-response", {
          url: t.url
        });
    } catch (r) {
      if (r instanceof Error) {
        for (const i of e.iterateCallbacks("handlerDidError"))
          if (n = await i({
            error: r,
            event: s,
            request: t
          }), n !== void 0)
            break;
      }
      if (!n)
        throw r;
    }
    for (const r of e.iterateCallbacks("handlerWillRespond"))
      n = await r({
        event: s,
        request: t,
        response: n
      });
    return n;
  }
  async _awaitComplete(e, t, s, n) {
    let r, i;
    try {
      r = await e;
    } catch {
    }
    try {
      await t.runCallbacks("handlerDidRespond", {
        event: n,
        request: s,
        response: r
      }), await t.doneWaiting();
    } catch (o) {
      o instanceof Error && (i = o);
    }
    if (await t.runCallbacks("handlerDidComplete", {
      event: n,
      request: s,
      response: r,
      error: i
    }), t.destroy(), i)
      throw i;
  }
}
const fe = {
  cacheWillUpdate: async ({ response: a }) => a.status === 200 || a.status === 0 ? a : null
};
class z extends S {
  _networkTimeoutSeconds;
  constructor(e = {}) {
    super(e), this.plugins.some((t) => "cacheWillUpdate" in t) || this.plugins.unshift(fe), this._networkTimeoutSeconds = e.networkTimeoutSeconds || 0;
  }
  async _handle(e, t) {
    const s = [], n = [];
    let r;
    if (this._networkTimeoutSeconds) {
      const { id: c, promise: l } = this._getTimeoutPromise({
        request: e,
        logs: s,
        handler: t
      });
      r = c, n.push(l);
    }
    const i = this._getNetworkPromise({
      timeoutId: r,
      request: e,
      logs: s,
      handler: t
    });
    n.push(i);
    const o = await t.waitUntil((async () => await t.waitUntil(Promise.race(n)) || await i)());
    if (!o)
      throw new u("no-response", {
        url: e.url
      });
    return o;
  }
  _getTimeoutPromise({ request: e, logs: t, handler: s }) {
    let n;
    return {
      promise: new Promise((i) => {
        n = setTimeout(async () => {
          i(await s.cacheMatch(e));
        }, this._networkTimeoutSeconds * 1e3);
      }),
      id: n
    };
  }
  async _getNetworkPromise({ timeoutId: e, request: t, logs: s, handler: n }) {
    let r, i;
    try {
      i = await n.fetchAndCachePut(t);
    } catch (o) {
      o instanceof Error && (r = o);
    }
    return e && clearTimeout(e), (r || !i) && (i = await n.cacheMatch(t)), i;
  }
}
class Je extends S {
  _networkTimeoutSeconds;
  constructor(e = {}) {
    super(e), this._networkTimeoutSeconds = e.networkTimeoutSeconds || 0;
  }
  async _handle(e, t) {
    let s, n;
    try {
      const r = [
        t.fetch(e)
      ];
      if (this._networkTimeoutSeconds) {
        const i = ce(this._networkTimeoutSeconds * 1e3);
        r.push(i);
      }
      if (n = await Promise.race(r), !n)
        throw new Error(`Timed out the network response after ${this._networkTimeoutSeconds} seconds.`);
    } catch (r) {
      r instanceof Error && (s = r);
    }
    if (!n)
      throw new u("no-response", {
        url: e.url,
        error: s
      });
    return n;
  }
}
const se = 3, $e = "serwist-background-sync", g = "requests", T = "queueName";
class Ye {
  _db = null;
  async addEntry(e) {
    const s = (await this.getDb()).transaction(g, "readwrite", {
      durability: "relaxed"
    });
    await s.store.add(e), await s.done;
  }
  async getFirstEntryId() {
    return (await (await this.getDb()).transaction(g).store.openCursor())?.value.id;
  }
  async getAllEntriesByQueueName(e) {
    const s = await (await this.getDb()).getAllFromIndex(g, T, IDBKeyRange.only(e));
    return s || [];
  }
  async getEntryCountByQueueName(e) {
    return (await this.getDb()).countFromIndex(g, T, IDBKeyRange.only(e));
  }
  async deleteEntry(e) {
    await (await this.getDb()).delete(g, e);
  }
  async getFirstEntryByQueueName(e) {
    return await this.getEndEntryFromIndex(IDBKeyRange.only(e), "next");
  }
  async getLastEntryByQueueName(e) {
    return await this.getEndEntryFromIndex(IDBKeyRange.only(e), "prev");
  }
  async getEndEntryFromIndex(e, t) {
    return (await (await this.getDb()).transaction(g).store.index(T).openCursor(e, t))?.value;
  }
  async getDb() {
    return this._db || (this._db = await ue($e, se, {
      upgrade: this._upgradeDb
    })), this._db;
  }
  _upgradeDb(e, t) {
    t > 0 && t < se && e.objectStoreNames.contains(g) && e.deleteObjectStore(g), e.createObjectStore(g, {
      autoIncrement: !0,
      keyPath: "id"
    }).createIndex(T, T, {
      unique: !1
    });
  }
}
class Xe {
  _queueName;
  _queueDb;
  constructor(e) {
    this._queueName = e, this._queueDb = new Ye();
  }
  async pushEntry(e) {
    delete e.id, e.queueName = this._queueName, await this._queueDb.addEntry(e);
  }
  async unshiftEntry(e) {
    const t = await this._queueDb.getFirstEntryId();
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
}
const Ze = [
  "method",
  "referrer",
  "referrerPolicy",
  "mode",
  "credentials",
  "cache",
  "redirect",
  "integrity",
  "keepalive"
];
class P {
  _requestData;
  static async fromRequest(e) {
    const t = {
      url: e.url,
      headers: {}
    };
    e.method !== "GET" && (t.body = await e.clone().arrayBuffer()), e.headers.forEach((s, n) => {
      t.headers[n] = s;
    });
    for (const s of Ze)
      e[s] !== void 0 && (t[s] = e[s]);
    return new P(t);
  }
  constructor(e) {
    e.mode === "navigate" && (e.mode = "same-origin"), this._requestData = e;
  }
  toObject() {
    const e = Object.assign({}, this._requestData);
    return e.headers = Object.assign({}, this._requestData.headers), e.body && (e.body = e.body.slice(0)), e;
  }
  toRequest() {
    return new Request(this._requestData.url, this._requestData);
  }
  clone() {
    return new P(this.toObject());
  }
}
const ae = "serwist-background-sync", et = 1440 * 7, K = /* @__PURE__ */ new Set(), ne = (a) => {
  const e = {
    request: new P(a.requestData).toRequest(),
    timestamp: a.timestamp
  };
  return a.metadata && (e.metadata = a.metadata), e;
};
class tt {
  _name;
  _onSync;
  _maxRetentionTime;
  _queueStore;
  _forceSyncFallback;
  _syncInProgress = !1;
  _requestsAddedDuringSync = !1;
  constructor(e, { forceSyncFallback: t, onSync: s, maxRetentionTime: n } = {}) {
    if (K.has(e))
      throw new u("duplicate-queue-name", {
        name: e
      });
    K.add(e), this._name = e, this._onSync = s || this.replayRequests, this._maxRetentionTime = n || et, this._forceSyncFallback = !!t, this._queueStore = new Xe(this._name), this._addSyncListener();
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
    const e = await this._queueStore.getAll(), t = Date.now(), s = [];
    for (const n of e) {
      const r = this._maxRetentionTime * 60 * 1e3;
      t - n.timestamp > r ? await this._queueStore.deleteEntry(n.id) : s.push(ne(n));
    }
    return s;
  }
  async size() {
    return await this._queueStore.size();
  }
  async _addRequest({ request: e, metadata: t, timestamp: s = Date.now() }, n) {
    const i = {
      requestData: (await P.fromRequest(e.clone())).toObject(),
      timestamp: s
    };
    switch (t && (i.metadata = t), n) {
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
    const t = Date.now();
    let s;
    switch (e) {
      case "pop":
        s = await this._queueStore.popEntry();
        break;
      case "shift":
        s = await this._queueStore.shiftEntry();
        break;
    }
    if (s) {
      const n = this._maxRetentionTime * 60 * 1e3;
      return t - s.timestamp > n ? this._removeRequest(e) : ne(s);
    }
  }
  async replayRequests() {
    let e;
    for (; e = await this.shiftRequest(); )
      try {
        await fetch(e.request.clone());
      } catch {
        throw await this.unshiftRequest(e), new u("queue-replay-failed", {
          name: this._name
        });
      }
  }
  async registerSync() {
    if ("sync" in self.registration && !this._forceSyncFallback)
      try {
        await self.registration.sync.register(`${ae}:${this._name}`);
      } catch {
      }
  }
  _addSyncListener() {
    "sync" in self.registration && !this._forceSyncFallback ? self.addEventListener("sync", (e) => {
      if (e.tag === `${ae}:${this._name}`) {
        const t = async () => {
          this._syncInProgress = !0;
          let s;
          try {
            await this._onSync({
              queue: this
            });
          } catch (n) {
            if (n instanceof Error)
              throw s = n, s;
          } finally {
            this._requestsAddedDuringSync && !(s && !e.lastChance) && await this.registerSync(), this._syncInProgress = !1, this._requestsAddedDuringSync = !1;
          }
        };
        e.waitUntil(t());
      }
    }) : this._onSync({
      queue: this
    });
  }
  static get _queueNames() {
    return K;
  }
}
class st {
  _queue;
  constructor(e, t) {
    this._queue = new tt(e, t);
  }
  async fetchDidFail({ request: e }) {
    await this._queue.pushRequest({
      request: e
    });
  }
}
const at = async (a, e) => {
  let t = null;
  if (a.url && (t = new URL(a.url).origin), t !== self.location.origin)
    throw new u("cross-origin-copy-response", {
      origin: t
    });
  const s = a.clone(), r = {
    headers: new Headers(s.headers),
    status: s.status,
    statusText: s.statusText
  }, i = xe() ? s.body : await s.blob();
  return new Response(i, r);
};
class k extends S {
  _fallbackToNetwork;
  static defaultPrecacheCacheabilityPlugin = {
    async cacheWillUpdate({ response: e }) {
      return !e || e.status >= 400 ? null : e;
    }
  };
  static copyRedirectedCacheableResponsesPlugin = {
    async cacheWillUpdate({ response: e }) {
      return e.redirected ? await at(e) : e;
    }
  };
  constructor(e = {}) {
    e.cacheName = C.getPrecacheName(e.cacheName), super(e), this._fallbackToNetwork = e.fallbackToNetwork !== !1, this.plugins.push(k.copyRedirectedCacheableResponsesPlugin);
  }
  async _handle(e, t) {
    const s = await t.getPreloadResponse();
    if (s)
      return s;
    const n = await t.cacheMatch(e);
    return n || (t.event && t.event.type === "install" ? await this._handleInstall(e, t) : await this._handleFetch(e, t));
  }
  async _handleFetch(e, t) {
    let s;
    const n = t.params || {};
    if (this._fallbackToNetwork) {
      const r = n.integrity, i = e.integrity, o = !i || i === r;
      s = await t.fetch(new Request(e, {
        integrity: e.mode !== "no-cors" ? i || r : void 0
      })), r && o && e.mode !== "no-cors" && (this._useDefaultCacheabilityPluginIfNeeded(), await t.cachePut(e, s.clone()));
    } else
      throw new u("missing-precache-entry", {
        cacheName: this.cacheName,
        url: e.url
      });
    return s;
  }
  async _handleInstall(e, t) {
    this._useDefaultCacheabilityPluginIfNeeded();
    const s = await t.fetch(e);
    if (!await t.cachePut(e, s.clone()))
      throw new u("bad-precaching-response", {
        url: e.url,
        status: s.status
      });
    return s;
  }
  _useDefaultCacheabilityPluginIfNeeded() {
    let e = null, t = 0;
    for (const [s, n] of this.plugins.entries())
      n !== k.copyRedirectedCacheableResponsesPlugin && (n === k.defaultPrecacheCacheabilityPlugin && (e = s), n.cacheWillUpdate && t++);
    t === 0 ? this.plugins.push(k.defaultPrecacheCacheabilityPlugin) : t > 1 && e !== null && this.plugins.splice(e, 1);
  }
}
const nt = () => !!self.registration?.navigationPreload, rt = (a) => {
  nt() && self.addEventListener("activate", (e) => {
    e.waitUntil(self.registration.navigationPreload.enable().then(() => {
    }));
  });
}, it = (a) => {
  C.updateDetails(a);
};
class ot {
  updatedURLs = [];
  notUpdatedURLs = [];
  handlerWillStart = async ({ request: e, state: t }) => {
    t && (t.originalRequest = e);
  };
  cachedResponseWillBeUsed = async ({ event: e, state: t, cachedResponse: s }) => {
    if (e.type === "install" && t?.originalRequest && t.originalRequest instanceof Request) {
      const n = t.originalRequest.url;
      s ? this.notUpdatedURLs.push(n) : this.updatedURLs.push(n);
    }
    return s;
  };
}
const ct = "__WB_REVISION__", lt = (a) => {
  if (!a)
    throw new u("add-to-cache-list-unexpected-type", {
      entry: a
    });
  if (typeof a == "string") {
    const r = new URL(a, location.href);
    return {
      cacheKey: r.href,
      url: r.href
    };
  }
  const { revision: e, url: t } = a;
  if (!t)
    throw new u("add-to-cache-list-unexpected-type", {
      entry: a
    });
  if (!e) {
    const r = new URL(t, location.href);
    return {
      cacheKey: r.href,
      url: r.href
    };
  }
  const s = new URL(t, location.href), n = new URL(t, location.href);
  return s.searchParams.set(ct, e), {
    cacheKey: s.href,
    url: n.href
  };
}, ut = (a, e, t) => {
  if (typeof a == "string") {
    const s = new URL(a, location.href), n = ({ url: r }) => r.href === s.href;
    return new h(n, e, t);
  }
  if (a instanceof RegExp)
    return new Ve(a, e, t);
  if (typeof a == "function")
    return new h(a, e, t);
  if (a instanceof h)
    return a;
  throw new u("unsupported-route-type", {
    moduleName: "serwist",
    funcName: "parseRoute",
    paramName: "capture"
  });
};
class ht extends h {
  constructor(e, t) {
    const s = ({ request: n }) => {
      const r = e.getUrlsToPrecacheKeys();
      for (const i of He(n.url, t)) {
        const o = r.get(i);
        if (o) {
          const c = e.getIntegrityForPrecacheKey(o);
          return {
            cacheKey: o,
            integrity: c
          };
        }
      }
    };
    super(s, e.precacheStrategy);
  }
}
const dt = "serwist-google-analytics", ft = 2880, me = "www.google-analytics.com", pe = "www.googletagmanager.com", mt = "/analytics.js", pt = "/gtag/js", wt = "/gtm.js", gt = /^\/(\w+\/)?collect/, yt = (a) => async ({ queue: e }) => {
  let t;
  for (; t = await e.shiftRequest(); ) {
    const { request: s, timestamp: n } = t, r = new URL(s.url);
    try {
      const i = s.method === "POST" ? new URLSearchParams(await s.clone().text()) : r.searchParams, o = n - (Number(i.get("qt")) || 0), c = Date.now() - o;
      if (i.set("qt", String(c)), a.parameterOverrides)
        for (const l of Object.keys(a.parameterOverrides)) {
          const f = a.parameterOverrides[l];
          i.set(l, f);
        }
      typeof a.hitFilter == "function" && a.hitFilter.call(null, i), await fetch(new Request(r.origin + r.pathname, {
        body: i.toString(),
        method: "POST",
        mode: "cors",
        credentials: "omit",
        headers: {
          "Content-Type": "text/plain"
        }
      }));
    } catch (i) {
      throw await e.unshiftRequest(t), i;
    }
  }
}, _t = (a) => {
  const e = ({ url: s }) => s.hostname === me && gt.test(s.pathname), t = new Je({
    plugins: [
      a
    ]
  });
  return [
    new h(e, t, "GET"),
    new h(e, t, "POST")
  ];
}, bt = (a) => {
  const e = ({ url: s }) => s.hostname === me && s.pathname === mt, t = new z({
    cacheName: a
  });
  return new h(e, t, "GET");
}, vt = (a) => {
  const e = ({ url: s }) => s.hostname === pe && s.pathname === pt, t = new z({
    cacheName: a
  });
  return new h(e, t, "GET");
}, Rt = (a) => {
  const e = ({ url: s }) => s.hostname === pe && s.pathname === wt, t = new z({
    cacheName: a
  });
  return new h(e, t, "GET");
}, re = ({ serwist: a, cacheName: e, ...t }) => {
  const s = C.getGoogleAnalyticsName(e), n = new st(dt, {
    maxRetentionTime: ft,
    onSync: yt(t)
  }), r = [
    Rt(s),
    bt(s),
    vt(s),
    ..._t(n)
  ];
  for (const i of r)
    a.registerRoute(i);
};
class Et {
  _fallbackUrls;
  _serwist;
  constructor({ fallbackUrls: e, serwist: t }) {
    this._fallbackUrls = e, this._serwist = t;
  }
  async handlerDidError(e) {
    for (const t of this._fallbackUrls)
      if (typeof t == "string") {
        const s = await this._serwist.matchPrecache(t);
        if (s !== void 0)
          return s;
      } else if (t.matcher(e)) {
        const s = await this._serwist.matchPrecache(t.url);
        if (s !== void 0)
          return s;
      }
  }
}
class Ct {
  _precacheController;
  constructor({ precacheController: e }) {
    this._precacheController = e;
  }
  cacheKeyWillBeUsed = async ({ request: e, params: t }) => {
    const s = t?.cacheKey || this._precacheController.getPrecacheKeyForUrl(e.url);
    return s ? new Request(s, {
      headers: e.headers
    }) : e;
  };
}
const xt = (a, e = {}) => {
  const { cacheName: t, plugins: s = [], fetchOptions: n, matchOptions: r, fallbackToNetwork: i, directoryIndex: o, ignoreURLParametersMatching: c, cleanURLs: l, urlManipulation: f, cleanupOutdatedCaches: d, concurrency: D = 10, navigateFallback: A, navigateFallbackAllowlist: O, navigateFallbackDenylist: _ } = e ?? {};
  return {
    precacheStrategyOptions: {
      cacheName: C.getPrecacheName(t),
      plugins: [
        ...s,
        new Ct({
          precacheController: a
        })
      ],
      fetchOptions: n,
      matchOptions: r,
      fallbackToNetwork: i
    },
    precacheRouteOptions: {
      directoryIndex: o,
      ignoreURLParametersMatching: c,
      cleanURLs: l,
      urlManipulation: f
    },
    precacheMiscOptions: {
      cleanupOutdatedCaches: d,
      concurrency: D,
      navigateFallback: A,
      navigateFallbackAllowlist: O,
      navigateFallbackDenylist: _
    }
  };
};
class Dt {
  _urlsToCacheKeys = /* @__PURE__ */ new Map();
  _urlsToCacheModes = /* @__PURE__ */ new Map();
  _cacheKeysToIntegrities = /* @__PURE__ */ new Map();
  _concurrentPrecaching;
  _precacheStrategy;
  _routes;
  _defaultHandlerMap;
  _catchHandler;
  _requestRules;
  constructor({ precacheEntries: e, precacheOptions: t, skipWaiting: s = !1, importScripts: n, navigationPreload: r = !1, cacheId: i, clientsClaim: o = !1, runtimeCaching: c, offlineAnalyticsConfig: l, disableDevLogs: f = !1, fallbacks: d, requestRules: D } = {}) {
    const { precacheStrategyOptions: A, precacheRouteOptions: O, precacheMiscOptions: _ } = xt(this, t);
    if (this._concurrentPrecaching = _.concurrency, this._precacheStrategy = new k(A), this._routes = /* @__PURE__ */ new Map(), this._defaultHandlerMap = /* @__PURE__ */ new Map(), this._requestRules = D, this.handleInstall = this.handleInstall.bind(this), this.handleActivate = this.handleActivate.bind(this), this.handleFetch = this.handleFetch.bind(this), this.handleCache = this.handleCache.bind(this), n && n.length > 0 && self.importScripts(...n), r && rt(), i !== void 0 && it({
      prefix: i
    }), s ? self.skipWaiting() : self.addEventListener("message", (b) => {
      b.data && b.data.type === "SKIP_WAITING" && self.skipWaiting();
    }), o && Ne(), e && e.length > 0 && this.addToPrecacheList(e), _.cleanupOutdatedCaches && Se(A.cacheName), this.registerRoute(new ht(this, O)), _.navigateFallback && this.registerRoute(new Ke(this.createHandlerBoundToUrl(_.navigateFallback), {
      allowlist: _.navigateFallbackAllowlist,
      denylist: _.navigateFallbackDenylist
    })), l !== void 0 && (typeof l == "boolean" ? l && re({
      serwist: this
    }) : re({
      ...l,
      serwist: this
    })), c !== void 0) {
      if (d !== void 0) {
        const b = new Et({
          fallbackUrls: d.entries,
          serwist: this
        });
        c.forEach((L) => {
          L.handler instanceof S && !L.handler.plugins.some((ge) => "handlerDidError" in ge) && L.handler.plugins.push(b);
        });
      }
      for (const b of c)
        this.registerCapture(b.matcher, b.handler, b.method);
    }
    f && Qe();
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
    const t = [];
    for (const s of e) {
      typeof s == "string" ? t.push(s) : s && !s.integrity && s.revision === void 0 && t.push(s.url);
      const { cacheKey: n, url: r } = lt(s), i = typeof s != "string" && s.revision ? "reload" : "default";
      if (this._urlsToCacheKeys.has(r) && this._urlsToCacheKeys.get(r) !== n)
        throw new u("add-to-cache-list-conflicting-entries", {
          firstEntry: this._urlsToCacheKeys.get(r),
          secondEntry: n
        });
      if (typeof s != "string" && s.integrity) {
        if (this._cacheKeysToIntegrities.has(n) && this._cacheKeysToIntegrities.get(n) !== s.integrity)
          throw new u("add-to-cache-list-conflicting-integrities", {
            url: r
          });
        this._cacheKeysToIntegrities.set(n, s.integrity);
      }
      this._urlsToCacheKeys.set(r, n), this._urlsToCacheModes.set(r, i);
    }
    if (t.length > 0) {
      const s = `Serwist is precaching URLs without revision info: ${t.join(", ")}
This is generally NOT safe. Learn more at https://bit.ly/wb-precache`;
      console.warn(s);
    }
  }
  handleInstall(e) {
    return this.registerRequestRules(e), $(e, async () => {
      const t = new ot();
      this.precacheStrategy.plugins.push(t), await Ge(this._concurrentPrecaching, Array.from(this._urlsToCacheKeys.entries()), async ([r, i]) => {
        const o = this._cacheKeysToIntegrities.get(i), c = this._urlsToCacheModes.get(r), l = new Request(r, {
          integrity: o,
          cache: c,
          credentials: "same-origin"
        });
        await Promise.all(this.precacheStrategy.handleAll({
          event: e,
          request: l,
          url: new URL(l.url),
          params: {
            cacheKey: i
          }
        }));
      });
      const { updatedURLs: s, notUpdatedURLs: n } = t;
      return {
        updatedURLs: s,
        notUpdatedURLs: n
      };
    });
  }
  async registerRequestRules(e) {
    if (this._requestRules && e?.addRoutes)
      try {
        await e.addRoutes(this._requestRules), this._requestRules = void 0;
      } catch (t) {
        throw t;
      }
  }
  handleActivate(e) {
    return $(e, async () => {
      const t = await self.caches.open(this.precacheStrategy.cacheName), s = await t.keys(), n = new Set(this._urlsToCacheKeys.values()), r = [];
      for (const i of s)
        n.has(i.url) || (await t.delete(i), r.push(i.url));
      return {
        deletedCacheRequests: r
      };
    });
  }
  handleFetch(e) {
    const { request: t } = e, s = this.handleRequest({
      request: t,
      event: e
    });
    s && e.respondWith(s);
  }
  handleCache(e) {
    if (e.data && e.data.type === "CACHE_URLS") {
      const { payload: t } = e.data, s = Promise.all(t.urlsToCache.map((n) => {
        let r;
        return typeof n == "string" ? r = new Request(n) : r = new Request(...n), this.handleRequest({
          request: r,
          event: e
        });
      }));
      e.waitUntil(s), e.ports?.[0] && s.then(() => e.ports[0].postMessage(!0));
    }
  }
  setDefaultHandler(e, t = de) {
    this._defaultHandlerMap.set(t, q(e));
  }
  setCatchHandler(e) {
    this._catchHandler = q(e);
  }
  registerCapture(e, t, s) {
    const n = ut(e, t, s);
    return this.registerRoute(n), n;
  }
  registerRoute(e) {
    this._routes.has(e.method) || this._routes.set(e.method, []), this._routes.get(e.method).push(e);
  }
  unregisterRoute(e) {
    if (!this._routes.has(e.method))
      throw new u("unregister-route-but-not-found-with-method", {
        method: e.method
      });
    const t = this._routes.get(e.method).indexOf(e);
    if (t > -1)
      this._routes.get(e.method).splice(t, 1);
    else
      throw new u("unregister-route-route-not-registered");
  }
  getUrlsToPrecacheKeys() {
    return this._urlsToCacheKeys;
  }
  getPrecachedUrls() {
    return [
      ...this._urlsToCacheKeys.keys()
    ];
  }
  getPrecacheKeyForUrl(e) {
    const t = new URL(e, location.href);
    return this._urlsToCacheKeys.get(t.href);
  }
  getIntegrityForPrecacheKey(e) {
    return this._cacheKeysToIntegrities.get(e);
  }
  async matchPrecache(e) {
    const t = e instanceof Request ? e.url : e, s = this.getPrecacheKeyForUrl(t);
    if (s)
      return (await self.caches.open(this.precacheStrategy.cacheName)).match(s);
  }
  createHandlerBoundToUrl(e) {
    const t = this.getPrecacheKeyForUrl(e);
    if (!t)
      throw new u("non-precached-url", {
        url: e
      });
    return (s) => (s.request = new Request(e), s.params = {
      cacheKey: t,
      ...s.params
    }, this.precacheStrategy.handle(s));
  }
  handleRequest({ request: e, event: t }) {
    const s = new URL(e.url, location.href);
    if (!s.protocol.startsWith("http"))
      return;
    const n = s.origin === location.origin, { params: r, route: i } = this.findMatchingRoute({
      event: t,
      request: e,
      sameOrigin: n,
      url: s
    });
    let o = i?.handler;
    const c = e.method;
    if (!o && this._defaultHandlerMap.has(c) && (o = this._defaultHandlerMap.get(c)), !o)
      return;
    let l;
    try {
      l = o.handle({
        url: s,
        request: e,
        event: t,
        params: r
      });
    } catch (d) {
      l = Promise.reject(d);
    }
    const f = i?.catchHandler;
    return l instanceof Promise && (this._catchHandler || f) && (l = l.catch(async (d) => {
      if (f)
        try {
          return await f.handle({
            url: s,
            request: e,
            event: t,
            params: r
          });
        } catch (D) {
          D instanceof Error && (d = D);
        }
      if (this._catchHandler)
        return this._catchHandler.handle({
          url: s,
          request: e,
          event: t
        });
      throw d;
    })), l;
  }
  findMatchingRoute({ url: e, sameOrigin: t, request: s, event: n }) {
    const r = this._routes.get(s.method) || [];
    for (const i of r) {
      let o;
      const c = i.match({
        url: e,
        sameOrigin: t,
        request: s,
        event: n
      });
      if (c)
        return o = c, (Array.isArray(o) && o.length === 0 || c.constructor === Object && Object.keys(c).length === 0 || typeof c == "boolean") && (o = void 0), {
          route: i,
          params: o
        };
    }
    return {};
  }
}
const kt = "serwist-expiration", U = "cache-entries", ie = (a) => {
  const e = new URL(a, location.href);
  return e.hash = "", e.href;
};
class St {
  _cacheName;
  _db = null;
  constructor(e) {
    this._cacheName = e;
  }
  _getId(e) {
    return `${this._cacheName}|${ie(e)}`;
  }
  _upgradeDb(e) {
    const t = e.createObjectStore(U, {
      keyPath: "id"
    });
    t.createIndex("cacheName", "cacheName", {
      unique: !1
    }), t.createIndex("timestamp", "timestamp", {
      unique: !1
    });
  }
  _upgradeDbAndDeleteOldDbs(e) {
    this._upgradeDb(e), this._cacheName && je(this._cacheName);
  }
  async setTimestamp(e, t) {
    e = ie(e);
    const s = {
      id: this._getId(e),
      cacheName: this._cacheName,
      url: e,
      timestamp: t
    }, r = (await this.getDb()).transaction(U, "readwrite", {
      durability: "relaxed"
    });
    await r.store.put(s), await r.done;
  }
  async getTimestamp(e) {
    return (await (await this.getDb()).get(U, this._getId(e)))?.timestamp;
  }
  async expireEntries(e, t) {
    let n = await (await this.getDb()).transaction(U, "readwrite").store.index("timestamp").openCursor(null, "prev");
    const r = [];
    let i = 0;
    for (; n; ) {
      const o = n.value;
      o.cacheName === this._cacheName && (e && o.timestamp < e || t && i >= t ? (n.delete(), r.push(o.url)) : i++), n = await n.continue();
    }
    return r;
  }
  async getDb() {
    return this._db || (this._db = await ue(kt, 1, {
      upgrade: this._upgradeDbAndDeleteOldDbs.bind(this)
    })), this._db;
  }
}
class Nt {
  _isRunning = !1;
  _rerunRequested = !1;
  _maxEntries;
  _maxAgeSeconds;
  _matchOptions;
  _cacheName;
  _timestampModel;
  constructor(e, t = {}) {
    this._maxEntries = t.maxEntries, this._maxAgeSeconds = t.maxAgeSeconds, this._matchOptions = t.matchOptions, this._cacheName = e, this._timestampModel = new St(e);
  }
  async expireEntries() {
    if (this._isRunning) {
      this._rerunRequested = !0;
      return;
    }
    this._isRunning = !0;
    const e = this._maxAgeSeconds ? Date.now() - this._maxAgeSeconds * 1e3 : 0, t = await this._timestampModel.expireEntries(e, this._maxEntries), s = await self.caches.open(this._cacheName);
    for (const n of t)
      await s.delete(n, this._matchOptions);
    this._isRunning = !1, this._rerunRequested && (this._rerunRequested = !1, this.expireEntries());
  }
  async updateTimestamp(e) {
    await this._timestampModel.setTimestamp(e, Date.now());
  }
  async isURLExpired(e) {
    if (!this._maxAgeSeconds)
      return !1;
    const t = await this._timestampModel.getTimestamp(e), s = Date.now() - this._maxAgeSeconds * 1e3;
    return t !== void 0 ? t < s : !0;
  }
  async delete() {
    this._rerunRequested = !1, await this._timestampModel.expireEntries(Number.POSITIVE_INFINITY);
  }
}
const Tt = (a) => {
  oe.add(a);
};
class p {
  _config;
  _cacheExpirations;
  constructor(e = {}) {
    this._config = e, this._cacheExpirations = /* @__PURE__ */ new Map(), this._config.maxAgeFrom || (this._config.maxAgeFrom = "last-fetched"), this._config.purgeOnQuotaError && Tt(() => this.deleteCacheAndMetadata());
  }
  _getCacheExpiration(e) {
    if (e === C.getRuntimeName())
      throw new u("expire-custom-caches-only");
    let t = this._cacheExpirations.get(e);
    return t || (t = new Nt(e, this._config), this._cacheExpirations.set(e, t)), t;
  }
  cachedResponseWillBeUsed({ event: e, cacheName: t, request: s, cachedResponse: n }) {
    if (!n)
      return null;
    const r = this._isResponseDateFresh(n), i = this._getCacheExpiration(t), o = this._config.maxAgeFrom === "last-used", c = (async () => {
      o && await i.updateTimestamp(s.url), await i.expireEntries();
    })();
    try {
      e.waitUntil(c);
    } catch {
    }
    return r ? n : null;
  }
  _isResponseDateFresh(e) {
    if (this._config.maxAgeFrom === "last-used")
      return !0;
    const s = Date.now();
    if (!this._config.maxAgeSeconds)
      return !0;
    const n = this._getDateHeaderTimestamp(e);
    return n === null ? !0 : n >= s - this._config.maxAgeSeconds * 1e3;
  }
  _getDateHeaderTimestamp(e) {
    if (!e.headers.has("date"))
      return null;
    const t = e.headers.get("date"), n = new Date(t).getTime();
    return Number.isNaN(n) ? null : n;
  }
  async cacheDidUpdate({ cacheName: e, request: t }) {
    const s = this._getCacheExpiration(e);
    await s.updateTimestamp(t.url), await s.expireEntries();
  }
  async deleteCacheAndMetadata() {
    for (const [e, t] of this._cacheExpirations)
      await self.caches.delete(e), await t.delete();
    this._cacheExpirations = /* @__PURE__ */ new Map();
  }
}
class R extends S {
  async _handle(e, t) {
    let s = await t.cacheMatch(e), n;
    if (!s)
      try {
        s = await t.fetchAndCachePut(e);
      } catch (r) {
        r instanceof Error && (n = r);
      }
    if (!s)
      throw new u("no-response", {
        url: e.url,
        error: n
      });
    return s;
  }
}
class we extends S {
  constructor(e = {}) {
    super(e), this.plugins.some((t) => "cacheWillUpdate" in t) || this.plugins.unshift(fe);
  }
  async _handle(e, t) {
    const s = t.fetchAndCachePut(e).catch(() => {
    });
    t.waitUntil(s);
    let n = await t.cacheMatch(e), r;
    if (!n) try {
      n = await s;
    } catch (i) {
      i instanceof Error && (r = i);
    }
    if (!n)
      throw new u("no-response", {
        url: e.url,
        error: r
      });
    return n;
  }
}
const Pt = 1e3, At = 60 * Pt, It = 60 * At, Ut = 24 * It, w = 29.53 * Ut;
var qt = [{ url: "index.html", revision: "b1c0dd8466bbd26f4216ca01477f455f" }, { url: "assets/sprite-EDjWs5PV.svg", revision: null }, { url: "assets/search-words.worker-D90bN5mW.js", revision: null }, { url: "assets/search-kanji.worker-DUfWeBh-.js", revision: null }, { url: "assets/reviews-C0tp5JDi.js", revision: null }, { url: "assets/kanji-components-C9A26trC.js", revision: null }, { url: "assets/kanji-BFHyEMwy.js", revision: null }, { url: "assets/kana-DFdUvK8b.js", revision: null }, { url: "assets/index-CetfrY3n.js", revision: null }, { url: "assets/index-C7_WlZ0L.css", revision: null }, { url: "assets/index-BVkQD7g-.js", revision: null }, { url: "assets/index-3SZaU-iL.js", revision: null }, { url: "assets/fsrs-D14ruAop.js", revision: null }, { url: "assets/formats-BZjAUNO7.js", revision: null }, { url: "assets/decks-gvUqHaG3.js", revision: null }, { url: "assets/decks-BkI394ym.js", revision: null }, { url: "assets/db-CmzCis4b.js", revision: null }, { url: "assets/component-picker.worker-BeQQggMa.js", revision: null }, { url: "assets/WordWritingSelect-DnSPLHUE.js", revision: null }, { url: "assets/WordWritingSelect-DFkfHvDQ.css", revision: null }, { url: "assets/WordView-Cts0QTwq.css", revision: null }, { url: "assets/WordView-B1Tm2dxB.js", revision: null }, { url: "assets/WordListItem-DZ1Oghxl.js", revision: null }, { url: "assets/WordListItem-BUea7RNk.css", revision: null }, { url: "assets/WordKanjiListItem-CqnHlfCO.js", revision: null }, { url: "assets/WordKanjiListItem-1GLGuiuv.css", revision: null }, { url: "assets/SettingsView-DbKz7gEY.css", revision: null }, { url: "assets/SettingsView-B3-Fe4JX.js", revision: null }, { url: "assets/ReviewView-egfI1_Sl.css", revision: null }, { url: "assets/ReviewView-OALjwcV6.js", revision: null }, { url: "assets/ReviewSummaryView-DiOS_ym_.css", revision: null }, { url: "assets/ReviewSummaryView-C0pXedeB.js", revision: null }, { url: "assets/RemoteSyncSyncButton.vue_vue_type_script_setup_true_lang-BelrNG0v.js", revision: null }, { url: "assets/KanjiWordList-D7GvJb65.js", revision: null }, { url: "assets/KanjiWordList-BcX4ETOk.css", revision: null }, { url: "assets/KanjiView-Bu5hlxPa.css", revision: null }, { url: "assets/KanjiView-Bt6jnini.js", revision: null }, { url: "assets/KanjiComponentView-xrYzt-UG.css", revision: null }, { url: "assets/KanjiComponentView-DCY1nsPN.js", revision: null }, { url: "assets/KanjiAsideView-Cwao1DhF.js", revision: null }, { url: "assets/KanjiAsideView-BZHUN8Mw.css", revision: null }, { url: "assets/KanaView-D3BvhIpi.js", revision: null }, { url: "assets/KanaTitle-CEk6R7Iq.js", revision: null }, { url: "assets/KanaTitle-C2FyZOz9.css", revision: null }, { url: "assets/KanaAsideView-B_4HKO67.css", revision: null }, { url: "assets/KanaAsideView-BAL6JJHl.js", revision: null }, { url: "assets/HomeView-DZgNrc3U.css", revision: null }, { url: "assets/HomeView-CGIBTWA3.js", revision: null }, { url: "assets/DictionaryView-B16bvuI-.js", revision: null }, { url: "assets/DictionaryView-Aab3_ji7.css", revision: null }, { url: "assets/DecksView-Cf71FMbI.js", revision: null }, { url: "assets/DecksView-BoslpAQC.css", revision: null }, { url: "assets/DeckBrowserView-Di9ZAIVP.js", revision: null }, { url: "assets/DeckBrowserView-CG9Uz8SM.css", revision: null }, { url: "assets/CardRetrievabilityLabel-Dfvx6Yw7.css", revision: null }, { url: "assets/CardRetrievabilityLabel-46Oryz0n.js", revision: null }, { url: "assets/CardAsideNav-dF3tCJbt.css", revision: null }, { url: "assets/CardAsideNav-HjuI0nfu.js", revision: null }, { url: "assets/AppTextArea-K1PWDzuO.css", revision: null }, { url: "assets/AppTextArea-Cv4SwLFT.js", revision: null }, { url: "assets/AppNumberInput-Ds6KzMhA.js", revision: null }, { url: "assets/AppNumberInput-B8xdfG4U.css", revision: null }, { url: "assets/AppLoading-dOxd0OoU.js", revision: null }, { url: "assets/AppCheckbox-oFNiMTmY.js", revision: null }, { url: "assets/AppCheckbox-CS53EF9k.css", revision: null }, { url: "assets/AboutView-Cm5oisJ1.css", revision: null }, { url: "assets/AboutView-C-i4zXmO.js", revision: null }, { url: "robots.txt", revision: "5e0bd1c281a62a380d7a948085bfe2d1" }, { url: "favicon.ico", revision: "06b709863a75fd56b00564cbc1402934" }, { url: "icon.svg", revision: "02854578dd73b9dd133e03d5e4a63469" }, { url: "icon-mask.png", revision: "8cf586883d47b13c93c9f309e1c38c63" }, { url: "icon-512.png", revision: "78ffd1cff89cd8e897bd8f96a7b57321" }, { url: "icon-192.png", revision: "7d2fbd7640fefbb0fbf32ec060d71762" }, { url: "apple-touch-icon.png", revision: "48fbafa0594abafee1b49d3c16fb68cf" }, { url: "manifest.json", revision: "db0264cece5aba3150e3ea9c65879b8b" }];
class E {
  #t;
  #e;
  constructor({ statuses: e = [200], headers: t }) {
    this.#t = e, t && (this.#e = new Headers(t));
  }
  async cacheWillUpdate({
    response: e
  }) {
    if (!this.#t.includes(e.status))
      return null;
    if (!this.#e)
      return e;
    for (const [t, s] of this.#e)
      if (!e.headers.get(t)?.startsWith(s))
        return null;
    return e;
  }
}
const m = new Dt({
  precacheEntries: qt,
  skipWaiting: !0,
  clientsClaim: !0,
  navigationPreload: !0
}), x = new Headers([["Content-Type", "application/json"]]), jt = new Headers([["Content-Type", "image/svg+xml"]]);
m.registerRoute(
  new h(
    ({ url: a, sameOrigin: e }) => e && a.pathname.startsWith("/data/index/") && a.pathname.endsWith(".usv"),
    new we({
      cacheName: "shodoku-data-index",
      plugins: [
        new p({
          maxAgeSeconds: w,
          maxAgeFrom: "last-used",
          maxEntries: 10
        })
      ]
    })
  )
);
m.registerRoute(
  new h(
    ({ url: a, sameOrigin: e }) => e && a.pathname.startsWith("/data/kanji-lists/") && a.pathname.endsWith(".csv"),
    new we({
      cacheName: "shodoku-data-kanji-lists",
      plugins: [
        new p({
          maxAgeSeconds: w,
          maxAgeFrom: "last-used",
          maxEntries: 100
        })
      ]
    })
  )
);
m.registerRoute(
  new h(
    ({ url: a, sameOrigin: e }) => e && a.pathname.startsWith("/data/component-v1/") && a.pathname.endsWith(".json"),
    new R({
      cacheName: "shodoku-data-components-v1",
      plugins: [
        new E({
          statuses: [0, 200],
          headers: x
        }),
        new p({
          maxAgeSeconds: 3 * w,
          maxAgeFrom: "last-used",
          maxEntries: 500
        })
      ]
    })
  )
);
m.registerRoute(
  new h(
    ({ url: a, sameOrigin: e }) => e && a.pathname.startsWith("/data/kanji-v1/") && a.pathname.endsWith(".json"),
    new R({
      cacheName: "shodoku-data-kanji-v1",
      plugins: [
        new E({
          statuses: [0, 200],
          headers: x
        }),
        new p({
          maxAgeSeconds: 3 * w,
          maxAgeFrom: "last-used",
          maxEntries: 2e3
        })
      ]
    })
  )
);
m.registerRoute(
  new h(
    ({ url: a, sameOrigin: e }) => e && a.pathname.startsWith("/data/kana-v1/") && a.pathname.endsWith(".json"),
    new R({
      cacheName: "shodoku-data-kana-v1",
      plugins: [
        new E({
          statuses: [0, 200],
          headers: x
        }),
        new p({
          maxAgeSeconds: 3 * w,
          maxAgeFrom: "last-used"
        })
      ]
    })
  )
);
m.registerRoute(
  new h(
    ({ url: a, sameOrigin: e }) => e && a.pathname.startsWith("/kanjivg/kanji/") && a.pathname.endsWith(".svg"),
    new R({
      cacheName: "shodoku-kanjivg",
      plugins: [
        new E({
          statuses: [0, 200],
          headers: jt
        }),
        new p({
          maxAgeSeconds: 3 * w,
          maxAgeFrom: "last-used",
          maxEntries: 2e3
        })
      ]
    })
  )
);
m.registerRoute(
  new h(
    ({ url: a, sameOrigin: e }) => e && a.pathname.startsWith("/data/words-v1/") && a.pathname.endsWith(".json"),
    new R({
      cacheName: "shodoku-data-words-v1",
      plugins: [
        new E({
          statuses: [0, 200],
          headers: x
        }),
        new p({
          maxAgeSeconds: 3 * w,
          maxAgeFrom: "last-used",
          maxEntries: 5e3,
          purgeOnQuotaError: !0
        })
      ]
    })
  )
);
m.registerRoute(
  new h(
    ({ url: a, sameOrigin: e }) => e && a.pathname.startsWith("/data/kanji-vocab-v1/") && a.pathname.endsWith(".json"),
    new R({
      cacheName: "shodoku-data-kanji-vocab-v1",
      plugins: [
        new E({
          statuses: [0, 200],
          headers: x
        }),
        new p({
          maxAgeSeconds: 3 * w,
          maxAgeFrom: "last-used",
          maxEntries: 500,
          purgeOnQuotaError: !0
        })
      ]
    })
  )
);
m.registerRoute(
  new h(
    ({ url: a, sameOrigin: e }) => e && a.pathname.startsWith("/data/sentences-v1/") && a.pathname.endsWith(".json"),
    new R({
      cacheName: "shodoku-data-sentences-v1",
      plugins: [
        new E({
          statuses: [0, 200],
          headers: x
        }),
        new p({
          maxAgeSeconds: 3 * w,
          maxAgeFrom: "last-used",
          maxEntries: 3e3,
          purgeOnQuotaError: !0
        })
      ]
    })
  )
);
m.registerRoute(
  new h(
    ({ url: a, sameOrigin: e }) => e && a.pathname.startsWith("/data/words-sentences-v1/") && a.pathname.endsWith(".json"),
    new R({
      cacheName: "shodoku-data-words-sentences-v1",
      plugins: [
        new E({
          statuses: [0, 200],
          headers: x
        }),
        new p({
          maxAgeSeconds: 3 * w,
          maxAgeFrom: "last-used",
          maxEntries: 1e3,
          purgeOnQuotaError: !0
        })
      ]
    })
  )
);
m.addEventListeners();
//# sourceMappingURL=sw.js.map
