<script setup>
import { ref, watch, onMounted } from 'vue';
import { store } from './store';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue', 'search']);

const search = ref(props.modelValue);
const loading = ref(false);

// Paramètres de recherche
const searchParams = ref({
  nom: '',
  arrondissement: '',
  statut: '',
  implantation: '',
  sortBy: 'ID',
  sortOrder: 'ASC',
  page: 1,
  limite: 20
});

// Écouter les changements du store global
watch(() => store.arrondissement, (newValue) => {
  searchParams.value.arrondissement = newValue;
  triggerSearch();
});

watch(() => store.year, (newValue) => {
  searchParams.value.implantation = newValue;
  triggerSearch();
});

// Écouter les changements de recherche locale
watch(search, (newValue) => {
  emit('update:modelValue', newValue);
  searchParams.value.nom = newValue;
  triggerSearch();
});

watch(() => props.modelValue, (newValue) => {
  search.value = newValue;
});

const triggerSearch = () => {
  loading.value = true;
  
  // Construire les paramètres de requête
  const params = new URLSearchParams();
  
  if (searchParams.value.nom) {
    params.append('nom', searchParams.value.nom);
  }
  if (searchParams.value.arrondissement && searchParams.value.arrondissement !== 'all') {
    params.append('arrondissement', searchParams.value.arrondissement);
  }
  if (searchParams.value.statut) {
    params.append('statut', searchParams.value.statut);
  }
  if (searchParams.value.implantation) {
    params.append('implantation', searchParams.value.implantation);
  }
  if (searchParams.value.sortBy) {
    params.append('sortBy', searchParams.value.sortBy);
  }
  if (searchParams.value.sortOrder) {
    params.append('sortOrder', searchParams.value.sortOrder);
  }
  if (searchParams.value.page) {
    params.append('page', searchParams.value.page.toString());
  }
  if (searchParams.value.limite) {
    params.append('limite', searchParams.value.limite.toString());
  }

  // Émettre l'événement de recherche avec les paramètres
  emit('search', {
    params: params.toString(),
    searchParams: { ...searchParams.value }
  });
  
  loading.value = false;
};

// Initialiser avec les valeurs du store
onMounted(() => {
  searchParams.value.arrondissement = store.arrondissement || '';
  searchParams.value.implantation = store.year || '';
  triggerSearch();
});

// Méthodes publiques pour la pagination et le tri
const setPage = (page) => {
  searchParams.value.page = page;
  triggerSearch();
};

const setSort = (sortBy, sortOrder = 'ASC') => {
  searchParams.value.sortBy = sortBy;
  searchParams.value.sortOrder = sortOrder;
  searchParams.value.page = 1; // Retour à la première page lors du tri
  triggerSearch();
};

const setLimit = (limit) => {
  searchParams.value.limite = limit;
  searchParams.value.page = 1; // Retour à la première page lors du changement de limite
  triggerSearch();
};

// Exposer les méthodes
defineExpose({
  setPage,
  setSort,
  setLimit,
  triggerSearch
});
</script>

<template>
  <div class="compteur-search">
    <v-text-field
      v-model="search"
      label="Rechercher un compteur"
      prepend-inner-icon="mdi-magnify"
      clearable
      hide-details
      variant="outlined"
      density="comfortable"
      class="flex-grow-1"
      :loading="loading"
    ></v-text-field>
  </div>
</template>

<style scoped>
.compteur-search {
  width: 100%;
}
</style> 