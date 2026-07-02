<script setup lang="ts">
defineProps<{ title?: string }>()
</script>

<template>
  <div class="lobby-layout">
    <van-nav-bar :title="title ?? '棋牌乐园'" fixed placeholder />
    <div class="page-content">
      <slot />
    </div>
  </div>
</template>
