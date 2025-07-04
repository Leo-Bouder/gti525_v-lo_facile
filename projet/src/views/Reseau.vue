<template>
  <Modal title="Légende" :show="showInfoModal" @close="toggleModalInfo">
    <div class="legend-container">
      <div style="display: flex; align-items: flex-start; margin-bottom: 24px;">
        <div class="color-swatch" style="background-color: #32D1EB;"></div>
        <div style="flex-grow: 1; text-align: left;">
          <h3 class="legend-title">Le REV</h3>
          <p style="font-size: 0.875rem; color: #527d6d; line-height: 1.5;">
            Ensemble de pistes cyclables protégées reliant divers points d'intérêt sur l'île de Montréal
          </p>
        </div>
      </div>
      <div style="display: flex; align-items: flex-start; margin-bottom: 24px;">
        <div class="color-swatch" style="background-color: #A7D949;"></div>
        <div style="flex-grow: 1; text-align: left;">
          <h3 class="legend-title">Voie partagée</h3>
          <p style="font-size: 0.875rem; color: #527d6d; line-height: 1.5;">
            Pistes cyclables délimitées ou rues partagées entre cyclistes et automobilistes
          </p>
        </div>
      </div>
      <div style="display: flex; align-items: flex-start; margin-bottom: 24px;">
        <div class="color-swatch" style="background-color: #276B3C;"></div>
        <div style="flex-grow: 1; text-align: left;">
          <h3 class="legend-title">Voie protégée</h3>
          <p style="font-size: 0.875rem; color: #527d6d; line-height: 1.5;">
            Une voie distincte, séparée de la circulation motorisée par un élément physique
          </p>
        </div>
      </div>
      <div style="display: flex; align-items: flex-start;">
        <div class="color-swatch" style="background-color: #A84DB5;"></div>
        <div style="flex-grow: 1; text-align: left;">
          <h3 class="legend-title">Sentier polyvalent</h3>
          <p style="font-size: 0.875rem; color: #527d6d; line-height: 1.5;">
            Un chemin situé hors de la chaussée ou en bordure de celle-ci, emprunté à la fois par les piétons et les
            cyclistes
          </p>
        </div>
      </div>
    </div>
  </Modal>
  <div class="d-flex flex-column pt-4" style="height: 100%;">
    <h2 class="ml-4 pb-4" style="text-align: left;">Pistes et voies cyclables</h2>
    <div class="mr-8 mb-4 ml-4" style="display: flex; flex:1; flex-direction: column;">
      <v-card class="district-map-sidebar" elevation="0">
        <v-card-text class="pa-0">
          <div class="map-container mb-3">
            <div id="map" ref="mapContainer"></div>

            <div v-if="loading" class="map-loading-overlay">
              <v-progress-circular indeterminate color="#000000"></v-progress-circular>
              <div class="mt-2">Chargement...</div>
            </div>

            <div class="map-controls">
              <v-btn icon size="small" variant="outlined" class="zoom-btn mb-1" @click="zoomIn" :disabled="loading">
                <v-icon>mdi-plus</v-icon>
              </v-btn>
              <v-btn icon size="small" variant="outlined" class="zoom-btn" @click="zoomOut" :disabled="loading">
                <v-icon>mdi-minus</v-icon>
              </v-btn>
            </div>
          </div>
          <div class="map-info">
            <v-icon size="x-large" class="info-button" @click="toggleModalInfo">mdi-information</v-icon>
          </div>
        </v-card-text>
      </v-card>
      <v-card class="mt-4" elevation="0" style="text-align: left;">
        <v-card-title class="pb-2">
          <h3>Détails :</h3>
        </v-card-title>
        <v-card-text class="pa-0 pl-4">
          <div class="mb-3">
            <p>Nombre de pistes : {{ nombrePistes }}</p>
            <p>Nombre de Km : {{ longueurTotaleKm.toFixed(2) }}</p>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>
