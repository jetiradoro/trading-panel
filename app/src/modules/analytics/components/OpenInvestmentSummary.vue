<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h6">Resumen inversion abierta</div>
        <q-btn
          icon="info"
          flat
          dense
          round
          size="sm"
          color="grey-6"
          @click="showInfo = true"
        />
      </div>

      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-sm-4">
          <kpi-card label="Invertido Trading" :value="balance.investedTrading" format="currency" />
        </div>
        <div class="col-12 col-sm-4">
          <kpi-card label="Invertido Planes ETF" :value="balance.investedEtf" format="currency" />
        </div>
        <div class="col-12 col-sm-4">
          <kpi-card label="Invertido Total" :value="balance.totalInvested" format="currency" />
        </div>
      </div>

      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-sm-4">
          <kpi-card label="P&L abierto Trading" :value="balance.openPnLTrading" format="currency" />
        </div>
        <div class="col-12 col-sm-4">
          <kpi-card label="P&L abierto Planes ETF" :value="balance.openPnLEtf" format="currency" />
        </div>
        <div class="col-12 col-sm-4">
          <kpi-card label="P&L abierto Total" :value="balance.totalOpenPnL" format="currency" />
        </div>
      </div>

      <kpi-card
        label="Valor actual abierto"
        :value="balance.totalOpenValue"
        format="currency"
        subtitle="Invertido total + P&L abierto total"
      />
    </q-card-section>

    <info-modal
      v-model="showInfo"
      title="Resumen inversion abierta"
      :content="infoContent"
    />
  </q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import KpiCard from './KpiCard.vue';
import InfoModal from './InfoModal.vue';
import type { AccountBalanceDto } from '../types';

/**
 * Resumen de inversion abierta con desglose ETF vs Trading
 */
interface Props {
  balance: AccountBalanceDto;
}

defineProps<Props>();

const showInfo = ref(false);

const infoContent = `
<p><strong>Que muestra este bloque?</strong></p>
<p>Resumen rapido de tus posiciones abiertas:</p>
<ul>
  <li><strong>Invertido</strong>: capital neto actualmente invertido (compras - ventas).</li>
  <li><strong>P&L abierto</strong>: ganancia/perdida no realizada segun el ultimo precio.</li>
  <li><strong>Valor actual abierto</strong>: Invertido total + P&L abierto total.</li>
</ul>
<p><strong>Separacion:</strong> Trading y Planes ETF se muestran por separado para evitar mezcla de resultados.</p>
`;
</script>
