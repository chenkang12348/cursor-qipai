<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import LobbyLayout from '@/layouts/LobbyLayout.vue'
import { useRoomStore } from '@/stores/room'
import { useGameFlow } from '@/composables/useGameFlow'
import {
  GUANGDONG_RULE,
  GUOBIAO_RULE,
  SICHUAN_RULE,
  loadCustomRules,
  saveCustomRule,
  setActiveRule,
} from './rules/presets'
import type { MahjongRuleConfig } from './types/ruleConfig'
import { showToast } from 'vant'

const router = useRouter()
const roomStore = useRoomStore()
const gameFlow = useGameFlow('mahjong')

const activeTab = ref(0)
const customName = ref('我的规则')
const customRule = ref<MahjongRuleConfig>({
  ...SICHUAN_RULE,
  id: `custom-${Date.now()}`,
  name: '自定义规则',
  baseVariant: 'custom',
})

const savedCustom = loadCustomRules()

function selectPreset(rule: MahjongRuleConfig) {
  setActiveRule(rule.id)
  showToast(`已选择：${rule.name}`)
}

function startWithPreset(rule: MahjongRuleConfig) {
  selectPreset(rule)
  router.push({ name: 'mahjong-play' })
}

function saveAndStart() {
  customRule.value.name = customName.value || '自定义规则'
  saveCustomRule({ ...customRule.value })
  setActiveRule(customRule.value.id)
  router.push({ name: 'mahjong-play' })
}

onMounted(() => {
  if (!roomStore.setup || roomStore.setup.gameId !== 'mahjong') {
    router.replace({ name: 'setup', params: { gameId: 'mahjong' } })
  }
})
</script>

<template>
  <LobbyLayout title="麻将规则">
    <van-nav-bar left-arrow @click-left="gameFlow.goSetup()" />
    <van-notice-bar text="选择规则后进入牌桌 · 四川血战需定缺" />
    <van-tabs v-model:active="activeTab">
      <van-tab title="四川">
        <van-cell-group inset>
          <van-cell title="四川血战" label="缺一门 · 血战到底 · 108张" />
          <van-cell title="吃牌" value="不可吃" />
        </van-cell-group>
        <div style="padding: 16px">
          <van-button type="primary" block round @click="startWithPreset(SICHUAN_RULE)">
            开始 · 四川血战
          </van-button>
        </div>
      </van-tab>
      <van-tab title="广东">
        <van-cell-group inset>
          <van-cell title="广东推倒胡" label="136张含字牌 · 无定缺" />
        </van-cell-group>
        <div style="padding: 16px">
          <van-button type="primary" block round @click="startWithPreset(GUANGDONG_RULE)">
            开始 · 广东推倒胡
          </van-button>
        </div>
      </van-tab>
      <van-tab title="国标">
        <van-cell-group inset>
          <van-cell title="国标麻将" label="8番起和 · 无定缺" />
        </van-cell-group>
        <div style="padding: 16px">
          <van-button type="primary" block round @click="startWithPreset(GUOBIAO_RULE)">
            开始 · 国标麻将
          </van-button>
        </div>
      </van-tab>
      <van-tab title="自定义">
        <van-cell-group inset>
          <van-field v-model="customName" label="规则名称" />
          <van-cell title="缺一门">
            <template #right-icon>
              <van-switch v-model="customRule.winRules.queMen" size="20" />
            </template>
          </van-cell>
          <van-cell title="血战到底">
            <template #right-icon>
              <van-switch v-model="customRule.winRules.xueZhan" size="20" />
            </template>
          </van-cell>
          <van-cell title="可碰">
            <template #right-icon>
              <van-switch v-model="customRule.actions.peng" size="20" />
            </template>
          </van-cell>
          <van-cell title="起和番数">
            <template #value>
              <van-stepper v-model="customRule.winRules.minFan" :min="0" :max="8" />
            </template>
          </van-cell>
          <van-cell title="含字牌">
            <template #right-icon>
              <van-switch v-model="customRule.tileSet.includeHonors" size="20" />
            </template>
          </van-cell>
        </van-cell-group>
        <van-cell-group v-if="savedCustom.length" inset title="已保存" style="margin-top: 12px">
          <van-cell
            v-for="r in savedCustom"
            :key="r.id"
            :title="r.name"
            is-link
            @click="startWithPreset(r)"
          />
        </van-cell-group>
        <div style="padding: 16px">
          <van-button type="primary" block round @click="saveAndStart">保存并开始</van-button>
        </div>
      </van-tab>
    </van-tabs>
  </LobbyLayout>
</template>
