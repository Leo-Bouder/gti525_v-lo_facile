<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import CompteurSearch from '../components/CompteurSearch.vue';
import CompteurFilters from '../components/CompteurFilters.vue';
import { store } from '../components/store';
import Modal from '../components/Modal.vue';
import MapContainer from '../components/MapContainer.vue';
import Graph from '../components/Graph.vue'
import axios from 'axios';

const search = ref('')
const sortBy = ref([])
const sortDesc = ref(false)
const data = ref([])
const selectedId = ref(null)
const showModalMap = ref(false)
const showModalGraph = ref(false)
const currentItem = ref(null);
const loading = ref(false);
const showFilters = ref(false);

// Paramètres de recherche combinés
const combinedSearchParams = ref({
  nom: '',
  statut: '',
  arrondissement: '',
  implantation: ''
});

// Pagination
const pagination = ref({
  page: 1,
  limite: 20,
  total_results: 0,
  total_pages: 0
});

const headers = [
  {
    title: 'ID',
    text: 'ID',
    key: 'ID',
    align: 'start',
    sortable: true,
  },
  {
    title: 'Nom',
    text: 'Nom',
    key: 'Nom',
    align: 'start',
    sortable: true,
  },
  {
    title: 'Statut',
    text: 'Statut',
    key: 'Statut',
    align: 'start',
    sortable: true,
  },
  {
    title: 'Année Implantation',
    text: 'Année Implantation',
    key: 'Annee_implante',
    align: 'start',
    sortable: true,
  },
  {
    title: 'Actions',
    text: 'Actions',
    key: 'actions',
    align: 'center',
    sortable: false,
  }
]

const toggleModalMap = () => {
  showModalMap.value = !showModalMap.value;
}

const toggleModalGraph = () => {
  showModalGraph.value = !showModalGraph.value;
}

// Fonction pour charger les données depuis l'API
const loadData = async () => {
  loading.value = true;
  try {
    const params = new URLSearchParams();
    
    // Paramètres de pagination
    params.append('page', pagination.value.page.toString());
    params.append('limite', pagination.value.limite.toString());
    
    // Paramètres de recherche combinés
    if (combinedSearchParams.value.nom) {
      params.append('nom', combinedSearchParams.value.nom);
    }
    if (combinedSearchParams.value.arrondissement && combinedSearchParams.value.arrondissement !== 'all') {
      params.append('arrondissement', combinedSearchParams.value.arrondissement);
    }
    if (combinedSearchParams.value.implantation) {
      params.append('implantation', combinedSearchParams.value.implantation);
    }
    if (combinedSearchParams.value.statut) {
      params.append('statut', combinedSearchParams.value.statut);
    }
    
    // Paramètres de tri
    if (sortBy.value.length > 0) {
      params.append('sortBy', sortBy.value[0]);
      params.append('sortOrder', sortDesc.value ? 'DESC' : 'ASC');
    }
    
    const response = await axios.get(`http://localhost:8000/gti525/v1/compteurs?${params.toString()}`);
    
    data.value = response.data.data;
    pagination.value = {
      ...pagination.value,
      ...response.data.pagination
    };
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error);
  } finally {
    loading.value = false;
  }
};

// Gestionnaire de recherche
const handleSearch = (searchEvent) => {
  const { searchParams } = searchEvent;
  
  // Mettre à jour les paramètres de recherche combinés
  combinedSearchParams.value.nom = searchParams.nom || '';
  
  // Mettre à jour les paramètres de pagination
  pagination.value.page = searchParams.page || 1;
  pagination.value.limite = searchParams.limite || 20;
  
  // Charger les données
  loadData();
};

// Gestionnaire de filtres avancés
const handleAdvancedFilters = (filters) => {
  // Mettre à jour les paramètres de recherche combinés
  combinedSearchParams.value.statut = filters.statut || '';
  combinedSearchParams.value.arrondissement = filters.arrondissement || '';
  combinedSearchParams.value.implantation = filters.implantation || '';
  
  // Retour à la première page lors de l'application des filtres
  pagination.value.page = 1;
  
  // Charger les données
  loadData();
};

// Gestionnaire de changement de page
const handlePageChange = (page) => {
  pagination.value.page = page;
  loadData();
};

