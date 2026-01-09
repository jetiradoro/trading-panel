<template>
  <q-list v-if="entries.length > 0">
    <q-item v-for="entry in sortedEntries" :key="entry.id">
      <q-item-section avatar>
        <q-avatar :color="entryTypeColor(entry.entryType)" text-color="white" size="md">
          <q-icon :name="entryTypeIcon(entry.entryType)" />
        </q-avatar>
      </q-item-section>

      <q-item-section>
        <q-item-label>{{ entryTypeLabel(entry.entryType) }}</q-item-label>
        <q-item-label caption>{{ formatDate(entry.date) }}</q-item-label>
      </q-item-section>

      <q-item-section>
        <q-item-label>{{ entry.quantity }} uds.</q-item-label>
        <q-item-label caption>@ {{ entry.price }} €</q-item-label>
      </q-item-section>

      <q-item-section side>
        <q-item-label>{{ (entry.quantity * entry.price).toFixed(2) }} €</q-item-label>
        <q-item-label v-if="entry.tax > 0" caption>Comisión: {{ entry.tax }} €</q-item-label>
      </q-item-section>

      <q-item-section side>
        <q-btn
          flat
          dense
          round
          icon="delete"
          color="negative"
          size="sm"
          @click="emit('delete', entry.id)"
        />
      </q-item-section>
    </q-item>
  </q-list>
  <div v-else class="q-pa-md text-center text-grey">No hay entradas</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { entryTypes } from 'src/config';

interface Entry {
  id: string;
  entryType: string;
  quantity: number;
  price: number;
  tax: number;
  date: string;
}

const props = defineProps<{
  entries: Entry[];
}>();

const emit = defineEmits<{
  delete: [entryId: string];
}>();

const sortedEntries = computed(() => {
  return [...props.entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
});

const entryTypeLabel = (type: string) => {
  const entry = entryTypes.find((e) => e.code === type);
  return entry?.label || type;
};

const entryTypeColor = (type: string) => {
  return type === 'buy' ? 'green' : 'red';
};

const entryTypeIcon = (type: string) => {
  return type === 'buy' ? 'add' : 'remove';
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
</script>
