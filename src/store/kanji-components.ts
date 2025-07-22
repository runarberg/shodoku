import { defineStore } from "pinia";
import {
  computed,
  ComputedRef,
  MaybeRefOrGetter,
  ref,
  shallowReactive,
  toValue,
} from "vue";

const UNIT_SEP = "\u{241f}";
const RECORD_SEP = "\u{241e}";
const GROUP_SEP = "\u{241d}";

const groupSepRE = new RegExp(`${UNIT_SEP}?${RECORD_SEP}?${GROUP_SEP}\\n?`, "u")
const recordSepRE = new RegExp(`${UNIT_SEP}?${RECORD_SEP}\\n?`, "u")
const unitSepRE = new RegExp(`${UNIT_SEP}\\n?`, "u")

function* fromUSV(usv: string): Iterable<[string, string]> {
  for (const group of usv.split(groupSepRE)) {
    const [component, values] = group.split(recordSepRE);

    yield [component, values];
  }
}

export const useKanjiComponentsStore = defineStore("kanji-components", () => {
  const syncing = ref(false);
  const error = ref<unknown>(null);
  const kanjiComponents = shallowReactive(new Map<string, string[]>());
  const usv = ref<string | null>(null);

  async function sync(): Promise<void> {
    if (syncing.value) {
      return;
    }

    syncing.value = true;
    error.value = null;

    try {
      const response = await fetch("/data/index/components-to-kanji-v1.usv");
      usv.value = await response.text();
    } catch (syncError) {
      error.value = syncError;
    } finally {
      syncing.value = false;
    }
  }

  sync();

  return {
    usv,
    kanjiComponents,
    sync,
    syncing,
  };
});

export function useKanjiComponent(
  literal: MaybeRefOrGetter<string | null>
): ComputedRef<string[]> {
  const store = useKanjiComponentsStore();

  return computed(() => {
    const literalValue = toValue(literal);

    if (!literalValue) {
      return [];
    }

    if (!store.usv) {
      return [literalValue];
    }

    let found = store.kanjiComponents.get(literalValue);

    if (!found) {
      for (const [key, values] of fromUSV(store.usv)) {
        if (key === literalValue) {
          found = values.split(unitSepRE);
          store.kanjiComponents.set(key, found);

          break;
        }
      }
    }

    return found ?? [literalValue];
  });
}
