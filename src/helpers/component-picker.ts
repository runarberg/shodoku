import { onScopeDispose, reactive, ref, toRaw, watch } from "vue";

import { type ComponentPickerMessage } from "../workers/component-picker.worker.ts";
import ComponentPickerWorker from "../workers/component-picker.worker.ts?worker";

const kanjiPickerWorker = new ComponentPickerWorker();

export function useComponentPicker() {
  const allRadicals = ref(new Map<number, string[]>());
  const filteredRadicals = ref(new Set<string>());
  const kanjiSelection = ref(new Map<number, string[]>());

  const selectedRadicals = reactive(new Set<string>());

  function handleMessage(event: MessageEvent<ComponentPickerMessage>) {
    if (event.data.type === "all-radicals") {
      allRadicals.value = event.data.allRadicals;
    } else if (event.data.type === "kanji-selection") {
      kanjiSelection.value = event.data.kanjiSelection;
      filteredRadicals.value = event.data.filteredRadicals;
    }
  }

  kanjiPickerWorker.addEventListener("message", handleMessage);
  kanjiPickerWorker.postMessage("init");

  onScopeDispose(() => {
    kanjiPickerWorker.removeEventListener("message", handleMessage);
  });

  watch(selectedRadicals, () => {
    if (selectedRadicals.size === 0) {
      filteredRadicals.value = new Set();
      kanjiSelection.value = new Map();

      return;
    }

    kanjiPickerWorker.postMessage(toRaw(selectedRadicals));
  });

  return {
    allRadicals,
    filteredRadicals,
    selectedRadicals,
    kanjiSelection,
  };
}
