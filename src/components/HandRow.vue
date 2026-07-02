<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  fan?: boolean
  flat?: boolean
  large?: boolean
  fit?: boolean
  count?: number
}>()

const gridCols = computed(() => Math.max(1, props.count ?? 1))

const fitStyle = computed(() =>
  props.fit ? ({ '--hand-cols': String(gridCols.value) } as Record<string, string>) : undefined,
)
</script>

<template>
  <div
    class="hand-row"
    :class="{
      'hand-row--fan': fan && !flat && !fit,
      'hand-row--flat': flat && !fit,
      'hand-row--fit': fit,
      'hand-row--large': large,
    }"
    :style="fitStyle"
  >
    <slot />
  </div>
</template>

<style scoped>
.hand-row {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  overflow-y: visible;
  padding: 8px 4px;
  align-items: flex-end;
  width: 100%;
}

.hand-row--flat {
  gap: 6px;
  padding: 4px 8px 8px;
  flex-wrap: nowrap;
}

.hand-row--flat :deep(> *) {
  margin-left: 0 !important;
  flex-shrink: 0;
}

.hand-row--fan {
  gap: 0;
  padding-left: 8px;
  padding-right: 24px;
}

.hand-row--fan :deep(> *) {
  margin-left: clamp(-18px, -5vw, -12px);
}

.hand-row--fan :deep(> *:first-child) {
  margin-left: 0;
}
</style>
