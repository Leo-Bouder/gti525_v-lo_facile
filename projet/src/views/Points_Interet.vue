<script setup>
import { ref, onMounted, computed } from 'vue';
import Search from '../components/Search.vue';
import { store } from '../components/store';
import Modal from '../components/Modal.vue';
import MapContainer from '../components/MapContainer.vue';
import PointInteretForm from '../components/PointInteretForm.vue';
import PointInteretFilters from '../components/PointInteretFilters.vue';
import axios from 'axios';

const search = ref('')
const sortBy = ref([])
const sortDesc = ref(false)
const data = ref([])
const selectedId = ref(null)
const showModal = ref(false)
const showFormModal = ref(false)
const editingPoint = ref(null)
const isEditing = ref(false)
const filters = ref({
  arrondissement: '',
  type: ''
})

const headers = [
  {
    title: 'ID',
    text: 'ID',
    key: 'ID',
    align: 'start',
    sortable: true,
  },
  {
    title: 'Arrondissement',
    text: 'Arrondissement',
    key: 'Arrondissement',
    align: 'start',
    sortable: true,
  },
  {
    title: 'Type',
    text: 'Type',
    key: 'Type',
    align: 'start',
    sortable: true,
  },
  {
    title: 'Nom',
    text: 'Nom',
    key: 'Nom_parc_lieu',
    align: 'start',
    sortable: true,
  },
  {
    title: 'Remarque',
    text: 'Remarque',
    key: 'Remarque',
    align: 'start',
    sortable: true,
  },
  {
    title: 'Adresse',
    text: 'Adresse',
    key: 'Adresse',
    align: 'start',
    sortable: true,
  },
  {
    title: 'Carte',
    text: 'Carte',
    key: 'map',
    align: 'center',
    sortable: false,
  },
  {
    title: 'Actions',
    text: 'Actions',
    key: 'actions',
    align: 'center',
    sortable: false,
  }
]

const toggleModal = () => {
  showModal.value = !showModal.value;
  if (!showModal.value) {
    // Réinitialiser quand on ferme la carte
    selectedArrondissementForMap.value = '';
    selectedId.value = null;
  }
}

const filteredData = computed(() => {
  let filtered = data.value;

  // Filtre par arrondissement (store global)
  if (store.arrondissement && store.arrondissement !== 'ALL') {
    filtered = filtered.filter(item => {
      const itemArr = (item['Arrondissement'] || '').trim().toLowerCase();
      const selectedArr = store.arrondissement.trim().toLowerCase();
      return itemArr === selectedArr;
    });
  }

  // Filtre par arrondissement (filtres locaux)
  if (filters.value.arrondissement) {
    filtered = filtered.filter(item => {
      const itemArr = (item['Arrondissement'] || '').trim().toLowerCase();
      const selectedArr = filters.value.arrondissement.trim().toLowerCase();
      return itemArr === selectedArr;
    });
  }

  // Filtre par type
  if (filters.value.type) {
    filtered = filtered.filter(item => {
      const itemType = (item['Type'] || '').trim().toLowerCase();
      const selectedType = filters.value.type.trim().toLowerCase();
      return itemType === selectedType;
    });
  }

  return filtered;
});

// Données spécifiques pour la carte (filtrées par arrondissement du point sélectionné)
const mapData = computed(() => {
  if (selectedArrondissementForMap.value) {
    return data.value.filter(item =>
      item.Arrondissement === selectedArrondissementForMap.value
    );
  }
  return filteredData.value;
});

const sortedData = computed(() => {
  if (!sortBy.value.length) return filteredData.value;

  const key = sortBy.value[0];
  return [...filteredData.value].sort((a, b) => {
    const aValue = a[key];
    const bValue = b[key];

    if (sortDesc.value) {
      return aValue > bValue ? -1 : 1;
    }
    return aValue < bValue ? -1 : 1;
  });
});

onMounted(async () => {
  try {
    const response = await axios.get(`http://localhost:8000/gti525/v1/pointsdinteret?limit=1000`);
    data.value = response.data.data; // Extraire le tableau de données de la réponse paginée
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error);
  }
});

const selectedArrondissementForMap = ref('');

const openMap = (item) => {
  selectedId.value = item.ID;
  selectedArrondissementForMap.value = item.Arrondissement;
  toggleModal();
};

