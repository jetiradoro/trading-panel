<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">{{ props.editPrice ? 'Editar precio' : 'Agregar precio' }}</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form @submit="savePrice">
          <q-input
            v-model.number="priceForm.price"
            type="number"
            step="0.01"
            label="Precio"
            outlined
            dense
            :rules="[
              (val) => val !== null && val !== '' || 'Campo requerido',
              (val) => val > 0 || 'El precio debe ser mayor a 0'
            ]"
            class="q-mb-md"
          />

          <q-input
            v-model="priceForm.date"
            type="datetime-local"
            label="Fecha"
            outlined
            dense
            :rules="[(val) => !!val || 'Campo requerido']"
            class="q-mb-md"
          />

          <div class="row q-gutter-sm justify-end">
            <q-btn label="Cancelar" color="grey" flat @click="closeForm" />
            <q-btn label="Guardar" type="submit" color="primary" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useSymbolsStore } from '../SymbolsStore';
import { useQuasar } from 'quasar';

interface Props {
  modelValue: boolean;
  symbolId: string;
  editPrice?: any;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'saved'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const symbolsStore = useSymbolsStore();
const $q = useQuasar();

const isOpen = ref(props.modelValue);
const priceForm = ref({
  price: 0,
  date: '',
});

/**
 * Sincronizar estado del dialog con v-model
 */
watch(() => props.modelValue, (value) => {
  isOpen.value = value;
  if (value && props.editPrice) {
    // Si estamos editando, cargar datos del precio
    const date = new Date(props.editPrice.date);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    priceForm.value = {
      price: props.editPrice.price,
      date: localDate.toISOString().slice(0, 16),
    };
  } else if (value) {
    // Si es nuevo, inicializar con fecha actual
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const localDate = new Date(now.getTime() - offset * 60 * 1000);
    priceForm.value = {
      price: 0,
      date: localDate.toISOString().slice(0, 16),
    };
  }
});

watch(isOpen, (value) => {
  emit('update:modelValue', value);
});

/**
 * Cerrar formulario
 */
const closeForm = () => {
  isOpen.value = false;
  priceForm.value = {
    price: 0,
    date: '',
  };
};

/**
 * Guardar precio (crear o actualizar)
 */
const savePrice = async () => {
  try {
    const payload = {
      price: priceForm.value.price,
      date: new Date(priceForm.value.date).toISOString(),
    };

    if (props.editPrice) {
      await symbolsStore.updatePriceHistory(
        props.symbolId,
        props.editPrice.id,
        payload
      );
      $q.notify({
        type: 'positive',
        message: 'Precio actualizado correctamente',
      });
    } else {
      await symbolsStore.addPriceHistory(props.symbolId, payload);
      $q.notify({
        type: 'positive',
        message: 'Precio agregado correctamente',
      });
    }

    closeForm();
    emit('saved');
  } catch (error) {
    console.error('Error saving price:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al guardar precio',
    });
  }
};
</script>
