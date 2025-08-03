<template>
  <v-card class="district-map-sidebar" elevation="0">
    <v-card-title class="pb-2">
      <h3>Arrondissement :</h3>
    </v-card-title>
    
    <v-card-text class="pa-0">
      <div class="map-container mb-3">
        <div id="map" ref="mapContainer"></div>
        
        <div v-if="loading" class="map-loading-overlay">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
          <div class="mt-2">Chargement...</div>
        </div>
        
        <div class="map-controls">
          <v-btn
            icon
            size="small"
            variant="outlined"
            class="zoom-btn mb-1"
            @click="zoomIn"
            :disabled="loading"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
          <v-btn
            icon
            size="small"
            variant="outlined"
            class="zoom-btn"
            @click="zoomOut"
            :disabled="loading"
          >
            <v-icon>mdi-minus</v-icon>
          </v-btn>
        </div>
      </div>
      
      <div class="px-3 pb-3">
        <DropDown
        :items="dropDownItems.items"
        :title="dropDownItems.title"
        v-model="selectedTerr"
        @update:modelValue="dropDownChanged"
        @blur="updateTerr"
        ></DropDown>
      </div>

      <div v-if="this.$route.name === 'Statistiques'">
        <p class="filter-label">Statut :</p>
        <v-select
          v-model="selectedStatut"
          :items="statutItems"
          label="Statut"
          item-title="text"
          item-value="value"
          variant="outlined"
          density="compact"
          clearable
          @update:model-value="onStatutChange"
        ></v-select>
        
        <p class="filter-label">Arrondissement :</p>
        <v-select
          v-model="selectedStatistiquesArrondissement"
          :items="arrondissementItems"
          label="Arrondissement"
          item-title="text"
          item-value="value"
          variant="outlined"
          density="compact"
          clearable
          @update:model-value="onStatistiquesArrondissementChange"
        ></v-select>
        
        <p class="filter-label">Compteurs implantés à partir de :</p>
        <v-date-input
         label="Choisir l'année"
         @blur="updateDate"
         v-model="year"
         view-mode="year"
        ></v-date-input>
        
        <div class="d-flex justify-space-between mt-3">
          <v-btn
            color="secondary"
            variant="outlined"
            size="small"
            @click="clearStatistiquesFilters"
            :disabled="!hasActiveStatistiquesFilters"
          >
            <v-icon left size="small">mdi-filter-remove</v-icon>
            Effacer
          </v-btn>
        </div>
      </div>
      <div v-if="this.$route.name === 'Interet'">
        
        <p class="filter-label">Arrondissement :</p>
        <v-select
          v-model="selectedArrondissement"
          :items="arrondissementItems"
          label="Arrondissement"
          item-title="text"
          item-value="value"
          variant="outlined"
          density="compact"
          clearable
          @update:model-value="onArrondissementChange"
        ></v-select>
        
        <p class="filter-label">Type de lieu :</p>
        <v-select
          v-model="selectedType"
          :items="typeItems"
          label="Type de lieu"
          item-title="text"
          item-value="value"
          variant="outlined"
          density="compact"
          clearable
          @update:model-value="onTypeChange"
        ></v-select>
        
        <div class="d-flex justify-space-between mt-3">
          <v-btn
            color="secondary"
            variant="outlined"
            size="small"
            @click="clearFilters"
            :disabled="!hasActiveFilters"
          >
            <v-icon left size="small">mdi-filter-remove</v-icon>
            Effacer
          </v-btn>
        </div>
      </div>
      <div v-if="this.$route.name === 'Reseau'" class="reseau-filters">
        <p class="filter-label">Type du réseau :</p>
        <v-btn-toggle 
        v-model="networkType" 
        class="toggle-group"
        density="compact" 
        rounded
        mandatory
        >
          <v-btn value="saisonnier">Saisonnier</v-btn>
          <v-btn value="4saisons">4 saisons</v-btn>
        </v-btn-toggle>

        <p class="filter-label">Type de voie :</p>
        <v-checkbox v-model="protectedLane" label="Voies protégées" />
        <v-checkbox v-model="sharedLane" label="Voies partagées" />

        <p class="filter-label">Les plus populaires :</p>
        <v-checkbox 
          v-model="showPopularPistes" 
          label="Afficher les pistes populaires"
          class="mb-2"
        />
        
        <div v-if="showPopularPistes" class="popular-dates">
          <v-date-input
           label="De :"
           v-model="dateFrom"
           density="compact"
           variant="outlined"
           clearable
           @update:model-value="updatePopularDates"
          ></v-date-input>
          <v-date-input
           label="À :"
           v-model="dateTo"
           density="compact"
           variant="outlined"
           clearable
           @update:model-value="updatePopularDates"
          ></v-date-input>
        </div>
      </div>

    </v-card-text>
  </v-card>
