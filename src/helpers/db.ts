import { liveQuery } from "dexie";
import {
  computed,
  ComputedRef,
  MaybeRef,
  onScopeDispose,
  ref,
  unref,
  watch,
} from "vue";

type LiveQueryResults<T> = {
  value: ComputedRef<T | null>;
  error: ComputedRef<unknown>;
};

export function useLiveQuery<T>(
  query: MaybeRef<() => T | Promise<T>>
): LiveQueryResults<T> {
  const valueRef = ref<T | null>(null);
  const errorRef = ref<unknown>(null);

  const subscription = computed(() => {
    const observable = liveQuery(unref(query));

    return observable.subscribe({
      next(value) {
        errorRef.value = null;
        valueRef.value = value ?? null;
      },
      error(error: unknown) {
        errorRef.value = error;
        valueRef.value = null;
      },
    });
  });

  watch(subscription, (_, oldSubscription) => {
    if (oldSubscription) {
      oldSubscription.unsubscribe();
    }
  });

  onScopeDispose(() => {
    subscription.value.unsubscribe();
  });

  return {
    error: computed(() => errorRef.value),
    value: computed(() => valueRef.value),
  };
}
