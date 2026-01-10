<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">{{ isEdit ? 'Editar símbolo' : 'Nuevo símbolo' }}</div>

    <q-form @submit="save">
      <q-input
        v-model="symbol.code"
        label="Código"
        outlined
        dense
        class="q-mb-md"
        :rules="[(val) => !!val || 'Campo requerido']"
      />

      <q-input
        v-model="symbol.name"
        label="Nombre"
        outlined
        dense
        class="q-mb-md"
        :rules="[(val) => !!val || 'Campo requerido']"
      />

      <q-input
        v-model="symbol.logo"
        label="Logo URL (opcional)"
        outlined
        dense
        class="q-mb-md"
      />

      <q-select
        v-model="symbol.product"
        :options="productOptions"
        label="Tipo de producto"
        outlined
        dense
        emit-value
        map-options
        class="q-mb-md"
        :rules="[(val) => !!val || 'Campo requerido']"
      />

      <div class="q-mt-md row q-gutter-sm">
        <q-btn
          type="submit"
          :label="isEdit ? 'Actualizar' : 'Crear'"
          color="primary"
          :loading="saving"
        />
        <q-btn type="button" label="Cancelar" color="red" :to="returnRoute" />
      </div>
    </q-form>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAppStore } from 'src/stores/app';
import { useSymbolsStore } from '../SymbolsStore';
import { products } from 'src/config';
import { useQuasar } from 'quasar';

const appStore = useAppStore();
const symbolsStore = useSymbolsStore();
const route = useRoute();
const router = useRouter();
const $q = useQuasar();

const symbolId = computed(() => route.params.id as string | undefined);
const isEdit = computed(() => !!symbolId.value);

const returnRoute = computed(() => {
  if (isEdit.value && symbolId.value) {
    return { name: 'symbols.detail', params: { id: symbolId.value } };
  }
  return { name: 'symbols' };
});

appStore.setSection(isEdit.value ? 'Editar Símbolo' : 'Nuevo Símbolo');

const saving = ref(false);

const symbol = ref({
  code: '',
  name: '',
  logo: '',
  product: '',
});

const productOptions = products.map((p) => ({
  label: p.label,
  value: p.code,
}));

onMounted(async () => {
  if (isEdit.value && symbolId.value) {
    try {
      const existingSymbol = await symbolsStore.fetchSymbol(symbolId.value);
      if (existingSymbol) {
        symbol.value = {
          code: existingSymbol.code,
          name: existingSymbol.name,
          logo: existingSymbol.logo || '',
          product: existingSymbol.product,
        };
      } else {
        $q.notify({
          type: 'negative',
          message: 'Símbolo no encontrado',
        });
        await router.push({ name: 'symbols' });
      }
    } catch (error) {
      console.error('Error loading symbol:', error);
      $q.notify({
        type: 'negative',
        message: 'Error al cargar símbolo',
      });
      await router.push({ name: 'symbols' });
    }
  }
});

async function save() {
  saving.value = true;

  try {
    const payload: any = {
      code: symbol.value.code,
      name: symbol.value.name,
      product: symbol.value.product,
    };

    if (symbol.value.logo) {
      payload.logo = symbol.value.logo;
    }

    if (isEdit.value && symbolId.value) {
      await symbolsStore.updateSymbol(symbolId.value, payload);
      $q.notify({
        type: 'positive',
        message: 'Símbolo actualizado correctamente',
      });
    } else {
      await symbolsStore.createSymbol(payload);
      $q.notify({
        type: 'positive',
        message: 'Símbolo creado correctamente',
      });
    }

    await router.push(returnRoute.value);
  } catch (error) {
    console.error('Error saving symbol:', error);
    $q.notify({
      type: 'negative',
      message: symbolsStore.error || 'Error al guardar símbolo',
    });
  } finally {
    saving.value = false;
  }
}
</script>
