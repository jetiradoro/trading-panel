<template>
  <q-page class="row items-center justify-center">
    <q-card class="q-pa-md col-12 col-sm-6 col-md-4 col-lg-3">
      <img src="/images/logo_tr.png" class="block q-mx-auto" style="max-width: 150px" />
      <q-card-section>
        <q-form @submit="submitForm" ref="loginForm" class="row q-gutter-md column">
          <q-input type="email" autocomplete="no" filled v-model="username" label="Email" />
          <q-input filled v-model="password" type="password" label="Password" />
        </q-form>
      </q-card-section>
      <q-card-actions>
        <q-btn style="width: 100%" @click="submitForm" label="Login" color="primary" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { useUserStore } from 'src/stores/user';
import { useRouter } from 'vue-router';

const username = ref('');
const password = ref('');
const $q = useQuasar();
const userStore = useUserStore();
const router = useRouter();
const { error } = storeToRefs(userStore);

const submitForm = async () => {
  await userStore.login({ email: username.value, password: password.value });
  if (error.value) {
    $q.notify({
      type: 'negative',
      message: error.value,
      html: true,
    });
  } else {
    await router.push({ name: 'panel' });
  }
};
</script>
