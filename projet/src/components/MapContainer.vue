<template>
    <v-card class="district-map-sidebar" elevation="0">
        <v-card-text class="pa-0">
            <div class="map-container mb-3">
                <div id="map" ref="mapContainer"></div>

                <div v-if="loading" class="map-loading-overlay">
                    <v-progress-circular indeterminate color="primary"></v-progress-circular>
                    <div class="mt-2">Chargement...</div>
                </div>

                <div class="map-controls">
                    <v-btn icon size="small" variant="outlined" class="zoom-btn mb-1" @click="zoomIn"
                        :disabled="loading">
                        <v-icon>mdi-plus</v-icon>
                    </v-btn>
                    <v-btn icon size="small" variant="outlined" class="zoom-btn" @click="zoomOut" :disabled="loading">
                        <v-icon>mdi-minus</v-icon>
                    </v-btn>
                </div>
            </div>
        </v-card-text>
    </v-card>
</template>

<script>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
export default {
    name: 'MapContainer',
    components: {
    },
    props: {
        records: {
            type: Array,
            default: () => []
        },
        center: {
            type: Array,
            default: () => [45.5017, -73.5673]
        },
        selectedId: {
            type: String,
            default: null
        },
        selectedArrondissement: {
            type: String,
            default: null
        }
    },
    data() {
        return {
            map: null,
            markerMap: new Map(),
            loading: true,
            layerGroup: null,
            geojsonLayer: null,
            geojsonData: null,
            currentLayer: null,
            defaultIcon: L.icon({
                iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAyNCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMEM1LjM3MjU4IDAgMCA1LjM3MjU4IDAgMTJDMCAyMiAxMiA0MCAxMiA0MEMxMiA0MCAyNCAyMiAyNCAxMkMyNCA1LjM3MjU4IDE4LjYyNzQgMCAxMiAwWiIgZmlsbD0iIzFGNzVCQyIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjQiIGZpbGw9IndoaXRlIi8+PC9zdmc+',
                iconSize: [24, 40],
                iconAnchor: [12, 40],
                popupAnchor: [0, -40]
            }),
            highlightedIcon: L.icon({
                iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAyNCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMEM1LjM3MjU4IDAgMCA1LjM3MjU4IDAgMTJDMCAyMiAxMiA0MCAxMiA0MEMxMiA0MCAyNCAyMiAyNCAxMkMyNCA1LjM3MjU4IDE4LjYyNzQgMCAxMiAwWiIgZmlsbD0iI0UzNEU0RSIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjQiIGZpbGw9IndoaXRlIi8+PC9zdmc+',
                iconSize: [24, 40],
                iconAnchor: [12, 40],
                popupAnchor: [0, -40]
            }),
            selectedMarker: null
        }
    },
    mounted() {
        if(!this.map) {
            this.initMap()
        }
    },
    watch: {
        selectedArrondissement() {
            if (this.map && this.layerGroup) {
                this.createMarkerLayer();
                this.setMarker(this.selectedId);
            }
        },
        records() {
            if (this.map && this.layerGroup) {
                this.createMarkerLayer();
                this.setMarker(this.selectedId);
            }
        }
    },
    beforeUnmount() {
        if (this.map) {
            this.map.remove()
        }
    },
    methods: {
        initMap() {
            this.map = L.map(this.$refs.mapContainer, {
                center: this.center,
                zoom: 11,
                zoomControl: false,
                attributionControl: false
            })

            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '© OpenStreetMap contributors © CARTO',
                subdomains: 'abcd',
                maxZoom: 19
            }).addTo(this.map)

            if (!this.layerGroup) {
                this.createMarkerLayer();
            }
            this.setMarker(this.selectedId);

            this.loading = false;
            
            // Charger la carte GeoJSON des arrondissements
            this.loadGeoJsonData();
        },
        
        async loadGeoJsonData() {
            try {
                const response = await fetch('http://localhost:8000/gti525/v1/territoiresGeo');
                this.geojsonData = await response.json();
                
                if (this.map && this.geojsonData) {
                    this.addGeoJsonLayer();
                }
            } catch (error) {
                console.error('Error loading GeoJSON data:', error);
            }
        },
        
        addGeoJsonLayer() {
            if (this.geojsonLayer) {
                this.map.removeLayer(this.geojsonLayer);
            }
            
            this.geojsonLayer = L.geoJSON(this.geojsonData, {
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
                        });
                    });
                    
                    layer.on('mouseout', () => {
                        if(this.layerIsSelected(layer)){return;}
                        layer.setStyle({
                            fillOpacity: 0.3,
                            fillColor: '#e0e0e0'
                        });
                    });
                    
                    layer.on('click', () => {
                        // Émettre un événement pour notifier le parent
                        this.$emit('arrondissement-clicked', feature.properties.NOM);
                        
                        // Mettre en évidence l'arrondissement sélectionné
                        const layer = this.getLayerByTerritoryName(feature.properties.NOM);
                        this.setLayer(layer);
                    });
                }
            }).addTo(this.map);
        },
        
        setLayer(layer) {
            if(!layer){
                if(this.currentLayer){
                    this.currentLayer.setStyle({
                        fillOpacity: 0.3,
                        fillColor:'#e0e0e0'
                    });
                }
                this.currentLayer = null;
                return;
            }
            layer.setStyle({
                fillOpacity: 0.5,
                fillColor: '#F9BF90'
            });
            if(this.currentLayer) {
                this.currentLayer.setStyle({
                    fillOpacity: 0.3,
                    fillColor: '#e0e0e0'
                });
            }
            this.currentLayer = layer;
        },
        
        getLayerByTerritoryName(territoryName) {
            if (!this.geojsonLayer) {
                return null;
            }
            
            let foundLayer = null;
            
            this.geojsonLayer.eachLayer((layer) => {
                const properties = layer.feature.properties;
                if (properties && properties.NOM === territoryName) {
                    foundLayer = layer;
                }
            });
            
            return foundLayer;
        },
        
        layerIsSelected(layer) {
            return layer.options.fillColor === "#F9BF90";
        },

        setMarker(id, click) {
            const foundMarker = this.markerMap.get(id);
            if (foundMarker) {
                if(this.selectedMarker){
                    this.selectedMarker.setIcon(this.defaultIcon);
                    this.selectedMarker.setZIndexOffset(455);
                }
                foundMarker.setIcon(this.highlightedIcon);
                this.map.panTo(foundMarker.getLatLng());
                if (foundMarker.getPopup() && !click) {
                    foundMarker.openPopup();
                }
                foundMarker.setZIndexOffset(500);
                this.selectedMarker = foundMarker;
            }
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

        createMarkerLayer() {
            if(this.layerGroup) {
                this.map.removeLayer(this.layerGroup);
            }
            this.layerGroup = L.layerGroup();
            this.markerMap.clear();

            let markersAdded = 0;
            for (const record of this.records) {
                const id = record.ID;
                const lat = record.Latitude;
                const lng = record.Longitude;
                const name = record.Nom || (record.Nom_parc_lieu || `Marker ${id}`);
                const arrondissement = record.Arrondissement;

                // Filtrer par arrondissement si spécifié
                if (this.selectedArrondissement && arrondissement !== this.selectedArrondissement) {
                    continue;
                }

                if (id === undefined || id === null || isNaN(lat) || isNaN(lng)) {
                    continue;
                }

                try {
                    const marker = L.marker([lat, lng], {icon: this.defaultIcon});
                    marker.id = id;
                    marker.on("click", (e) => {
                        this.setMarker(e.target.id, true)
                    })
                    
                    // Popup enrichi avec plus d'informations
                    const popupContent = `
                        <div style="min-width: 200px;">
                            <b>${name}</b><br>
                            <small>ID: ${id}</small><br>
                            <small>Arrondissement: ${arrondissement || 'N/A'}</small><br>
                            <small>Type: ${record.Type || 'N/A'}</small>
                        </div>
                    `;
                    marker.bindPopup(popupContent);

                    this.layerGroup.addLayer(marker);
                    this.markerMap.set(String(id), marker);
                    markersAdded++;
                } catch (error) {
                    console.log(`Error creating marker for record: ${JSON.stringify(record)} - ${error.message}`);
                }
            }

            if (markersAdded > 0) {
                this.layerGroup.addTo(this.map);
                console.log(`Added ${markersAdded} markers for arrondissement: ${this.selectedArrondissement || 'All'}`);
            } else {
                console.log('No valid markers were found in the CSV data after parsing.');
            }
        },
    }
}
</script>

<style scoped>
.district-map-sidebar {
    height: 100%;
    width: 100%;
    background-color: var(--background-color);
    border-radius: 0;
}

.map-container {
    position: relative;
    height: 60vh;
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
    background-color: var(--background-color);
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
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

.filter-label {
    margin-bottom: 0.2rem;
    font-weight: bold;
    text-align: left;
    font-size: 14px;
    color: #333;
    width: 100%;
}

.toggle-group {
    width: 100%;
    max-width: 250px;
    background-color: #d1d8c0;
    border-radius: 8px;
    overflow: hidden;
}
</style>