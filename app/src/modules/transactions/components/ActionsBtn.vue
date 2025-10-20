<template>
  <q-page-sticky position="bottom-right" :offset="[18, 18]">
    <q-fab icon="add" direction="up" color="secondary" vertical-actions-align="right">
      <q-fab-action
        :to="{ name: 'transactions.new' }"
        color="primary"
        icon="add"
        label="Nueva Transacción"
      />
    </q-fab>
  </q-page-sticky>
</template>
<script setup lang="ts"></script>
