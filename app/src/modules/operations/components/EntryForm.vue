<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <q-card style="min-width: 400px">
      <q-card-section>
        <div class="text-h6">{{ isEdit ? 'Editar entrada' : 'Nueva entrada' }}</div>
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

          <div class="q-mb-md">
            <div class="row q-gutter-sm items-start">
              <q-input
                v-model.number="entry.quantity"
                type="number"
                label="Cantidad"
                outlined
                dense
                class="col"
                :rules="[(val) => val > 0 || 'Debe ser mayor que 0']"
              />
              <q-btn
                v-if="entry.entryType === 'sell' && currentQuantity > 0"
                flat
                dense
                label="Vender todas"
                color="primary"
                @click="sellAll"
                class="q-mb-xs"
              />
            </div>
            <div
              v-if="entry.entryType === 'sell' && currentQuantity > 0"
              class="text-caption text-grey-7 q-mt-xs"
            >
              Unidades disponibles: {{ currentQuantity }}
            </div>
          </div>

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
            <q-btn flat type="submit" label="Guardar" color="primary" :loading="saving" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useOperationsStore } from '../OperationsStore';
import { entryTypes } from 'src/config';
import dayjs from 'dayjs';
import InputCalendar from 'src/components/InputCalendar.vue';
import { useQuasar } from 'quasar';

interface Entry {
  id?: string;
  entryType: string;
  quantity: number;
  price: number;
  tax: number;
  date: string;
}

const props = defineProps<{
  modelValue: boolean;
  operationId: string;
  editEntry?: Entry | null;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  saved: [];
}>();

const operationsStore = useOperationsStore();
const $q = useQuasar();

const saving = ref(false);

const entry = ref<Entry>({
  entryType: 'buy',
  quantity: 0,
  price: 0,
  tax: 0,
  date: dayjs().format('YYYY-MM-DD HH:mm'),
});

const isEdit = computed(() => !!props.editEntry);

// Obtener la cantidad actual de la operación
const currentQuantity = computed(() => {
  return operationsStore.currentOperation?.metrics?.currentQty ?? 0;
});

// Función para vender todas las unidades
const sellAll = () => {
  if (currentQuantity.value > 0) {
    entry.value.quantity = currentQuantity.value;
  }
};

// Cuando cambia editEntry, cargar los datos
watch(
  () => props.editEntry,
  (newEntry) => {
    if (newEntry) {
      const newValue: Entry = {
        entryType: newEntry.entryType,
        quantity: newEntry.quantity,
        price: newEntry.price,
        tax: newEntry.tax || 0,
        date: dayjs(newEntry.date).format('YYYY-MM-DD HH:mm'),
      };
      if (newEntry.id) {
        newValue.id = newEntry.id;
      }
      entry.value = newValue;
    } else {
      entry.value = {
        entryType: 'buy',
        quantity: 0,
        price: 0,
        tax: 0,
        date: dayjs().format('YYYY-MM-DD HH:mm'),
      };
    }
  },
  { immediate: true },
);

const entryTypeOptions = entryTypes.map((e) => ({
  label: e.label,
  value: e.code,
}));

const save = async () => {
  saving.value = true;

  try {
    if (isEdit.value && entry.value.id) {
      await operationsStore.updateEntry(props.operationId, entry.value.id, entry.value);
      $q.notify({
        type: 'positive',
        message: 'Entrada actualizada correctamente',
      });
    } else {
      await operationsStore.addEntry(props.operationId, entry.value);
      $q.notify({
        type: 'positive',
        message: 'Entrada añadida correctamente',
      });
    }

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
    console.error('Error saving entry:', error);
    $q.notify({
      type: 'negative',
      message: isEdit.value ? 'Error al actualizar entrada' : 'Error al añadir entrada',
    });
  } finally {
    saving.value = false;
  }
};
</script>
