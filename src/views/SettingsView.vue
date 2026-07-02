<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import LobbyLayout from '@/layouts/LobbyLayout.vue'
import { useSettingsStore } from '@/stores/settings'
import type { BotDifficulty } from '@/bots/BotPlayer'
import { showConfirmDialog, showToast } from 'vant'

const settings = useSettingsStore()
const { isDark, soundEnabled, defaultBotDifficulty } = storeToRefs(settings)

const DIFFICULTY_LABEL: Record<BotDifficulty, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
}

const difficultyText = computed(
  () => DIFFICULTY_LABEL[defaultBotDifficulty.value] ?? defaultBotDifficulty.value,
)

async function onClearCache() {
  await showConfirmDialog({
    title: '清除缓存',
    message: '将清除房间记录、AI 难度、音效开关及麻将自定义规则，恢复默认设置。',
  })
  settings.clearCache()
  showToast('已清除')
}
</script>

<template>
  <LobbyLayout title="设置">
    <van-cell-group inset title="偏好">
      <van-cell title="暗色模式">
        <template #right-icon>
          <van-switch v-model="isDark" size="20" />
        </template>
      </van-cell>
      <van-cell title="音效">
        <template #right-icon>
          <van-switch v-model="soundEnabled" size="20" />
        </template>
      </van-cell>
      <van-cell title="默认 AI 难度" :value="difficultyText" />
    </van-cell-group>

    <van-cell-group inset title="关于" style="margin-top: 12px">
      <van-cell title="版本" value="1.0.0" />
      <van-cell title="AI 说明" label="所有机器人本地运行，无 API，永久免费" />
      <van-cell title="清除本地缓存" is-link @click="onClearCache" />
    </van-cell-group>
  </LobbyLayout>
</template>
