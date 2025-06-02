<script setup>
import { ref, watch, computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  items: {
    type: Array,
    default: () => []
  },
  displayFields: {
    type: Array,
    default: () => ['ID', 'Nom', 'Statut', 'Annee_implante']
  }
});

const emit = defineEmits(['update:modelValue']);

const search = ref(props.modelValue);

watch(search, (newValue) => {
  emit('update:modelValue', newValue);
});

watch(() => props.modelValue, (newValue) => {
  search.value = newValue;
});

const filteredResults = computed(() => {
  if (!search.value) return [];
  
  return props.items.filter(item => {
    return Object.values(item).some(value => 
      String(value).toLowerCase().includes(search.value.toLowerCase())
    );
  });
});
</script>

<template>
  <div class="pt-4 px-4">
    <v-text-field
      v-model="search"
      label="Rechercher"
      prepend-inner-icon="mdi-magnify"
      clearable
      hide-details
      variant="outlined"
      density="comfortable"
      class="flex-grow-1"
    ></v-text-field>
  </div>
</template>