<script setup>
import { ref, watch, nextTick } from 'vue';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update:modelValue', 'filter']);

const filters = ref({
  statut: '',
  arrondissement: '',
  implantation: ''
});

// Écouter les changements des filtres
watch(filters, (newFilters) => {
  emit('filter', { ...newFilters });
}, { deep: true });

// Écouter les changements du modelValue
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    filters.value = { ...newValue };
  }
}, { deep: true, immediate: true });

const clearFilters = () => {
  filters.value = {
    statut: '',
    arrondissement: '',
    implantation: ''
  };
  
  // Émettre immédiatement lors de l'effacement
  nextTick(() => {
    emit('update:modelValue', { ...filters.value });
    emit('filter', { ...filters.value });
  });
};
</script>

<template>
  <v-card variant="outlined" class="mb-4 pa-4">
    <v-card-title class="text-h6 mb-4">
      Filtres avancés
      <v-btn
        variant="text"
        size="small"
        @click="clearFilters"
        class="ml-auto"
      >
        Effacer les filtres
      </v-btn>
    </v-card-title>
    
    <v-row>
      <v-col cols="12" md="4">
        <v-select
          v-model="filters.statut"
          :items="['Actif', 'Inactif', 'En maintenance', 'À supprimer']"
          label="Statut"
          clearable
          variant="outlined"
          density="comfortable"
        ></v-select>
      </v-col>
      
      <v-col cols="12" md="4">
        <v-select
          v-model="filters.arrondissement"
          :items="[
            { title: 'Tous les arrondissements', value: '' },
            { title: 'Ahuntsic-Cartierville', value: 'Ahuntsic-Cartierville' },
            { title: 'Côte-des-Neiges-Notre-Dame-de-Grâce', value: 'Côte-des-Neiges-Notre-Dame-de-Grâce' },
            { title: 'L\'Île-Bizard-Sainte-Geneviève', value: 'L\'Île-Bizard-Sainte-Geneviève' },
            { title: 'Le Sud-Ouest', value: 'Le Sud-Ouest' },
            { title: 'Mercier-Hochelaga-Maisonneuve', value: 'Mercier-Hochelaga-Maisonneuve' },
            { title: 'Outremont', value: 'Outremont' },
            { title: 'Plateau-Mont-Royal', value: 'Plateau-Mont-Royal' },
            { title: 'Pointe-Claire', value: 'Pointe-Claire' },
            { title: 'Rivière-des-Prairies-Pointe-aux-Trembles', value: 'Rivière-des-Prairies-Pointe-aux-Trembles' },
            { title: 'Rosemont-La Petite-Patrie', value: 'Rosemont-La Petite-Patrie' },
            { title: 'Saint-Laurent', value: 'Saint-Laurent' },
            { title: 'Verdun', value: 'Verdun' },
            { title: 'Ville-Marie', value: 'Ville-Marie' },
            { title: 'Villeray-Saint-Michel-Parc-Extension', value: 'Villeray-Saint-Michel-Parc-Extension' },
            { title: 'Westmount', value: 'Westmount' }
          ]"
          label="Arrondissement"
          clearable
          variant="outlined"
          density="comfortable"
        ></v-select>
      </v-col>
      
      <v-col cols="12" md="4">
        <v-text-field
          v-model="filters.implantation"
          label="Année d'implantation minimum"
          type="number"
          clearable
          variant="outlined"
          density="comfortable"
          placeholder="ex: 2020"
        ></v-text-field>
      </v-col>
    </v-row>
  </v-card>
</template>

<style scoped>
.v-card-title {
  display: flex;
  align-items: center;
}
</style> 