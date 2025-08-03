import { reactive } from 'vue'

export const store = reactive({
  year: "",
  type: "",
  geojsonReseau: null,
  arrondissement: "",
  passageCsvs: [],
  protectedLane: true,
  sharedLane: true,
  networkType: 'saisonnier',
  token: undefined,
  // Nouvelles propriétés pour les pistes populaires
  dateFrom: "",
  dateTo: "",
  showPopularPistes: false,
  triggerPopularPistesUpdate: false,
  // Filtres pour les points d'intérêt
  pointInteretFilters: {
    arrondissement: "",
    type: ""
  },
  // Filtres pour les statistiques
  statistiquesFilters: {
    statut: "",
    arrondissement: ""
  }
})