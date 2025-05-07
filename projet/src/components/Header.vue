<script setup>
// Pas besoin de props ni de logique complexe pour un header simple
</script>

<template>
  <v-app-bar class="bg-light-green-lighten-3 border-b-lg">
    <v-app-bar-title>
      <v-icon class="mr-2 text-grey-darken-3">mdi-bike</v-icon>
      Vélo Facile
    </v-app-bar-title>
    <v-spacer />
    <!-- Navigation avec router-link -->
    <v-btn class="pr-3" text to="/" tag="router-link">
      Accueil
    </v-btn>
    <v-btn class="pr-3" text to="/reseau" tag="router-link">
      Réseau Cyclable
    </v-btn>
    <v-btn class="pr-3" text to="/statistiques" tag="router-link">
      Statistiques
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