<script setup lang="ts">
import { computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'

const settings = useSettingsStore()
const theme = computed(() => (settings.isDark ? 'dark' : 'light'))
</script>

<template>
  <van-config-provider :theme="theme">
    <router-view />
  </van-config-provider>
</template>