const openFormModal = (item = null) => {
  if (item) {
    editingPoint.value = item;
    isEditing.value = true;
  } else {
    editingPoint.value = null;
    isEditing.value = false;
  }
  showFormModal.value = true;
};

const closeFormModal = () => {
  showFormModal.value = false;
  editingPoint.value = null;
};

const handleFormSaved = async (savedPoint) => {
  // Recharger toutes les données pour s'assurer que l'interface est à jour
  try {
    const response = await axios.get(`http://localhost:8000/gti525/v1/pointsdinteret?limit=1000`);
    data.value = response.data.data;
  } catch (error) {
    console.error('Erreur lors du rechargement des données:', error);
  }
};

const deletePoint = async (item) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce point d\'intérêt ?')) {
    try {
      await axios.delete(`http://localhost:8000/gti525/v1/pointsdinteret/${item.ID}`, {
        //Adding token to the request
        headers: {
          'Authorization': `Bearer ${store.token}`
        }
      });
      // Recharger toutes les données pour s'assurer que l'interface est à jour
      const response = await axios.get(`http://localhost:8000/gti525/v1/pointsdinteret?limit=1000`);
      data.value = response.data.data;
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression: ' + (error.response?.data?.error || error.message));
    }
  }
};

const handleFilterChange = (newFilters) => {
  filters.value = newFilters;
};

</script>

<template>
  <Modal title="Carte des points d'intérêt" :show="showModal" @close="toggleModal">
    <MapContainer :records="mapData" :selectedId="selectedId" :selected-arrondissement="selectedArrondissementForMap" />
  </Modal>

  <PointInteretForm :show="showFormModal" :point="editingPoint" :is-editing="isEditing" @close="closeFormModal"
    @saved="handleFormSaved" />

  <div class="d-flex flex-column pt-4" style="height: 100%;">
    <div class="d-flex justify-space-between align-center ml-4 pb-4">
      <h2 style="text-align: left;">Points d'intérêts</h2>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openFormModal()">
        Ajouter un point d'intérêt
      </v-btn>
    </div>

    <!-- Filtres -->
    <div class="mr-8 mb-4 ml-4">
      <PointInteretFilters :data="data" @filter-change="handleFilterChange" />
    </div>

    <!-- Barre de recherche -->
    <v-card variant="flat" class="mr-8 mb-4 ml-4"
      style="min-height: fit-content; background-color: var(--primary-main);">
      <div>
        <Search v-model="search" :items="data" :display-fields="['ID', 'Arrondissement', 'Nom_parc_lieu']" />
      </div>
    </v-card>

    <div class="mr-8 mb-4 ml-4" style="display: flex; flex:1; min-height: 0;">
      <v-data-table v-model:search="search" :headers="headers" :items="sortedData" :items-per-page="20"
        class="elevation-2 rounded-lg bg-light-green-lighten-5" density="comfortable" hover bordered fixed-header>
        <template #headers="{ columns }">
          <tr>
            <th v-for="column in columns" :key="column.key"
              style="background: var(--primary-main); color: #213547; cursor: pointer;" @click="() => {
                if (sortBy[0] === column.key) {
                  sortDesc = !sortDesc;
                } else {
                  sortBy = [column.key];
                  sortDesc = false;
                }
              }">
              {{ column.text }}
              <v-icon v-if="sortBy[0] === column.key" size="small">
                {{ sortDesc ? 'mdi-arrow-down' : 'mdi-arrow-up' }}
              </v-icon>
            </th>
          </tr>
        </template>
        <template #[`item.map`]="{ item }">
          <v-icon size="small" @click="openMap(item)" color="var(--accent-color)">
            mdi-map-marker
          </v-icon>
        </template>

        <template #[`item.actions`]="{ item }">
          <div class="d-flex gap-2">
            <v-btn size="small" color="primary" variant="outlined" @click="openFormModal(item)" icon>
              <v-icon size="small">mdi-pencil</v-icon>
            </v-btn>
            <v-btn size="small" color="error" variant="outlined" @click="deletePoint(item)" icon>
              <v-icon size="small">mdi-delete</v-icon>
            </v-btn>
          </div>
        </template>
      </v-data-table>
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