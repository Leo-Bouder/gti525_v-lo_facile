import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

// 1. Import Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import '@mdi/font/css/materialdesignicons.css'
// 2. Créer l'instance de Vuetify
const vuetify = createVuetify({
  components,
  directives,
})

const app = createApp(App);
app.use(router);
app.use(vuetify);

app.mount('#app');
