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

type LiveQueryResults<T> = {
  value: ComputedRef<T | null>;
  error: ComputedRef<unknown>;
};

export function useLiveQuery<T>(
  query: MaybeRef<() => T | Promise<T>>
): LiveQueryResults<T> {
  const valueRef = ref<T | null>(null);
  const errorRef = ref<unknown>(null);

  async function runQuery() {
    const run = unref(query);
    try {
      valueRef.value = await run();
    } catch (error) {
      errorRef.value = error;
    }
  }

  liveQueryChannel.addEventListener("message", runQuery);
  watch(() => unref(query), runQuery, { immediate: true });

  onScopeDispose(() => {
    liveQueryChannel.removeEventListener("message", runQuery);
  });

  return {
    error: computed(() => errorRef.value),
    value: computed(() => valueRef.value),
  };
}
