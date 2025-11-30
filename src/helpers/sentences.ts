import { MaybeRefOrGetter, Ref, ref, toValue, watch } from "vue";

import { Sentence } from "../types.ts";

export function useSentence(
  id: MaybeRefOrGetter<number>,
): Ref<Sentence | null> {
  const sentenceInfo = ref(null);

  watch(
    () => toValue(id),
    async (value) => {
      const response = await fetch(`/data/sentences-v1/${value}.json`);
      if (
        !response.ok ||
        !response.headers.get("Content-Type")?.startsWith("application/json")
      ) {
        // eslint-disable-next-line no-console
        console.error("failed getting sentence:", id);
        return;
      }

      try {
        const data = await response.json();
        sentenceInfo.value = data;
      } catch {
        // eslint-disable-next-line no-console
        console.error("failed getting sentence:", id);
      }
    },
    { immediate: true },
  );

  return sentenceInfo;
}
