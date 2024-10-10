<script setup lang="ts">
import AppButton from "../components/AppButton.vue";
import { useLiveQuery } from "../helpers/db.ts";
import { scheduledCardCount } from "../db/cards.ts";
import { reviewRoute } from "../router";

const { value: count } = useLiveQuery(scheduledCardCount);
</script>

<template>
  <article>
    <p>{{ count?.new }} new and {{ count?.due }} due</p>
    <AppButton :to="reviewRoute">Start</AppButton>
  </article>
</template>
