<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <q-card style="min-width: 400px">
      <q-card-section>
        <div class="text-h6">Registrar precio</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form @submit="save">
          <q-input
            v-model.number="priceData.price"
            type="number"
            label="Precio"
            outlined
            dense
            class="q-mb-md"
            suffix="€"
            :rules="[(val) => val > 0 || 'Debe ser mayor que 0']"
          />

          <input-calendar
            class="q-mb-md"
            :date="priceData.date"
            @setted="(val) => (priceData.date = val)"
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

const priceData = ref({
  price: 0,
  date: dayjs().format('YYYY-MM-DD HH:mm'),
});

const save = async () => {
  saving.value = true;

  try {
    await operationsStore.addPriceHistory(props.operationId, priceData.value);

    $q.notify({
      type: 'positive',
      message: 'Precio registrado correctamente',
    });

    // Resetear formulario
    priceData.value = {
      price: 0,
      date: dayjs().format('YYYY-MM-DD HH:mm'),
    };

    emit('update:modelValue', false);
    emit('saved');
  } catch (error) {
    console.error('Error adding price:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al registrar precio',
    });
  } finally {
    saving.value = false;
  }
};
</script>
