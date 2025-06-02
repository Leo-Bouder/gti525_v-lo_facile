import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Reseau from '../views/Reseau.vue'
import Statistiques from '../views/Statistiques.vue'
import PointsInteret from '../views/PointsInteret.vue'
import Connexion from '../views/Connexion.vue'
import Inscription from '../views/Inscription.vue'
import Savoir from '../views/Savoir.vue'
import Interet from '../views/Points_Interet.vue'
const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/reseau', name: 'Reseau', component: Reseau },
  { path: '/statistiques', name: 'Statistiques', component: Statistiques },
  { path: '/poi', name: 'PointsInteret', component: PointsInteret },
  { path: '/connexion', name: 'Connexion', component: Connexion },
  { path: '/inscription', name: 'Inscription', component: Inscription },
  { path: '/savoir', name: 'Savoir', component: Savoir },
  { path: '/interet', name: 'Interet', component: Interet },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router