// Gestionnaire de tri
const handleSort = (column) => {
  if (sortBy.value[0] === column.key) {
    sortDesc.value = !sortDesc.value;
  } else {
    sortBy.value = [column.key];
    sortDesc.value = false;
  }
  
  // Retour à la première page lors du tri
  pagination.value.page = 1;
  loadData();
};

// Gestionnaire de changement de limite
const handleLimitChange = (limit) => {
  pagination.value.limite = limit;
  pagination.value.page = 1;
  loadData();
};

// Écouter les changements du store global
watch(() => store.arrondissement, (newValue) => {
  combinedSearchParams.value.arrondissement = newValue || '';
  pagination.value.page = 1;
  loadData();
});

watch(() => store.year, (newValue) => {
  combinedSearchParams.value.implantation = newValue || '';
  pagination.value.page = 1;
  loadData();
});

onMounted(async () => {
  await loadData();
});

const openMap = (item) => {
  selectedId.value = item.ID;
  currentItem.value = item;
  toggleModalMap();
};

const openChart = (item) => {
  selectedId.value = item.ID;
  currentItem.value = item;
  toggleModalGraph();
};

</script>

<template>
  <Modal title="Capteurs" :show="showModalMap" @close="toggleModalMap"><MapContainer :records="data" :selectedId="selectedId"></MapContainer></Modal>
  <Modal :title="'Statistiques de passages: ' + currentItem?.Nom" :show="showModalGraph" @close="toggleModalGraph"><Graph :selectedId="selectedId"></Graph></Modal>
  <div class="d-flex flex-column pt-4" style="height: 100%;">
    <h2 class="ml-4 pb-4" style="text-align: left;">Statistiques</h2>
    
    <!-- Barre de recherche -->
    <v-card variant="flat" class="mr-8 mb-4 ml-4" style="min-height: fit-content; background-color: var(--primary-main);">
      <div class="d-flex align-center pa-4">
        <CompteurSearch v-model="search" @search="handleSearch" class="flex-grow-1"/>
        <v-btn
          variant="outlined"
          class="ml-4"
          @click="showFilters = !showFilters"
        >
          <v-icon>{{ showFilters ? 'mdi-chevron-up' : 'mdi-filter' }}</v-icon>
          Filtres
        </v-btn>
      </div>
    </v-card>

    <!-- Filtres avancés -->
    <div v-if="showFilters" class="mr-8 mb-4 ml-4">
      <CompteurFilters
        @filter="handleAdvancedFilters"
      />
    </div>

    <div class="mr-8 mb-4 ml-4" style="display: flex; flex:1; min-height: 0;">
      <v-data-table-server
        :headers="headers"
        :items="data"
        :loading="loading"
        class="elevation-2 rounded-lg bg-light-green-lighten-5"
        density="comfortable"
        hover
        bordered
        fixed-header
        :items-per-page="pagination.limite"
        :page="pagination.page"
        :items-length="pagination.total_results"
        @update:page="handlePageChange"
        @update:items-per-page="handleLimitChange"
      >
        <template #headers="{ columns }">
          <tr>
            <th 
              v-for="column in columns" 
              :key="column.key" 
              style="background: var(--primary-main); color: #213547; cursor: pointer;"
              @click="() => {
                if (column.sortable !== false) {
                  handleSort(column);
                }
              }"
            >
              {{ column.text }}
              <v-icon v-if="sortBy[0] === column.key" size="small">
                {{ sortDesc ? 'mdi-arrow-down' : 'mdi-arrow-up' }}
              </v-icon>
            </th>
          </tr>
        </template>
        <template #[`item.actions`]="{ item }">
          <v-icon
            size="small"
            @click="openChart(item)"
            color="var(--accent-color)"
            style="margin-right: 5px;"
          >
            mdi-chart-bar
          </v-icon>
          <v-icon
            size="small"
            @click="openMap(item)"
            color="var(--accent-color)"
          >
            mdi-map-marker
          </v-icon>
        </template>
      </v-data-table-server>
    </div>
  </div>
</template>

<style scoped>
.v-data-table thead th {
  background: var(--primary-main);
  color: #213547;
  font-weight: bold;
}
</style>