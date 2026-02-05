<template>
  <q-page class="q-pa-md">
    <q-form @submit="save">
      <SymbolSelector
        v-model="operation.symbolId"
        v-model:product="operation.product"
        class="q-mb-md"
      />

      <q-select
        v-model="operation.type"
        :options="typeOptions"
        label="Tipo de operación"
        outlined
        dense
        emit-value
        map-options
        class="q-mb-md"
        :rules="[(val) => !!val || 'Campo requerido']"
      />

      <q-input
        v-if="isDerivative"
        v-model.number="operation.leverage"
        type="number"
        label="Apalancamiento"
        placeholder="Ej: 2"
        outlined
        dense
        class="q-mb-md"
        suffix="x"
        :rules="leverageRules"
      />

      <q-separator class="q-my-md" />

      <div class="text-h6 q-mb-md">Primera entrada</div>

      <q-select
        v-model="firstEntry.entryType"
        :options="entryTypeOptions"
        label="Tipo de entrada"
        outlined
        dense
        emit-value
        map-options
        class="q-mb-md"
        :rules="[(val) => !!val || 'Campo requerido']"
      />

      <q-input
        v-model.number="firstEntry.quantity"
        type="number"
        label="Cantidad"
        placeholder="0"
        outlined
        dense
        class="q-mb-md"
        :rules="[(val) => val > 0 || 'Debe ser mayor que 0']"
        ref="quantityInput"
      />

      <q-input
        v-model.number="firstEntry.price"
        type="number"
        label="Precio"
        placeholder="0"
        outlined
        dense
        class="q-mb-md"
        suffix="€"
        :rules="[(val) => val > 0 || 'Debe ser mayor que 0']"
      />

      <q-input
        v-model.number="firstEntry.tax"
        type="number"
        label="Comisión"
        placeholder="0"
        outlined
        dense
        class="q-mb-md"
        suffix="€"
      />

      <input-calendar
        class="q-mb-md"
        :date="firstEntry.date"
        @setted="(val) => (firstEntry.date = val)"
      />

      <div class="q-mt-md row q-gutter-sm">
        <q-btn type="submit" label="Crear operación" color="primary" :loading="loading" />
        <q-btn type="button" label="Cancelar" color="red" :to="{ name: 'operations' }" />
      </div>
    </q-form>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue';
import { useAppStore } from 'src/stores/app';
import { useOperationsStore } from '../OperationsStore';
import { useAccountStore } from 'src/stores/account';
import { operationTypes, entryTypes } from 'src/config';
import dayjs from 'dayjs';
import InputCalendar from 'src/components/InputCalendar.vue';
import SymbolSelector from '../components/SymbolSelector.vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';

const appStore = useAppStore();
const operationsStore = useOperationsStore();
const accountStore = useAccountStore();
const $q = useQuasar();
const router = useRouter();

appStore.setSection('Nueva Operación');

const loading = ref(false);
const quantityInput = ref<{ focus: () => void } | null>(null);

const operation = ref({
  symbolId: '',
  product: '',
  type: '',
  leverage: null as number | null,
});

const firstEntry = ref({
  entryType: 'buy',
  quantity: null as number | null,
  price: null as number | null,
  tax: null as number | null,
  date: dayjs().format('YYYY-MM-DD HH:mm'),
});

const typeOptions = operationTypes.map((t) => ({
  label: t.label,
  value: t.code,
}));

const entryTypeOptions = entryTypes.map((e) => ({
  label: e.label,
  value: e.code,
}));

const isDerivative = computed(() => operation.value.product === 'derivative');

const leverageRules = [
  (val: number | null) => {
    if (val === null || val === undefined || val === ('' as unknown as number)) return true;
    if (Number(val) <= 0) return 'Debe ser mayor que 0';
    const text = String(val);
    return /^[0-9]+(\.[0-9]{1,2})?$/.test(text) || 'Máximo 2 decimales';
  },
];

const currentAccountId = computed(() => accountStore.currentAccount?.id);

onMounted(async () => {
  await nextTick();
  quantityInput.value?.focus();
});

async function save() {
  if (!currentAccountId.value) {
    $q.notify({
      type: 'negative',
      message: 'No hay cuenta seleccionada',
    });
    return;
  }

  if (!operation.value.symbolId) {
    $q.notify({
      type: 'negative',
      message: 'Debe seleccionar un símbolo',
    });
    return;
  }

  loading.value = true;

  try {
    const payload = {
      ...firstEntry.value,
      quantity: firstEntry.value.quantity ?? 0,
      price: firstEntry.value.price ?? 0,
      tax: firstEntry.value.tax ?? 0,
    };

    const requestPayload = {
      accountId: currentAccountId.value,
      symbolId: operation.value.symbolId,
      product: operation.value.product,
      type: operation.value.type,
      firstEntry: payload,
    } as {
      accountId: string;
      symbolId: string;
      product: string;
      type: string;
      firstEntry: typeof payload;
      leverage?: number | null;
    };

    if (isDerivative.value) {
      requestPayload.leverage = operation.value.leverage ?? null;
    }

    await operationsStore.createOperation(requestPayload);

    $q.notify({
      type: 'positive',
      message: 'Operación creada correctamente',
    });

    await router.push({ name: 'operations' });
  } catch (error) {
    console.error('Error creating operation:', error);
    $q.notify({
      type: 'negative',
      message: operationsStore.error || 'Error al crear operación',
    });
  } finally {
    loading.value = false;
  }
}
</script>
