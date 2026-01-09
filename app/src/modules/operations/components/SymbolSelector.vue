<template>
  <div>
    <div class="row q-gutter-md q-mb-md">
      <q-select
        :model-value="product"
        :options="productOptions"
        label="Tipo de producto"
        outlined
        dense
        emit-value
        map-options
        class="col"
        :rules="[(val) => !!val || 'Campo requerido']"
        @update:model-value="handleProductChange"
      />

      <q-select
        :model-value="modelValue"
        :options="filteredSymbols"
        label="Símbolo"
        outlined
        dense
        use-input
        input-debounce="300"
        option-value="id"
        option-label="code"
        emit-value
        map-options
        class="col"
        :rules="[(val) => !!val || 'Campo requerido']"
        @filter="filterSymbols"
        @update:model-value="handleSymbolChange"
      >
        <template #no-option>
          <q-item>
            <q-item-section class="text-grey">No hay resultados</q-item-section>
          </q-item>
        </template>

        <template #option="scope">
          <q-item v-bind="scope.itemProps">
            <q-item-section>
              <q-item-label>{{ scope.opt.code }}</q-item-label>
              <q-item-label caption>{{ scope.opt.name }}</q-item-label>
            </q-item-section>
          </q-item>
        </template>

        <template #after>
          <q-btn
            flat
            round
            dense
            icon="add"
            color="primary"
            @click="showCreateSymbolDialog = true"
          >
            <q-tooltip>Crear nuevo símbolo</q-tooltip>
          </q-btn>
        </template>
      </q-select>
    </div>

    <!-- Dialog para crear símbolo -->
    <q-dialog v-model="showCreateSymbolDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Crear nuevo símbolo</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="newSymbol.code"
            label="Código"
            outlined
            dense
            class="q-mb-md"
            autofocus
          />

          <q-input
            v-model="newSymbol.name"
            label="Nombre"
            outlined
            dense
            class="q-mb-md"
          />

          <q-input v-model="newSymbol.logo" label="Logo URL (opcional)" outlined dense />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn
            flat
            label="Crear"
            color="primary"
            :loading="creatingSymbol"
            @click="createSymbol"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useSymbolsStore } from 'src/modules/symbols/SymbolsStore';
import { products } from 'src/config';
import { useQuasar } from 'quasar';

const props = defineProps<{
  modelValue: string;
  product: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'update:product': [value: string];
}>();

const symbolsStore = useSymbolsStore();
const $q = useQuasar();

const showCreateSymbolDialog = ref(false);
const creatingSymbol = ref(false);
const filteredSymbols = ref<any[]>([]);

const newSymbol = ref({
  code: '',
  name: '',
  logo: '',
});

onMounted(async () => {
  await symbolsStore.fetchSymbols();
  filteredSymbols.value = symbolsStore.symbols;
});

const productOptions = products.map((p) => ({
  label: p.label,
  value: p.code,
}));

const availableSymbols = computed(() => {
  if (!props.product) return symbolsStore.symbols;
  return symbolsStore.symbols.filter((s) => s.product === props.product);
});

const handleProductChange = (value: string) => {
  emit('update:product', value);
  emit('update:modelValue', '');
  filteredSymbols.value = symbolsStore.symbols.filter((s) => s.product === value);
};

const handleSymbolChange = (value: string) => {
  emit('update:modelValue', value);
};

const filterSymbols = (val: string, update: (callback: () => void) => void) => {
  update(() => {
    const needle = val.toLowerCase();
    filteredSymbols.value = availableSymbols.value.filter(
      (s) => s.code.toLowerCase().includes(needle) || s.name.toLowerCase().includes(needle)
    );
  });
};

const createSymbol = async () => {
  if (!newSymbol.value.code || !newSymbol.value.name) {
    $q.notify({
      type: 'negative',
      message: 'Código y nombre son requeridos',
    });
    return;
  }

  if (!props.product) {
    $q.notify({
      type: 'negative',
      message: 'Debe seleccionar un tipo de producto primero',
    });
    return;
  }

  creatingSymbol.value = true;

  try {
    const payload: any = {
      code: newSymbol.value.code,
      name: newSymbol.value.name,
      product: props.product,
    };

    if (newSymbol.value.logo) {
      payload.logo = newSymbol.value.logo;
    }

    const created = await symbolsStore.createSymbol(payload);

    $q.notify({
      type: 'positive',
      message: 'Símbolo creado correctamente',
    });

    // Seleccionar el símbolo recién creado
    emit('update:modelValue', created.id);

    // Resetear formulario
    newSymbol.value = { code: '', name: '', logo: '' };
    showCreateSymbolDialog.value = false;

    // Actualizar lista filtrada
    filteredSymbols.value = availableSymbols.value;
  } catch (error) {
    console.error('Error creating symbol:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al crear símbolo',
    });
  } finally {
    creatingSymbol.value = false;
  }
};
</script>
