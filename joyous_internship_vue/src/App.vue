<script setup>
import leftheader from './components/Unnecessary/leftheader.vue'
import rightheader from './components/Headers/rightheader.vue'
import OptionsAPI from './components/Unnecessary/OptionsAPI.vue'
import Counter from './components/Unnecessary/counter.vue'
import { useCounterStore } from '@/stores/counter'

import { RouterLink, RouterView } from 'vue-router'

</script>

<template>

<div>
    <rightheader
        header = "Item Trading"
    ></rightheader></div>

    <RouterView />
</template>

<style scoped>
</style>

