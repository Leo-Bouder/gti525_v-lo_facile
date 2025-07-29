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
  token: undefined
})