</template>

<script>
// Import dynamique de Leaflet pour éviter les problèmes ES module
let L = null;
import { VDateInput } from 'vuetify/labs/VDateInput'
import { store } from './store'
import axios from 'axios'
export default {
  name: 'SideMenu',
  components: {
    VDateInput
  },
  data() {
    return {
      map: null,
      geojsonLayer: null,
      geojsonData: null,
      loading: true,
      dropDownItems: {
        items:[],
        title:"Arrondissement"
      },
      selectedTerr: "",
      currentLayer: null,
      year: "",
      selectedArrondissement: "",
      selectedType: "",
      selectedStatut: "",
      selectedStatistiquesArrondissement: "",
      typeItems:[
        { text: "Fontaine", value: "Fontaine" },
        { text: "Atelier", value: "Atelier" },
        { text: "Stationnement", value: "Stationnement" },
        { text: "Autre", value: "Autre" }
      ],
      statutItems:[
        { text: "Actif", value: "Actif" },
        { text: "En maintenance", value: "En maintenance" },
        { text: "À supprimer", value: "À supprimer" }
      ],
      arrondissementItems: []
    }
  },
  computed: {
    protectedLane: {
      get() { return this.$store ? this.$store.protectedLane : store.protectedLane },
      set(val) { store.protectedLane = val }
    },
    sharedLane: {
      get() { return this.$store ? this.$store.sharedLane : store.sharedLane },
      set(val) { store.sharedLane = val }
    },
    networkType: {
      get() { return store.networkType },
      set(val) { store.networkType = val }
    },
    showPopularPistes: {
      get() { return store.showPopularPistes },
      set(val) { store.showPopularPistes = val }
    },
    dateFrom: {
      get() { return store.dateFrom },
      set(val) { store.dateFrom = val }
    },
    dateTo: {
      get() { return store.dateTo },
      set(val) { store.dateTo = val }
    },
    hasActiveFilters() {
      return this.selectedArrondissement || this.selectedType;
    },
    hasActiveStatistiquesFilters() {
      return this.selectedStatut || this.selectedStatistiquesArrondissement;
    }
  },
  async mounted() {
    console.log('SideMenu mounted - Route:', this.$route.name);
    try {
      await this.initMap()
      this.loadGeoJsonData()
      // Charger les arrondissements pour les filtres (points d'intérêt et statistiques)
      this.loadArrondissements()
      console.log('SideMenu initialization completed');
    } catch (error) {
      console.error('Error in SideMenu mounted:', error);
    }
  },
  beforeUnmount() {
    if (this.map) {
      this.map.remove()
    }
  },
  watch: {
    geojsonData: {
      handler(newData) {
        if (newData && this.map) {
          this.addGeoJsonLayer(newData)
        }
      },
      deep: true
    },
    // Synchroniser les filtres avec le store
    'store.statistiquesFilters': {
      handler(newFilters) {
        if (newFilters) {
          this.selectedStatut = newFilters.statut || '';
          this.selectedStatistiquesArrondissement = newFilters.arrondissement || '';
        }
      },
      deep: true,
      immediate: true
    },
    'store.pointInteretFilters': {
      handler(newFilters) {
        if (newFilters) {
          this.selectedArrondissement = newFilters.arrondissement || '';
          this.selectedType = newFilters.type || '';
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    async loadGeoJsonData() {
      try {
        this.loading = true

        this.geojsonData = (await axios.get(`http://localhost:8000/gti525/v1/territoiresGeo`)).data;

        const temp_terr = this.geojsonData.features.map(f => ({text:f.properties.NOM, value:f.properties.NOM}));

        this.dropDownItems.items = temp_terr.sort((a, b) => a.text.localeCompare(b.text))
        
        if (this.map && this.geojsonData) {
          this.addGeoJsonLayer(this.geojsonData)
        }
      } catch (error) {
        console.error('Error loading GeoJSON data:', error)
      } finally {
        this.loading = false
      }
    },
    async initMap() {
      try {
        // Charger Leaflet de manière asynchrone
        const leafletModule = await import('leaflet');
        L = leafletModule.default;
        
        // Charger le CSS de Leaflet
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
        
        const montrealLat = 45.5017
        const montrealLng = -73.5673
        
        this.map = L.map(this.$refs.mapContainer, {
          center: [montrealLat, montrealLng],
          zoom: 10,
          zoomControl: false,
          attributionControl: false
        })
        
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '© OpenStreetMap contributors © CARTO',
          subdomains: 'abcd',
          maxZoom: 19
        }).addTo(this.map)
        
        if (this.geojsonData) {
          this.addGeoJsonLayer(this.geojsonData)
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de la carte:', error);
      }
    },
    
    addGeoJsonLayer(geojsonData) {
      if (this.geojsonLayer) {
        this.map.removeLayer(this.geojsonLayer)
      }
      
      this.geojsonLayer = L.geoJSON(geojsonData, {
        style: (feature) => ({
          fillColor: '#e0e0e0',
          weight: 1,
          opacity: 1,
          color: '#666',
          fillOpacity: 0.3
        }),
        onEachFeature: (feature, layer) => {
          layer.on('mouseover', () => {
            if(this.layerIsSelected(layer)){return;}
            layer.setStyle({
              fillOpacity: 0.5,
              fillColor: '#90caf9'
            })
          })
          
          layer.on('mouseout', () => {
            if(this.layerIsSelected(layer)){return;}
            layer.setStyle({
              fillOpacity: 0.3,
              fillColor: '#e0e0e0'
            })
          })
          
          layer.on('click', () => {
            this.selectedTerr = feature.properties.NOM
            this.dropDownChanged(feature.properties.NOM)
          })
        }
      }).addTo(this.map)
      
      this.map.fitBounds(this.geojsonLayer.getBounds(), { padding: [10, 10] })
    },

    setLayer(layer) {
      if(!layer){
        if(this.currentLayer){
          this.currentLayer.setStyle({
            fillOpacity: 0.3,
            fillColor:'#e0e0e0'
          });
        }
        this.currentLayer= null;
        return;
      }
      layer.setStyle({
        fillOpacity: 0.5,
        fillColor: '#F9BF90'
      })
      if(this.currentLayer) {
        this.currentLayer.setStyle({
          fillOpacity: 0.3,
          fillColor: '#e0e0e0'
        })
      }
      this.currentLayer = layer;
    },

    getLayerByTerritoryName(territoryName) {
      if (!this.geojsonLayer) {
        return null
      }
      
      let foundLayer = null
      
      this.geojsonLayer.eachLayer((layer) => {
        const properties = layer.feature.properties
        if (properties && properties.NOM === territoryName) {
          foundLayer = layer
        }
      })
      
      return foundLayer
    },

    layerIsSelected(layer) {
      return layer.options.fillColor === "#F9BF90";
    },

    zoomIn() {
      if (this.map) {
        this.map.zoomIn()
      }
    },
    
    zoomOut() {
      if (this.map) {
        this.map.zoomOut()
      }
    },

    dropDownChanged(terr) {
      const layer = this.getLayerByTerritoryName(terr);
      this.setLayer(layer);
      this.updateTerr();
      
      // Mettre à jour aussi le dropdown des statistiques si on est sur la page Statistiques
      if (this.$route.name === 'Statistiques') {
        this.selectedStatistiquesArrondissement = terr;
        store.statistiquesFilters.arrondissement = terr;
      }
    },

    updateDate(){
      store.year =  this.year.toString().split(' ')[3];
    },

    updateTerr(){
      store.arrondissement = this.selectedTerr;
    },

    updatePopularDates() {
      console.log('=== DEBUG updatePopularDates ===');
      console.log('dateFrom (raw):', this.dateFrom);
      console.log('dateTo (raw):', this.dateTo);
      console.log('dateFrom type:', typeof this.dateFrom);
      console.log('dateTo type:', typeof this.dateTo);
      
      // Conversion des dates en string YYYY-MM-DD si ce sont des objets Date
      let from = this.dateFrom instanceof Date
        ? this.dateFrom.toISOString().slice(0, 10)
        : this.dateFrom;
      let to = this.dateTo instanceof Date
        ? this.dateTo.toISOString().slice(0, 10)
        : this.dateTo;
      
      console.log('dateFrom converti:', from);
      console.log('dateTo converti:', to);
      
      // Mise à jour du store
      store.dateFrom = from;
      store.dateTo = to;
      
      console.log('store.dateFrom après mise à jour:', store.dateFrom);
      console.log('store.dateTo après mise à jour:', store.dateTo);
      console.log('store.showPopularPistes:', store.showPopularPistes);
      
      // Forcer la mise à jour si les deux dates sont présentes
      if (store.dateFrom && store.dateTo) {
        console.log('Les deux dates sont présentes, déclenchement de loadGeoJsonData...');
        // Déclencher directement via le store
        store.triggerPopularPistesUpdate = true;
      }
      
      // Émettre un événement pour notifier le parent
      this.$emit('popular-dates-changed', {
        dateFrom: this.dateFrom,
        dateTo: this.dateTo
      });
      
      console.log('=== FIN updatePopularDates ===');
    },

    // Méthodes pour les filtres des points d'intérêt
    async loadArrondissements() {
      try {
        const response = await axios.get('http://localhost:8000/gti525/v1/pointsdinteret/arrondissements');
        this.arrondissementItems = response.data.map(arr => ({
          text: arr.name,
          value: arr.name
        }));
      } catch (error) {
        console.error('Erreur lors du chargement des arrondissements:', error);
      }
    },

    onArrondissementChange(value) {
      console.log('🔄 SideMenu - onArrondissementChange appelé avec:', value);
      
      // Mettre à jour le store global pour la cohérence
      store.arrondissement = value || 'ALL';
      // Mettre à jour les filtres des points d'intérêt
      store.pointInteretFilters.arrondissement = value;
      
      console.log('🔄 SideMenu - Store mis à jour:', store.pointInteretFilters);
      
      // Mettre en évidence l'arrondissement sélectionné sur la carte
      if (value && value !== 'ALL') {
        const layer = this.getLayerByTerritoryName(value);
        this.setLayer(layer);
      } else {
        // Si aucun arrondissement sélectionné, désélectionner la carte
        this.setLayer(null);
      }
    },

    onTypeChange() {
      // Mettre à jour les filtres des points d'intérêt
      store.pointInteretFilters.type = this.selectedType;
    },

    // Méthodes pour les filtres des statistiques
    onStatutChange() {
      store.statistiquesFilters.statut = this.selectedStatut;
    },

    onStatistiquesArrondissementChange() {
      store.statistiquesFilters.arrondissement = this.selectedStatistiquesArrondissement;
    },

    clearStatistiquesFilters() {
      this.selectedStatut = '';
      this.selectedStatistiquesArrondissement = '';
      store.statistiquesFilters.statut = '';
      store.statistiquesFilters.arrondissement = '';
    },

    clearFilters() {
      this.selectedArrondissement = '';
      this.selectedType = '';
      store.arrondissement = 'ALL';
      store.pointInteretFilters.arrondissement = '';
      store.pointInteretFilters.type = '';
      
      // Désélectionner la carte
      this.setLayer(null);
    }

  }
}
</script>

<style scoped>
.district-map-sidebar {
  height: 100%;
  width: 100%;
  max-width: 400px;
  min-width: 320px;
  background-color: var(--primary-main);
  border-radius: 0;
  padding-left: 1rem;
  overflow-y: auto;
  padding-bottom: 120px;
  max-height: calc(100vh - 120px);
}

@media (max-width: 960px) {
  .district-map-sidebar {
    max-width: 350px;
    min-width: 280px;
  }
}

@media (max-width: 600px) {
  .district-map-sidebar {
    max-width: 100%;
    min-width: 250px;
  }
}

.map-container {
  position: relative;
  height: 300px;
  margin: 0 12px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

#map {
  height: 100%;
  width: 100%;
}

.map-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(248, 248, 248, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  font-size: 14px;
  color: #666;
}

.map-controls {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.zoom-btn {
  background-color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.zoom-btn:hover {
  background-color: #f5f5f5;
}

:deep(.leaflet-container) {
  background-color: #f8f8f8;
}

:deep(.leaflet-control-attribution) {
  display: none;
}

.filter-label{
  margin-bottom: 0.2rem;
  font-weight: bold;
  text-align: left;
  font-size: 14px;
  color:#333;
  width: 100%;
}

.toggle-group{
  width: 100%;
  max-width: 250px;
  background-color: #d1d8c0;
  border-radius: 8px;
  overflow: hidden;
}

.reseau-filters {
  margin-bottom: 20px;
}

.reseau-filters .filter-label {
  margin-top: 16px;
  margin-bottom: 8px;
}

.popular-dates {
  margin-top: 8px;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: #f9f9f9;
  margin-bottom: 16px;
}

.popular-dates .v-date-input {
  margin-bottom: 12px;
}

.popular-dates .v-date-input:last-child {
  margin-bottom: 8px;
}

.popular-dates .v-btn {
  width: 100%;
}
</style>