import {
  computed,
  ComputedRef,
  MaybeRef,
  onScopeDispose,
  ref,
  unref,
  watch,
} from "vue";

import { liveQueryChannel } from "./channels.ts";

export type LiveQueryResult<T, Init = null> = {
  result: ComputedRef<T | Init>;
  error: ComputedRef<unknown>;
  loading: ComputedRef<boolean>;
};

export function useLiveQuery<T, Init = null>(
  query: MaybeRef<() => T | Promise<T>>,
  init: Init = null as Init,
): LiveQueryResult<T, Init> {
  const loading = ref(true);
  const result = ref<T | Init>(init);
  const errorRef = ref<unknown>(null);

  async function runQuery() {
    loading.value = true;
    errorRef.value = null;

    const run = unref(query);
    try {
      result.value = await run();
    } catch (error) {
      errorRef.value = error;
      result.value = init;
    } finally {
      loading.value = false;
    }
  }

  liveQueryChannel.addEventListener("message", runQuery);
  watch(() => unref(query), runQuery, { immediate: true });

  onScopeDispose(() => {
    liveQueryChannel.removeEventListener("message", runQuery);
  });

  return {
    error: computed(() => errorRef.value),
    result: computed(() => result.value),
    loading: computed(() => loading.value),
  };
}
