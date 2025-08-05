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

export type LiveQueryResult<T> = {
  result: ComputedRef<T | null>;
  error: ComputedRef<unknown>;
  loading: ComputedRef<boolean>;
};

export function useLiveQuery<T>(
  query: MaybeRef<() => T | Promise<T>>,
): LiveQueryResult<T> {
  const loading = ref(true);
  const result = ref<T | null>(null);
  const errorRef = ref<unknown>(null);

  async function runQuery() {
    loading.value = true;
    errorRef.value = null;

    const run = unref(query);
    try {
      result.value = await run();
    } catch (error) {
      errorRef.value = error;
      result.value = null;
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
