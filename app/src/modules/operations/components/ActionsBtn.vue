<template>
  <q-page-sticky position="bottom-right" :offset="[18, 18]">
    <q-btn fab icon="add" color="primary" @click="goToNew" />
  </q-page-sticky>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goToNew = () => {
  void router.push({ name: 'operations.new' });
};
</script>
