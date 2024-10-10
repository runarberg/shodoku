import { fsrs, generatorParameters } from "ts-fsrs";
import { computed } from "vue";

export function useFsrs() {
  return computed(() => {
    const params = generatorParameters();

    return fsrs(params);
  });
}
