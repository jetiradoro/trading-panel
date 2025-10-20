<template>
  <q-page class="q-pa-md">
    <q-form @submit="save">
      <q-toggle
        v-model="type"
        false-value="Gasto"
        true-value="Ingreso"
        color="green"
        :label="type"
        class="q-mb-md"
      />
      <q-select
        class="q-mb-sm"
        v-model="transaction.origin"
        :options="origins"
        label="Origen"
        filled
      />
      <q-input
        class="q-mb-sm"
        type="number"
        v-model="transaction.amount"
        :dense="false"
        label="Cantidad"
      />
      <q-input
        class="q-mb-md"
        type="text"
        v-model="transaction.description"
        :dense="false"
        label="Descripción"
      />
      <input-calendar
        class="q-mb-sm"
        :date="transaction.date"
        @setted="(val) => (transaction.date = val)"
      />
      <div class="q-mt-md row q-gutter-sm">
        <q-btn class="q-mt-md" type="submit" label="Guardar" color="primary" />
        <q-btn
          class="q-mt-md"
          type="button"
          label="Cancelar"
          color="red"
          :to="{ name: 'transactions' }"
        />
      </div>
    </q-form>
  </q-page>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { useAppStore } from 'src/stores/app';
import { useTransactionsStore } from '../TransactionsStore';
import dayjs from 'dayjs';
import InputCalendar from 'src/components/InputCalendar.vue';
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';

const origins = ['Transferencia', 'Tarjeta', 'Otros'];
const type = ref('Ingreso');
const $q = useQuasar();
const router = useRouter();

const transaction = ref({
  origin: 'Transferencia',
  amount: 0,
  date: dayjs().format('YYYY-MM-DD HH:mm'),
  description: '',
});

const appStore = useAppStore();

appStore.setSection('Nueva Transacción');

async function save() {
  const transactionsStore = useTransactionsStore();
  const { error } = storeToRefs(transactionsStore);

  if (type.value === 'Gasto') {
    transaction.value.amount = -Math.abs(transaction.value.amount);
  } else {
    transaction.value.amount = Math.abs(transaction.value.amount);
  }

  await transactionsStore.saveTransaction(transaction.value);
  if (error.value) {
    $q.notify({
      type: 'negative',
      message: error.value,
      html: true,
    });
  } else {
    $q.notify({
      type: 'positive',
      message: 'Transaction creada correctamente',
    });
    await router.push({ name: 'transactions' });
  }
}
</script>
