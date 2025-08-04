import { MaybeRefOrGetter, ref, Ref, toValue, watch } from "vue";
import { KanjiComponentInfo } from "../types";

export function useKanjiComponent(
  literal: MaybeRefOrGetter<string | null | undefined>
): Ref<KanjiComponentInfo | null> {
  const kanjComponent = ref<KanjiComponentInfo | null>(null);

  watch(
    () => toValue(literal),
    async (value) => {
      if (!value) {
        kanjComponent.value = null;
        return;
      }

      if (value === kanjComponent.value?.literal) {
        return;
      }

      const hex = value.codePointAt(0)?.toString(16).padStart(5, "0");
      const response = await fetch(`/data/components-v1/${hex}.json`);
      const data = await response.json();

      kanjComponent.value = data;
    },
    { immediate: true }
  );

  return kanjComponent;
}