<script>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { store } from '../components/store';
import { nextTick, watch } from 'vue';
import { nextTick } from 'vue';
import Modal from '../components/Modal.vue';
import axios from 'axios';

export default {
  name: 'Reseau',
  components: { Modal },
  data() {
    return {
      map: null,
      geojsonLayer: null,
      geojsonData: null,
      loading: true,
      dropDownItems: {
        items: [],
        title: "Arrondissement"
      },
      selectedTerr: "",
      currentLayer: null,
      nombrePistes: 0,
      longueurTotaleKm: 0,
      filteredGeoJsonData: null,
      showInfoModal: false
    }
  },
  async mounted() {
    await nextTick();
    requestIdleCallback(() => {
      this.initMap()
    })
    // Watch sur le store pour la sélection d'arrondissement et les cases à cocher
    watch(() => store.arrondissement, () => {
      this.updateStatsAndLayer();
    });
    watch(() => store.protectedLane, () => {
      this.updateStatsAndLayer();
    });
    watch(() => store.sharedLane, () => {
      this.updateStatsAndLayer();
    });
    watch(() => store.networkType, () => {
      this.updateStatsAndLayer();
    });
  },
  methods: {
    async loadGeoJsonData() {
      try {
        this.loading = true

        this.geojsonData = (await axios.get(`http://localhost:8000/gti525/v1/pistes`)).data;

        // Calcul initial (tous quartiers)
        this.updateStatsAndLayer();

        if (this.map && this.geojsonData) {
          this.addGeoJsonLayer(this.filteredGeoJsonData)
        }
      } catch (error) {
        console.error('Error loading GeoJSON data:', error)
      }
    },
    updateStatsAndLayer() {
      let filteredFeatures = this.geojsonData.features;

      // Filtre arrondissement
      if (store.arrondissement && store.arrondissement !== 'ALL') {
        filteredFeatures = filteredFeatures.filter(f =>
          f.properties &&
          (f.properties.Arrondissement === store.arrondissement ||
           f.properties.NOM_ARR_VILLE_DESC === store.arrondissement)
        );
      }

      // Filtre type de voie
      const protCodes = [4, 5, 6, 7];
      const sharedCodes = [1, 3, 8, 9];
      if (!store.protectedLane && !store.sharedLane) {
        filteredFeatures = [];
      } else if (store.protectedLane !== store.sharedLane) {
        if (store.protectedLane) {
          filteredFeatures = filteredFeatures.filter(f => protCodes.includes(Number(f.properties.TYPE_VOIE_CODE)));
        } else if (store.sharedLane) {
          filteredFeatures = filteredFeatures.filter(f => sharedCodes.includes(Number(f.properties.TYPE_VOIE_CODE)));
        }
      }
      // Sinon (les deux cochées) : on garde tout

      // Filtre saison
      console.log('networkType:', store.networkType);
      console.log('Avant filtre saison:', filteredFeatures.length);
      if (store.networkType === '4saisons') {
        filteredFeatures = filteredFeatures.filter(f =>
          f.properties &&
          typeof f.properties.SAISONS4 !== 'undefined' &&
          String(f.properties.SAISONS4).toLowerCase() === 'oui'
        );
      }
      console.log('Après filtre saison:', filteredFeatures.length);

      this.filteredGeoJsonData = {
        ...this.geojsonData,
        features: filteredFeatures
      };
      this.nombrePistes = filteredFeatures.length;
      this.longueurTotaleKm = filteredFeatures.reduce((acc, feature) => {
        if (feature.geometry.type === 'LineString') {
          return acc + this.getLineLength(feature.geometry.coordinates);
        } else if (feature.geometry.type === 'MultiLineString') {
          return acc + feature.geometry.coordinates.reduce((acc2, coords) => acc2 + this.getLineLength(coords), 0);
        }
        return acc;
      }, 0) / 1000;
      if (this.map && this.filteredGeoJsonData) {
        this.addGeoJsonLayer(this.filteredGeoJsonData);
      }
    },
    initMap() {
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
        maxZoom: 50
      }).addTo(this.map)

      // Toujours charger les données et calculer les stats
      this.loadGeoJsonData()
      this.loading = false
    },

    addGeoJsonLayer(geojsonData) {
      if (this.geojsonLayer) {
        this.map.removeLayer(this.geojsonLayer)
      }
      // Toujours créer une nouvelle couche avec le style dynamique
      this.geojsonLayer = L.geoJSON(geojsonData, {
        style: (feature) => {
          const cat = this.getCategorie(feature);
          let color = '#000'; // noir par défaut pour bien voir
          if (cat === 'REV') color = '#2AC7DD'; // bleu
          else if (cat === 'Voie partagée') color = '#84CA4B'; // vert
          else if (cat === 'Voie protégée') color = '#025D29'; // rouge
          else if (cat === 'Sentier polyvalent') color = '#B958D9'; // jaune
          // Pour debug :
          console.log(cat, feature);
          return {
            color: color,
            weight: 2,
            opacity: 1
          }
        }
      })
      this.geojsonLayer.addTo(this.map);
      this.map.fitBounds(this.geojsonLayer.getBounds(), { padding: [10, 10] })
    },
    getCategorie(feature) {
      const p = feature.properties;
      // Le REV
      if (["EV", "PE", "TR"].includes(p.REV_AVANCEMENT_CODE)) return "REV";
      // Voie partagée
      if (p.AVANCEMENT_CODE === "E" && [1, 3, 8, 9].includes(Number(p.TYPE_VOIE_CODE))) return "Voie partagée";
      // Voie protégée
      if (
        p.AVANCEMENT_CODE === "E" &&
        [4, 5, 6].includes(Number(p.TYPE_VOIE_CODE)) &&
        !["EV", "PE", "TR"].includes(p.REV_AVANCEMENT_CODE)
      ) return "Voie protégée";
      // Sentier polyvalent
      if (p.AVANCEMENT_CODE === "E" && Number(p.TYPE_VOIE_CODE) === 7) return "Sentier polyvalent";
      // Par défaut
      return "Autre";
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
    getLineLength(coords) {
      // Calcule la longueur d'une LineString en mètres
      let total = 0;
      for (let i = 1; i < coords.length; i++) {
        total += this.getDistance(coords[i - 1], coords[i]);
      }
      return total;
    },
    getDistance(coord1, coord2) {
      // Haversine formula
      const R = 6371000; // rayon de la Terre en mètres
      const toRad = (x) => x * Math.PI / 180;
      const [lon1, lat1] = coord1;
      const [lon2, lat2] = coord2;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    },

    toggleModalInfo() {
      this.showInfoModal = !this.showInfoModal;
    }
  }
}
</script>

<style scoped>
.district-map-sidebar {
  height: 100%;
  width: 100%;
  border-radius: 4;
  display: flex;
}

.map-container {
  position: relative;
  height: 100%;
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

.map-info {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
  padding: 5px;
}

.zoom-btn {
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.info-button {
  cursor: pointer;
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

.legend-container {
  padding: 0px 15px;
  border-radius: 8px;
  width: 100%;
}

/* Color Swatch Base Styles - More than 3 attributes, remains in <style> */
.color-swatch {
  width: 20%;
  height: 24px;
  border-radius: 4px;
  margin-right: 16px;
  flex-shrink: 0;
}

/* Text Container for title and description - Exactly 1 attribute, inlined */
/* .text-content { flex-grow: 1; } -> This will be inline */

/* Title of the legend item - More than 3 attributes, remains in <style> */
.legend-title {
  font-weight: 600;
  font-size: 1.125rem;
  color: #3b5d4e;
  margin-bottom: 4px;
  line-height: 1.25;
}

/* Remove margin from the last legend item - Must remain in <style> for pseudo-class */
.legend-item:last-child {
  margin-bottom: 0;
}
</style>