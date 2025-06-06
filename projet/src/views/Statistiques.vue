<script setup>
import { ref, onMounted, computed } from 'vue';
import Papa from 'papaparse';
import csvUrl from '../data/compteurs.csv?url';
import Search from '../components/Search.vue';
import { store } from '../components/store';
const search = ref('')
const sortBy = ref([])
const sortDesc = ref(false)
const data = ref([])

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
]

const filteredData =computed(() => {
  if(!store.year) return data.value;

  return data.value.filter(item =>{
    const year = parseInt(item.Annee_implante, 10);
    return !isNaN(year) && year >= parseInt(store.year, 10);
  

  });
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
    const response = await fetch(csvUrl);
    const csvText = await response.text();
    
    Papa.parse(csvText, {
      header: true,
      complete: (results) => {
        data.value = results.data;
        console.log('Données chargées:', data.value);
      }
    });
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error);
  }
});

</script>

<template>
  <div class="d-flex flex-column pt-4" style="height: 100%;">
    <h2 class="ml-4 pb-4" style="text-align: left;">Statistiques</h2>
    <v-card variant="flat" class="mr-8 mb-4 ml-4" style="height: fit-content; background-color: #C5E1A5;">
      <div>
        <Search v-model="search" :items="data" :display-fields="['ID', 'Nom', 'Statut', 'Annee_implante']"/>
      </div>
    </v-card>

    <div class="mr-8 mb-4 ml-4" style="display: flex; flex:1;">
      <v-data-table
        v-model:search="search"
        :headers="headers"
        :items="sortedData"
        class="elevation-2 rounded-lg bg-light-green-lighten-5"
        density="comfortable"
        hover
        bordered
        fixed-header
      >
        <template #headers="{ columns }">
          <tr>
            <th 
              v-for="column in columns" 
              :key="column.key" 
              style="background: #C5E1A5; color: #213547; cursor: pointer;"
              @click="() => {
                if (sortBy[0] === column.key) {
                  sortDesc = !sortDesc;
                } else {
                  sortBy = [column.key];
                  sortDesc = false;
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
      </v-data-table>
    </div>
  </div>
</template>

<style scoped>
.v-data-table thead th {
  background: #C5E1A5;
  color: #213547;
  font-weight: bold;
}
</style>