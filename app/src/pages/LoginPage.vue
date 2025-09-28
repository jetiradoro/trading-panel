<template>
  <q-page class="row justify-between items-center">
    <div class="col-12 col-md-6 q-pa-md">
      <q-card class="q-pa-md">
        <img
          src="/images/logo_2/logo_2_only.webp"
          class="block q-mx-auto"
          style="max-width: 80px"
        />
        <q-card-section>
          <q-form
            @keydown.enter.prevent="submitForm"
            @submit="submitForm"
            ref="loginForm"
            class="row q-gutter-md column"
          >
            <q-input type="email" autocomplete="no" filled v-model="username" label="Email" />
            <q-input filled v-model="password" type="password" label="Password" />
          </q-form>
        </q-card-section>
        <q-card-actions>
          <q-btn style="width: 100%" @click="submitForm" label="Login" color="primary" />
          <div class="text-center full-width q-mt-sm">v{{ config.version }}</div>
        </q-card-actions>
      </q-card>
    </div>
    <div class="gt-sm col-12 col-md-6" style="background: #000">
      <q-img
        src="/images/logo_2/logo_2_background.webp"
        fit="contain"
        style="max-width: 100vw; max-height: 100vh"
      >
      </q-img>
    </div>
  </q-page>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { useUserStore } from 'src/stores/user';
import { useAccountStore } from 'src/stores/account';
import { useRouter } from 'vue-router';
import { config } from 'src/config';

const username = ref('');
const password = ref('');
const $q = useQuasar();
const userStore = useUserStore();
const accountStore = useAccountStore();
const router = useRouter();
const { error } = storeToRefs(userStore);

const submitForm = async () => {
  await userStore.login({ username: username.value, password: password.value });
  if (error.value) {
    $q.notify({
      type: 'negative',
      message: error.value,
      html: true,
    });
  } else {
    await accountStore.getCurrent();
    await router.push({ name: 'panel' });
  }
};
</script>
