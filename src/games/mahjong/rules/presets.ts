import type { MahjongRuleConfig } from '../types/ruleConfig'

export const SICHUAN_RULE: MahjongRuleConfig = {
  id: 'sichuan',
  name: '四川血战',
  baseVariant: 'sichuan',
  tileSet: { suits: ['tong', 'tiao', 'wan'], includeHonors: false, includeFlowers: false },
  actions: { chi: false, peng: true, gang: true, qiangGang: true },
  winRules: { queMen: true, minFan: 0, xueZhan: true, lastFourMustHu: true, yiPaoDuoXiang: true },
  scoring: { ziMoDouble: true, gangShangHua: true, dianGangHua: true, chaJiao: true, chaHuaZhu: true },
}

export const GUANGDONG_RULE: MahjongRuleConfig = {
  id: 'guangdong',
  name: '广东推倒胡',
  baseVariant: 'guangdong',
  tileSet: { suits: ['tong', 'tiao', 'wan'], includeHonors: true, includeFlowers: false },
  actions: { chi: false, peng: true, gang: true, qiangGang: false },
  winRules: { queMen: false, minFan: 0, xueZhan: false, lastFourMustHu: false, yiPaoDuoXiang: false },
  scoring: { ziMoDouble: false, gangShangHua: true, dianGangHua: false, chaJiao: false, chaHuaZhu: false },
}

export const GUOBIAO_RULE: MahjongRuleConfig = {
  id: 'guobiao',
  name: '国标麻将',
  baseVariant: 'guobiao',
  tileSet: { suits: ['tong', 'tiao', 'wan'], includeHonors: true, includeFlowers: false },
  actions: { chi: false, peng: true, gang: true, qiangGang: true },
  winRules: { queMen: false, minFan: 8, xueZhan: false, lastFourMustHu: false, yiPaoDuoXiang: false },
  scoring: { ziMoDouble: false, gangShangHua: true, dianGangHua: false, chaJiao: false, chaHuaZhu: false },
}

export const PRESET_RULES = [SICHUAN_RULE, GUANGDONG_RULE, GUOBIAO_RULE]

const KEY_CUSTOM = 'dt:mahjong:customRules'
const KEY_ACTIVE = 'dt:mahjong:activeRule'
const LEGACY_CUSTOM = 'mahjong:customRules'
const LEGACY_ACTIVE = 'mahjong:activeRule'

function migrateLegacyStorage(): void {
  const legacyCustom = localStorage.getItem(LEGACY_CUSTOM)
  if (legacyCustom && !localStorage.getItem(KEY_CUSTOM)) {
    localStorage.setItem(KEY_CUSTOM, legacyCustom)
    localStorage.removeItem(LEGACY_CUSTOM)
  }
  const legacyActive = localStorage.getItem(LEGACY_ACTIVE)
  if (legacyActive && !localStorage.getItem(KEY_ACTIVE)) {
    localStorage.setItem(KEY_ACTIVE, legacyActive)
    localStorage.removeItem(LEGACY_ACTIVE)
  }
}

export function loadCustomRules(): MahjongRuleConfig[] {
  migrateLegacyStorage()
  try {
    const raw = localStorage.getItem(KEY_CUSTOM)
    return raw ? (JSON.parse(raw) as MahjongRuleConfig[]) : []
  } catch {
    return []
  }
}

export function saveCustomRule(rule: MahjongRuleConfig): void {
  const list = loadCustomRules()
  const idx = list.findIndex((r) => r.id === rule.id)
  if (idx >= 0) list[idx] = rule
  else list.push(rule)
  localStorage.setItem(KEY_CUSTOM, JSON.stringify(list))
}

export function getActiveRule(): MahjongRuleConfig {
  migrateLegacyStorage()
  const id = localStorage.getItem(KEY_ACTIVE) ?? 'sichuan'
  const custom = loadCustomRules().find((r) => r.id === id)
  if (custom) return custom
  return PRESET_RULES.find((r) => r.id === id) ?? SICHUAN_RULE
}

export function setActiveRule(id: string): void {
  localStorage.setItem(KEY_ACTIVE, id)
}
