import { MaybeRefOrGetter, Ref, ref, toValue, watch } from "vue";

import { KanjiComponentInfo } from "../types.ts";

function toHex(literal: string): string {
  if (literal.startsWith("CDP-")) {
    return literal;
  }

  const codepoint = literal.codePointAt(0) ?? 0;
  return codepoint.toString(16).padStart(5, "0");
}

export function useKanjiComponent(
  literal: MaybeRefOrGetter<string | null | undefined>,
): Ref<KanjiComponentInfo | null> {
  const kanjiComponent = ref<KanjiComponentInfo | null>(null);

  function setKanjiComponent(kanjiComponentInfo: KanjiComponentInfo) {
    kanjiComponent.value = kanjiComponentInfo;
  }

  watch(
    () => toValue(literal),
    async (value) => {
      if (!value) {
        kanjiComponent.value = null;
        return;
      }

      if (value === kanjiComponent.value?.literal) {
        return;
      }

      const hex = toHex(value);
      const response = await fetch(`/data/components-v1/${hex}.json`);
      const data = await response.json();

      setKanjiComponent(data);
    },
    { immediate: true },
  );

  return kanjiComponent;
}
