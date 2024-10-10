import { MaybeRefOrGetter, ref, Ref, toValue, watch } from "vue";

import { Sentence } from "../types";

export function useSentence(
  id: MaybeRefOrGetter<number>
): Ref<Sentence | null> {
  const sentenceInfo = ref(null);

  watch(
    () => toValue(id),
    async (value) => {
      const response = await fetch(`/data/sentences-v1/${value}.json`);
      const data = await response.json();

      sentenceInfo.value = data;
    },
    { immediate: true }
  );

  return sentenceInfo;
}
