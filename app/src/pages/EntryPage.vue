<template>
  <q-layout view="">
    <q-page-container class="full-width full-height">
      <q-page
        style="background: #05050e"
        class="row items-center justify-center full-height full-width"
      >
        <q-img
          src="/images/entry_logo.png"
          fit="contain"
          class="full-width full-height"
          style="max-width: 100vw; max-height: 100vh"
        />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';

const router = useRouter();
onMounted(() => {
  setTimeout(() => {
    void router.push({ name: 'login' });
  }, 3000);
});
</script>
