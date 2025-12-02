import { watchDebounced } from "@vueuse/core";
import {
  MaybeRefOrGetter,
  onScopeDispose,
  Ref,
  ref,
  ShallowReactive,
  shallowReactive,
  toValue,
} from "vue";

import { hasKanji } from "../helpers/text.ts";
import type { KanjiSearchResult } from "../workers/search-kanji.worker.ts";
import SearchKanjiWorker from "../workers/search-kanji.worker.ts?worker";
import type { WordSearchResult } from "../workers/search-words.worker.ts";
import SearchWordsWorker from "../workers/search-words.worker.ts?worker";

const searchKanjiWorker = new SearchKanjiWorker();
const searchWordsWorker = new SearchWordsWorker();

export function useWordSearch(
  searchPhrase: MaybeRefOrGetter<string>,
): ShallowReactive<WordSearchResult[]> {
  const wordResults = shallowReactive<WordSearchResult[]>([]);

  watchDebounced(
    () => toValue(searchPhrase),
    async (phrase) => {
      wordResults.splice(0, wordResults.length);

      if (phrase.length > 0) {
        searchWordsWorker.postMessage(phrase);
      }
    },
    { debounce: 300, immediate: true },
  );

  function handleMessage(event: MessageEvent<WordSearchResult>) {
    const result = event.data;
    const needle = toValue(searchPhrase);

    if (result.phrase !== needle) {
      return;
    }

    if (result.matchShort.length < needle.length + 4) {
      // Close match, move it to the front.
      let index = 0;
      for (const other of wordResults) {
        if (other.matchShort.length > result.matchShort.length) {
          break;
        }

        index += 1;
      }

      wordResults.splice(index, 0, result);
    } else {
      wordResults.push(result);
    }
  }

  searchWordsWorker.addEventListener("message", handleMessage);

  onScopeDispose(() => {
    searchWordsWorker.removeEventListener("message", handleMessage);
  });

  return wordResults;
}

export function useKanjiSearch(
  searchPhrase: MaybeRefOrGetter<string>,
): Ref<KanjiSearchResult[]> {
  const results = ref<KanjiSearchResult[]>([]);

  watchDebounced(
    () => toValue(searchPhrase),
    async (phrase) => {
      if (phrase.length === 0 || hasKanji(phrase)) {
        results.value = [];
      } else {
        searchKanjiWorker.postMessage(phrase);
      }
    },
    { debounce: 300, immediate: true },
  );

  function handleMessage(event: MessageEvent<KanjiSearchResult[]>) {
    results.value = event.data;
  }

  searchKanjiWorker.addEventListener("message", handleMessage);

  onScopeDispose(() => {
    searchKanjiWorker.removeEventListener("message", handleMessage);
  });

  return results;
}
