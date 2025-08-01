<template>
  <v-dialog :model-value="show" @update:model-value="$emit('close')" max-width="600px" persistent>
    <v-card>
      <v-card-title class="text-h5">
        {{ isEditing ? 'Modifier' : 'Ajouter' }} un point d'intérêt
      </v-card-title>

      <v-card-text>
        <v-form ref="form" v-model="valid">
          <v-row>
            <v-col cols="12" md="6">
              <v-select v-model="formData.Type" :items="types" label="Type *" required
                :rules="[v => !!v || 'Le type est requis']"></v-select>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field v-model="formData.Arrondissement" label="Arrondissement *" required
                :rules="[v => !!v || 'L\'arrondissement est requis']"></v-text-field>
            </v-col>

            <v-col cols="12">
              <v-text-field v-model="formData.Nom_parc_lieu" label="Nom du parc/lieu *" required
                :rules="[v => !!v || 'Le nom est requis']"></v-text-field>
            </v-col>

            <v-col cols="12">
              <v-text-field v-model="formData.Proximite_jeux_repere" label="Proximité jeux repère *" required
                :rules="[v => !!v || 'La proximité jeux repère est requise']"></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field v-model="formData.Intersection" label="Intersection"></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field v-model="formData.Etat" label="État"></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field v-model="formData.Date_installation" label="Date d'installation" type="date"></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field v-model="formData.Precision_localisation" label="Précision localisation"></v-text-field>
            </v-col>

            <v-col cols="12">
              <v-textarea v-model="formData.Remarque" label="Remarque" rows="3"></v-textarea>
            </v-col>

            <!-- Champs de coordonnées pour les fontaines -->
            <template v-if="formData.Type === 'Fontaine'">
              <v-col cols="12" md="6">
                <v-text-field v-model="formData.Longitude" label="Longitude *" type="number" step="0.000001" required
                  :rules="[v => !!v || 'La longitude est requise pour une fontaine']"></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field v-model="formData.Latitude" label="Latitude *" type="number" step="0.000001" required
                  :rules="[v => !!v || 'La latitude est requise pour une fontaine']"></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field v-model="formData.X" label="Coordonnée X" type="number" step="0.01"></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field v-model="formData.Y" label="Coordonnée Y" type="number" step="0.01"></v-text-field>
              </v-col>
            </template>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey" variant="text" @click="close">
          Annuler
        </v-btn>
        <v-btn color="primary" @click="save" :loading="loading" :disabled="!valid">
          {{ isEditing ? 'Modifier' : 'Ajouter' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import axios from 'axios';
import { store } from './store';

const props = defineProps({
  show: Boolean,
  point: Object,
  isEditing: Boolean
});

const emit = defineEmits(['close', 'saved']);

const form = ref(null);
const valid = ref(false);
const loading = ref(false);

const types = ['Fontaine', 'Atelier', 'Stationnement', 'Autre'];

const formData = ref({
  Type: '',
  Arrondissement: '',
  Nom_parc_lieu: '',
  Proximite_jeux_repere: '',
  Intersection: '',
  Etat: '',
  Date_installation: '',
  Remarque: '',
  Precision_localisation: '',
  X: null,
  Y: null,
  Longitude: null,
  Latitude: null
});

// Réinitialiser le formulaire quand on ouvre le modal
watch(() => props.show, (newVal) => {
  if (newVal) {
    if (props.isEditing && props.point) {
      // Mode édition - remplir avec les données existantes
      Object.keys(formData.value).forEach(key => {
        formData.value[key] = props.point[key] || '';
      });
    } else {
      // Mode ajout - réinitialiser
      Object.keys(formData.value).forEach(key => {
        formData.value[key] = key === 'X' || key === 'Y' || key === 'Longitude' || key === 'Latitude' ? null : '';
      });
    }
  }
});

const close = () => {
  emit('close');
};

const save = async () => {
  if (!form.value.validate()) return;

  loading.value = true;

  try {
    const url = props.isEditing
      ? `http://localhost:8000/gti525/v1/pointsdinteret/${props.point.ID}`
      : 'http://localhost:8000/gti525/v1/pointsdinteret';

    const method = props.isEditing ? 'patch' : 'post';

    const response = await axios[method](url, formData.value, {
      headers: {
        'Authorization': `Bearer ${store.token}`
      }
    });

    emit('saved', response.data);
    close();
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    alert('Erreur lors de la sauvegarde: ' + (error.response?.data?.error || error.message));
  } finally {
    loading.value = false;
  }
};
</script>