<template>
  <q-input filled v-model="displayDate" mask="##/##/####" label="Fecha">
    <template #append>
      <q-icon name="event" class="cursor-pointer">
        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
          <q-date v-model="internalDate" :locale="myLocale" mask="YYYY-MM-DD">
            <div class="row items-center justify-end">
              <q-btn v-close-popup label="Cerrar" color="primary" flat />
            </div>
          </q-date>
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>
<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import dayjs from 'dayjs';

const props = defineProps<{
  date: string;
}>();

const emit = defineEmits<{ (e: 'setted', value: string): void }>();

// Fecha interna en formato YYYY-MM-DD
const internalDate = ref(props.date);

// Fecha para mostrar en el input en formato DD/MM/YYYY
const displayDate = computed({
  get() {
    if (!internalDate.value) return '';
    return dayjs(internalDate.value).format('DD/MM/YYYY HH:mm:ss');
  },
  set(value: string) {
    if (!value || value.length !== 10) return;
    const parsedDate = dayjs(value, 'DD/MM/YYYY');
    if (parsedDate.isValid()) {
      internalDate.value = parsedDate.format('YYYY-MM-DD');
    }
  },
});

const myLocale = {
  /* starting with Sunday */
  days: 'Domingo_Lunes_Martes_Miércoles_Jueves_Viernes_Sábado'.split('_'),
  daysShort: 'Dom_Lun_Mar_Mié_Jue_Vie_Sáb'.split('_'),
  months:
    'Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre'.split(
      '_',
    ),
  monthsShort: 'Ene_Feb_Mar_Abr_May_Jun_Jul_Ago_Sep_Oct_Nov_Dic'.split('_'),
  firstDayOfWeek: 1, // 0-6, 0 - Sunday, 1 Monday, ...
  format24h: true,
  pluralDay: 'dias',
};

// Emitir cuando cambie la fecha interna
watch(internalDate, (val) => {
  emit('setted', val);
});

// Actualizar cuando cambie el prop
watch(
  () => props.date,
  (val) => {
    if (val !== internalDate.value) {
      internalDate.value = val;
    }
  },
);
</script>
