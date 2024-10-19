<script setup lang="ts">
defineProps<{
  tag: string;
}>();
</script>

<template>
  <span class="pos-tag">
    <template v-if="tag === 'adj-f'"> noun or prenominal verb</template>
    <template v-else-if="tag === 'adj-i'">
      <i lang="ja-Latn">i</i> adjective</template
    >
    <template v-else-if="tag === 'adj-ix'">
      adjective – <i lang="ja-Latn">yoi</i>/<i lang="ja-Latn">ii</i>
      class</template
    >
    <template v-else-if="tag === 'adj-na'"> na adjective</template>
    <template v-else-if="tag === 'adj-nari'">
      formal <i lang="ja-Latn">na</i>-adjective</template
    >
    <template v-else-if="tag === 'adj-no'">
      noun w. <i>no</i> particle</template
    >
    <template v-else-if="tag === 'adj-pn'"> pre-noun adjectival</template>
    <template v-else-if="tag === 'adj-t'">
      <i lang="ja-Latn">taru</i> adjective</template
    >
    <template v-else-if="tag === 'adv'"> adverb</template>
    <template v-else-if="tag === 'adv-to'">
      adverb w. <i lang="ja-Latn">to</i> particle</template
    >
    <template v-else-if="tag === 'aux'"> auxiliary</template>
    <template v-else-if="tag === 'aux-adj'"> auxiliary adjective</template>
    <template v-else-if="tag === 'aux-v'"> auxiliary verb</template>
    <template v-else-if="tag === 'conj'"> conjunction</template>
    <template v-else-if="tag === 'cop'"> copula</template>
    <template v-else-if="tag === 'ctr'"> counter</template>
    <template v-else-if="tag === 'exp'"> expressions</template>
    <template v-else-if="tag === 'int'"> interjection</template>
    <template v-else-if="tag === 'n'"> noun</template>
    <template v-else-if="tag === 'n-adv'"> adverbial noun</template>
    <template v-else-if="tag === 'n-pr'"> proper noun</template>
    <template v-else-if="tag === 'n-pref'"> noun, used as a prefix</template>
    <template v-else-if="tag === 'n-suf'"> noun, used as a suffix</template>
    <template v-else-if="tag === 'n-t'"> noun (temporal)</template>
    <template v-else-if="tag === 'num'"> numeric</template>
    <template v-else-if="tag === 'pn'"> pronoun</template>
    <template v-else-if="tag === 'pref'"> prefix</template>
    <template v-else-if="tag === 'prt'"> particle</template>
    <template v-else-if="tag === 'suf'"> suffix</template>
    <template v-else-if="tag === 'uk'"> Usually written with kana</template>
    <template v-else-if="tag === 'v-unspec'"> verb</template>
    <template v-else-if="tag === 'v1'"> Ichidan verb</template>
    <template v-else-if="tag === 'v1-s'">
      Ichidan verb – <i lang="ja-Latn">kureru</i></template
    >
    <template v-else-if="tag === 'v5aru'">
      Godan verb – <i lang="ja-Latn">-aru</i></template
    >
    <template v-else-if="tag === 'v5b'"> Godan verb</template>
    <template v-else-if="tag === 'v5g'"> Godan verb</template>
    <template v-else-if="tag === 'v5k'"> Godan verb</template>
    <template v-else-if="tag === 'v5k-s'">
      Godan verb – <i lang="ja-Latn">iku</i>/<i lang="ja-Latn"
        >yuku</i
      ></template
    >
    <template v-else-if="tag === 'v5m'"> Godan verb</template>
    <template v-else-if="tag === 'v5n'"> Godan verb</template>
    <template v-else-if="tag === 'v5r'">
      Godan verb with <i lang="ja-Latn">ru</i> ending</template
    >
    <template v-else-if="tag === 'v5r-i'">
      Godan verb with <i lang="ja-Latn">ru</i> ending (irregular)</template
    >
    <template v-else-if="tag === 'v5s'"> Godan verb</template>
    <template v-else-if="tag === 'v5t'"> Godan verb</template>
    <template v-else-if="tag === 'v5u'"> Godan verb</template>
    <template v-else-if="tag === 'v5u-s'">
      Godan verb with <i lang="ja-Latn">u</i> ending (special class)</template
    >
    <template v-else-if="tag === 'v5uru'">
      Godan verb – <i lang="ja-Latn">Uru</i> old class verb</template
    >
    <template v-else-if="tag === 'vi'"> intransitive verb</template>
    <template v-else-if="tag === 'vk'">
      <i lang="ja-Latn">Kuru</i> verb</template
    >
    <template v-else-if="tag === 'vn'">
      irregular <i lang="ja-Latn">nu</i> verb</template
    >
    <template v-else-if="tag === 'vr'">
      irregular <i lang="ja-Latn">ru</i> verb</template
    >
    <template v-else-if="tag === 'vs'">
      <i lang="ja-Latn">suru</i> verb</template
    >
    <template v-else-if="tag === 'vs-c'">
      <i lang="ja-Latn">su</i> verb—precursor to the modern
      <i lang="ja-Latn">suru</i></template
    >
    <template v-else-if="tag === 'vs-i'">
      <i lang="ja-Latn">suru</i> verb – included</template
    >
    <template v-else-if="tag === 'vs-s'">
      <i lang="ja-Latn">suru</i> verb – special class</template
    >
    <template v-else-if="tag === 'vt'"> transitive verb</template>
    <template v-else-if="tag === 'vz'">
      Ichidan verb – <i lang="ja-Latn">zuru</i> verb</template
    >
  </span>
</template>

<style scoped>
.pos-tag {
  color: var(--medium-gray);
  font-size: 0.8em;
}
</style>
