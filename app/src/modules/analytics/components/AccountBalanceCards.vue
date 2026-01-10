<template>
  <div class="row q-col-gutter-md">
    <div class="col-12 col-sm-4">
      <kpi-card
        label="Balance Total"
        :value="balance.totalFromTransactions"
        format="currency"
        info-title="Balance Total"
        info-content="<p><strong>¿Qué muestra?</strong></p><p>El total de dinero que has depositado menos los retiros que has realizado.</p><p><strong>Fórmula:</strong> Depósitos - Retiros</p><p>Este valor representa el capital base que tienes disponible en tu cuenta, antes de considerar inversiones activas.</p>"
      />
    </div>

    <div class="col-12 col-sm-4">
      <kpi-card
        label="Dinero Invertido"
        :value="balance.totalInvested"
        format="currency"
        info-title="Dinero Invertido"
        info-content="<p><strong>¿Qué muestra?</strong></p><p>El dinero que actualmente tienes invertido en operaciones abiertas.</p><p><strong>Cálculo:</strong> Para cada operación abierta, suma (Compras - Ventas) × Precio.</p><p>Este es el capital que está 'trabajando' en el mercado en este momento.</p>"
      />
    </div>

    <div class="col-12 col-sm-4">
      <kpi-card
        label="Disponible"
        :value="balance.availableCash"
        format="currency"
        info-title="Efectivo Disponible"
        info-content="<p><strong>¿Qué muestra?</strong></p><p>El dinero que tienes libre para realizar nuevas inversiones.</p><p><strong>Fórmula:</strong> Balance Total - Dinero Invertido</p><p>Si este valor es negativo, significa que has invertido más de lo que has depositado (posiblemente usando ganancias previas).</p>"
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
