<template>
  <v-card variant="flat" class="mb-4" style="background-color: var(--primary-main);">
    <v-card-text>
      <v-row>
        <v-col cols="12" md="4">
          <v-select
            v-model="selectedArrondissement"
            :items="arrondissements"
            label="Arrondissement"
            clearable
            @update:model-value="onArrondissementChange"
          >
            <template #prepend>
              <v-icon>mdi-map-marker</v-icon>
            </template>
          </v-select>
        </v-col>
        
        <v-col cols="12" md="4">
          <v-select
            v-model="selectedType"
            :items="types"
            label="Type de lieu"
            clearable
            @update:model-value="onTypeChange"
          >
            <template #prepend>
              <v-icon>mdi-tag</v-icon>
            </template>
          </v-select>
        </v-col>
        
        <v-col cols="12" md="4" class="d-flex align-center">
          <v-btn
            color="secondary"
            variant="outlined"
            @click="clearFilters"
            :disabled="!hasActiveFilters"
            class="ml-auto"
          >
            <v-icon left>mdi-filter-remove</v-icon>
            Effacer les filtres
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { store } from './store';

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['filter-change']);

const selectedArrondissement = ref('');
const selectedType = ref('');

// Extraire les arrondissements uniques des données
const arrondissements = computed(() => {
  const uniqueArrondissements = [...new Set(props.data.map(item => item.Arrondissement).filter(Boolean))];
  return uniqueArrondissements.sort();
});

// Extraire les types uniques des données
const types = computed(() => {
  const uniqueTypes = [...new Set(props.data.map(item => item.Type).filter(Boolean))];
  return uniqueTypes.sort();
});

// Vérifier s'il y a des filtres actifs
const hasActiveFilters = computed(() => {
  return selectedArrondissement.value || selectedType.value;
});

// Émettre les changements de filtres
const emitFilters = () => {
  emit('filter-change', {
    arrondissement: selectedArrondissement.value,
    type: selectedType.value
  });
};

const onArrondissementChange = () => {
  emitFilters();
};

const onTypeChange = () => {
  emitFilters();
};

const clearFilters = () => {
  selectedArrondissement.value = '';
  selectedType.value = '';
  emitFilters();
};

// Synchroniser avec le store global
watch(() => store.arrondissement, (newValue) => {
  if (newValue === 'ALL') {
    selectedArrondissement.value = '';
  } else {
    selectedArrondissement.value = newValue;
  }
}, { immediate: true });
</script> 