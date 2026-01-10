<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          <q-btn flat :to="{ name: 'panel' }">{{ account?.name }}</q-btn>
        </q-toolbar-title>

        <q-badge color="black" text-color="white" class="q-mr-md">
          v{{ appVersion }}
        </q-badge>

        <UserMenu />
      </q-toolbar>
      <q-toolbar class="bg-dark" v-if="section">
        <q-toolbar-title class="text-center text-body"> {{ section }} </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header></q-item-label>

        <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import EssentialLink, { type EssentialLinkProps } from 'components/EssentialLink.vue';
import UserMenu from 'src/components/UserMenu.vue';
import { useAccountStore } from 'src/stores/account';
import { useUserStore } from 'src/stores/user';
import { useAppStore } from 'src/stores/app';
import { computed } from 'vue';
import { config } from 'src/config';

const accountStore = useAccountStore();
const userStore = useUserStore();
const appStore = useAppStore();

const section = computed(() => appStore.current_section);
const appVersion = config.version;

onBeforeMount(async () => {
  const token = userStore.user?.access_token;
  if (token) {
    userStore.setAuthHeader(token);
    if (!accountStore.currentAccount) {
      await accountStore.getCurrent();
    }
  }
});

const account = computed(() => accountStore.currentAccount);

const linksList: EssentialLinkProps[] = [
  {
    title: 'Operaciones',
    icon: 'trending_up',
    route_name: 'operations',
  },
  {
    title: 'Símbolos',
    icon: 'inventory_2',
    route_name: 'symbols',
  },
  {
    title: 'Transacciones',
    icon: 'sync_alt',
    route_name: 'transactions',
  },
];

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>
