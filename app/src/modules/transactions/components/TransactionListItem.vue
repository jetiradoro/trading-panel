<template>
  <q-slide-item class="transaction-slide-item" @left="onSlideLeft" left-color="red-3">
    <template #left>
      <div class="slide-action bg-red-3 text-white row items-center justify-end rounded-borders">
        <q-icon name="delete" size="sm" />
      </div>
    </template>

    <q-item clickable class="transaction-item">
      <q-item-section>
        <q-item-label>{{ transaction.origin }}</q-item-label>
        <q-item-label caption>{{ transaction.date }}</q-item-label>
      </q-item-section>

      <q-item-section>
        <q-item-label class="text-left">{{ transaction.description }}</q-item-label>
      </q-item-section>

      <q-item-section side>
        <q-item-label class="amount-label">{{ transaction.amount }} €</q-item-label>
      </q-item-section>
    </q-item>
  </q-slide-item>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

type Transaction = {
  id: string;
  origin: string;
  date: string;
  description: string;
  amount: number;
  [key: string]: unknown;
};

const props = defineProps<{
  transaction: Transaction;
}>();

const emit = defineEmits<{
  delete: [transaction: Transaction];
}>();

const onSlideLeft = ({ reset }: { reset: () => void }) => {
  reset();
  emit('delete', props.transaction);
};
</script>

<style scoped>
.transaction-slide-item {
  overflow: hidden;
}

.transaction-item {
  min-height: 64px;
  display: flex;
  align-items: center;
}

.amount-label {
  min-width: 80px;
  text-align: right;
  display: inline-block;
}

.slide-action {
  width: 100%;
  height: 100%;
  padding: 0 16px;
}
</style>
