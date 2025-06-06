<script>
import { watch } from 'vue';
import SideMenu from './SideMenu.vue';
import {store} from "./store"
export default {
  components: { 
    SideMenu
 },
  data() {
    return {
      year: ''
    }
  },
  methods: {
  },
  props: {
    haveMenu: true
  }
}
</script>

<template>
    <div style="display: flex; height: 100%;">
        <SideMenu 
            v-if="haveMenu===true"
        />
        <div style="display: flex; align-items: center; flex: 1; flex-direction: column;">
            <div class="main-container">
                <slot></slot>
            </div>
        </div>
    </div>
</template>

<style scoped></style>