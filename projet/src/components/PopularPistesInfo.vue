<template>
  <v-card v-if="showPopularPistes && dateFrom && dateTo" class="mt-4" elevation="0">
    <v-card-title class="pb-2">
      <h3>Pistes populaires :</h3>
    </v-card-title>
    <v-card-text class="pa-0 pl-4">
      <div class="mb-3">
        <p><strong>Période :</strong> {{ dateFrom }} à {{ dateTo }}</p>
        <p><strong>Nombre de pistes :</strong> {{ nombrePistes }}</p>
        <p><strong>Longueur totale :</strong> {{ longueurTotaleKm.toFixed(2) }} km</p>
        <p class="info-text">
          <v-icon size="small" color="info">mdi-information</v-icon>
          Affichage des pistes cyclables des 3 arrondissements les plus populaires
        </p>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import { store } from './store';

export default {
  name: 'PopularPistesInfo',
  props: {
    nombrePistes: {
      type: Number,
      default: 0
    },
    longueurTotaleKm: {
      type: Number,
      default: 0
    }
  },
  computed: {
    showPopularPistes() {
      return store.showPopularPistes;
    },
    dateFrom() {
      return store.dateFrom;
    },
    dateTo() {
      return store.dateTo;
    }
  }
}
</script>

<style scoped>
.info-text {
  font-size: 0.875rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
}
</style> 