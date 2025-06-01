<script setup>
</script>

<template>
  <v-app-bar class="bg-light-green-lighten-3 border-b-lg">
    <v-app-bar-title class="text-left">
      <RouterLink to="/"  custom v-slot="{ navigate, href }" tag="router-link">
        <div @click="navigate" :href="href" style="cursor: pointer;" class="d-flex align-center">
          <img src="../assets/logo.png" alt="Logo Vélo Facile" style="height: 40px; margin-right: 12px;">
          <span style="font-size: 2rem;">Vélo Facile</span>
        </div>
      </RouterLink>
    </v-app-bar-title>
    <v-spacer />
    <!-- Navigation avec router-link -->
    <v-btn class="pr-3" text to="/reseau" tag="router-link">
      Réseau Cyclable
    </v-btn>
    <v-btn class="pr-3" text to="/statistiques" tag="router-link">
      Statistiques
    </v-btn>
    <v-btn class="pr-3" text to="/poi" tag="router-link">
      Points d'intérêt
    </v-btn>
    <v-btn text to="/connexion" tag="router-link">
      Se connecter
    </v-btn>
    <v-btn class="pr-3" text to="/inscription" tag="router-link">
      S'inscrire
    </v-btn>
  </v-app-bar>
</template>

<style scoped>

</style>