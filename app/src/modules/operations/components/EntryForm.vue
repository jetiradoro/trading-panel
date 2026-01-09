<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <q-card style="min-width: 400px">
      <q-card-section>
        <div class="text-h6">Nueva entrada</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form @submit="save">
          <q-select
            v-model="entry.entryType"
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
            v-model.number="entry.quantity"
            type="number"
            label="Cantidad"
            outlined
            dense
            class="q-mb-md"
            :rules="[(val) => val > 0 || 'Debe ser mayor que 0']"
          />

          <q-input
            v-model.number="entry.price"
            type="number"
            label="Precio"
            outlined
            dense
            class="q-mb-md"
            suffix="€"
            :rules="[(val) => val > 0 || 'Debe ser mayor que 0']"
          />

          <q-input
            v-model.number="entry.tax"
            type="number"
            label="Comisión"
            outlined
            dense
            class="q-mb-md"
            suffix="€"
          />

          <input-calendar
            class="q-mb-md"
            :date="entry.date"
            @setted="(val) => (entry.date = val)"
          />

          <div class="row q-gutter-sm justify-end">
            <q-btn flat label="Cancelar" color="grey" v-close-popup />
            <q-btn
              flat
              type="submit"
              label="Guardar"
              color="primary"
              :loading="saving"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useOperationsStore } from '../OperationsStore';
import { entryTypes } from 'src/config';
import dayjs from 'dayjs';
import InputCalendar from 'src/components/InputCalendar.vue';
import { useQuasar } from 'quasar';

const props = defineProps<{
  modelValue: boolean;
  operationId: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  saved: [];
}>();

const operationsStore = useOperationsStore();
const $q = useQuasar();

const saving = ref(false);

const entry = ref({
  entryType: 'buy',
  quantity: 0,
  price: 0,
  tax: 0,
  date: dayjs().format('YYYY-MM-DD HH:mm'),
});

const entryTypeOptions = entryTypes.map((e) => ({
  label: e.label,
  value: e.code,
}));

const save = async () => {
  saving.value = true;

  try {
    await operationsStore.addEntry(props.operationId, entry.value);

    $q.notify({
      type: 'positive',
      message: 'Entrada añadida correctamente',
    });

    // Resetear formulario
    entry.value = {
      entryType: 'buy',
      quantity: 0,
      price: 0,
      tax: 0,
      date: dayjs().format('YYYY-MM-DD HH:mm'),
    };

    emit('update:modelValue', false);
    emit('saved');
  } catch (error) {
    console.error('Error adding entry:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al añadir entrada',
    });
  } finally {
    saving.value = false;
  }
};
</script>
