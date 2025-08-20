<template>
  <div>
    <q-btn icon="person" flat :label="user?.name">
      <q-menu>
        <q-list style="min-width: 150px">
          <!-- <q-item clickable v-close-popup>
            <q-item-section> Perfil </q-item-section>
          </q-item>
          <q-item clickable v-close-popup>
            <q-item-section> Configuración </q-item-section>
          </q-item>
          <q-separator /> -->
          <q-item clickable :to="{ name: 'logout' }" v-close-popup>
            <q-item-section> Cerrar sesión </q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-btn>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from 'src/stores/user';

const store = useUserStore();
const user = store.userData;
</script>
