<template>
  <div class="row q-col-gutter-md">
    <div class="col-12 col-sm-4">
      <kpi-card
        label="Balance Total"
        :value="balance.totalFromTransactions"
        format="currency"
      />
    </div>

    <div class="col-12 col-sm-4">
      <kpi-card
        label="Dinero Invertido"
        :value="balance.totalInvested"
        format="currency"
      />
    </div>

    <div class="col-12 col-sm-4">
      <kpi-card
        label="Disponible"
        :value="balance.availableCash"
        format="currency"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import KpiCard from './KpiCard.vue';

/**
 * Componente que muestra las 3 tarjetas de balance de cuenta
 */
interface AccountBalance {
  totalFromTransactions: number;
  totalInvested: number;
  availableCash: number;
}

interface Props {
  balance: AccountBalance;
}

defineProps<Props>();
</script>
