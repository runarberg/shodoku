<script setup lang="ts">
defineProps<{
  tag: string;
}>();
</script>

<template>
  <span class="pos-tag">
    <template v-if="tag === 'adj-f'"> noun or prenominal verb</template>
    <template v-else-if="tag === 'adj-i'"> i adjective</template>
    <template v-else-if="tag === 'adj-ix'"> adjective - yoi/ii class</template>
    <template v-else-if="tag === 'adj-na'"> na adjective</template>
    <template v-else-if="tag === 'adj-nari'"> formal na-adjective</template>
    <template v-else-if="tag === 'adj-no'"> noun w. の particle</template>
    <template v-else-if="tag === 'adj-pn'"> pre-noun adjectival</template>
    <template v-else-if="tag === 'adj-t'"> 'taru' adjective</template>
    <template v-else-if="tag === 'adv'"> adverb</template>
    <template v-else-if="tag === 'adv-to'"> adverb w. と particle</template>
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
    <template v-else-if="tag === 'v-unspec'"> verb</template>
    <template v-else-if="tag === 'v1'"> Ichidan verb</template>
    <template v-else-if="tag === 'v1-s'"> Ichidan verb - kureru</template>
    <template v-else-if="tag === 'v5aru'"> Godan verb - -aru</template>
    <template v-else-if="tag === 'v5b'"> Godan verb</template>
    <template v-else-if="tag === 'v5g'"> Godan verb</template>
    <template v-else-if="tag === 'v5k'"> Godan verb</template>
    <template v-else-if="tag === 'v5k-s'"> Godan verb - Iku/Yuku</template>
    <template v-else-if="tag === 'v5m'"> Godan verb</template>
    <template v-else-if="tag === 'v5n'"> Godan verb</template>
    <template v-else-if="tag === 'v5r'"> Godan verb with 'ru' ending</template>
    <template v-else-if="tag === 'v5r-i'">
      Godan verb with 'ru' ending (irregular)</template
    >
    <template v-else-if="tag === 'v5s'"> Godan verb</template>
    <template v-else-if="tag === 'v5t'"> Godan verb</template>
    <template v-else-if="tag === 'v5u'"> Godan verb</template>
    <template v-else-if="tag === 'v5u-s'">
      Godan verb with 'u' ending (special class)</template
    >
    <template v-else-if="tag === 'v5uru'">
      Godan verb - Uru old class verb</template
    >
    <template v-else-if="tag === 'vi'"> intransitive verb</template>
    <template v-else-if="tag === 'vk'"> Kuru verb</template>
    <template v-else-if="tag === 'vn'"> irregular nu verb</template>
    <template v-else-if="tag === 'vr'"> irregular ru verb</template>
    <template v-else-if="tag === 'vs'"> suru verb</template>
    <template v-else-if="tag === 'vs-c'">
      su verb—precursor to the modern suru</template
    >
    <template v-else-if="tag === 'vs-i'"> suru verb - included</template>
    <template v-else-if="tag === 'vs-s'"> suru verb - special class</template>
    <template v-else-if="tag === 'vt'"> transitive verb</template>
    <template v-else-if="tag === 'vz'"> Ichidan verb - zuru verb</template>
  </span>
</template>

<style scoped>
.pos-tag {
  color: gray;
  font-size: 0.8em;
}
</style>
