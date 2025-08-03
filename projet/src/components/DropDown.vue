<template>
  <div class="select-container">
    <v-select
      :items="realItems"
      v-model="model"
      :density="size"
      :label="title"
      item-title="text"
      item-value="value"
      variant="outlined"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  modelValue: [String, Number, null],
  items: {
    type: Array,
    required: true
  },
  size: {
    type: String,
    default: 'comfortable'
  },
  title: {
    type: String,
    default: 'Please select an option'
  }
})

const realItems = computed(() => {
  return [{ text: "Tous", value: "ALL" }, ...props.items]
})

const emit = defineEmits(['update:modelValue', 'change'])

const model = computed({
  get: () => props.modelValue,
  set: (val) => {
    console.log("EMITTING"); 
    emit('update:modelValue', val);
    emit('change', val);
  }
})
</script>

<style scoped>
.select-container {
  display: flex;
  height: 100%;
}
</style>
