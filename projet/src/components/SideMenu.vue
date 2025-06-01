<template>
  <v-card class="district-map-sidebar" elevation="0">
    <v-card-title class="pb-2">
      <h3>Arrondissement :</h3>
    </v-card-title>
    
    <v-card-text class="pa-0">
      <!-- Map Container -->
      <div class="map-container mb-3">
        <div id="map" ref="mapContainer"></div>
        
        <!-- Loading overlay -->
        <div v-if="loading" class="map-loading-overlay">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
          <div class="mt-2">Chargement...</div>
        </div>
        
        <!-- Map Controls -->
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
      
      <!-- Dropdown -->
      <div class="px-3 pb-3">
        <DropDown
        v-model="selectedTerr"
        :items="dropDownItems.items"
        :title="dropDownItems.title"
        @update:modelValue="dropDownChanged"
        ></DropDown>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import data from "../data/territoires.geojson?raw"
import DropDown from './DropDown.vue'

export default {
  name: 'SideMenu',
  components: {
    DropDown
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
      currentLayer: null
    }
  },
  mounted() {
    this.initMap()
    this.loadGeoJsonData()
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
    }
  },
  methods: {
    async loadGeoJsonData() {
      try {
        this.loading = true

        this.geojsonData = JSON.parse(data)

        const temp_terr = this.geojsonData.features.map(f => ({text:f.properties.NOM, value:f.properties.NOM}));

        this.dropDownItems.items = temp_terr.sort((a, b) => a.text.localeCompare(b.text))
        
        // Add to map if map is ready
        if (this.map && this.geojsonData) {
          this.addGeoJsonLayer(this.geojsonData)
        }
      } catch (error) {
        console.error('Error loading GeoJSON data:', error)
      } finally {
        this.loading = false
      }
    },
    initMap() {
      // Montreal coordinates
      const montrealLat = 45.5017
      const montrealLng = -73.5673
      
      // Initialize map
      this.map = L.map(this.$refs.mapContainer, {
        center: [montrealLat, montrealLng],
        zoom: 10,
        zoomControl: false, // We'll use custom controls
        attributionControl: false
      })
      
      // Add tile layer (using a light grayscale theme similar to your screenshot)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors © CARTO',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(this.map)
      
      // Add GeoJSON if loaded
      if (this.geojsonData) {
        this.addGeoJsonLayer(this.geojsonData)
      }
    },
    
    addGeoJsonLayer(geojsonData) {
      // Remove existing layer if present
      if (this.geojsonLayer) {
        this.map.removeLayer(this.geojsonLayer)
      }
      
      // Add new GeoJSON layer
      this.geojsonLayer = L.geoJSON(geojsonData, {
        style: (feature) => ({
          fillColor: '#e0e0e0',
          weight: 1,
          opacity: 1,
          color: '#666',
          fillOpacity: 0.3
        }),
        onEachFeature: (feature, layer) => {
          // Add hover effects
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
          
          // Add click handler if needed
          layer.on('click', () => {
            this.setLayer(layer)
            this.selectedTerr = feature.properties.NOM
          })
        }
      }).addTo(this.map)
      
      // Fit map to GeoJSON bounds
      this.map.fitBounds(this.geojsonLayer.getBounds(), { padding: [10, 10] })
    },

    setLayer(layer) {
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
        // Check NOM property (territory name in your GeoJSON structure)
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
    }
  }
}
</script>

<style scoped>
.district-map-sidebar {
  height: 100vh;
  width: 100%;
  max-width: 400px;
  min-width: 320px;
  background-color: #cdd6bd;
  border-radius: 0;
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

/* Override Leaflet default styles */
:deep(.leaflet-container) {
  background-color: #f8f8f8;
}

:deep(.leaflet-control-attribution) {
  display: none;
}
</style>