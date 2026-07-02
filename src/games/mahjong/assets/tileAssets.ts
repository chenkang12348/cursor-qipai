import type { Tile } from '@/games/mahjong/types/ruleConfig'

/**
 * FluffyStuff/riichi-mahjong-tiles (CC0 1.0)
 * https://github.com/FluffyStuff/riichi-mahjong-tiles
 */
const TILE_BASE = `${import.meta.env.BASE_URL}mahjong-tiles`

const HONOR_FILE: Record<string, string> = {
  dong: 'Ton.svg',
  nan: 'Nan.svg',
  xi: 'Shaa.svg',
  bei: 'Pei.svg',
  zhong: 'Chun.svg',
  fa: 'Hatsu.svg',
  bai: 'Haku.svg',
}

const SUIT_PREFIX: Record<'wan' | 'tiao' | 'tong', string> = {
  wan: 'Man',
  tiao: 'Sou',
  tong: 'Pin',
}

export function getTileImageUrl(tile: Tile): string {
  if (tile.suit === 'wan' || tile.suit === 'tiao' || tile.suit === 'tong') {
    const prefix = SUIT_PREFIX[tile.suit]
    const rank = Math.min(9, Math.max(1, tile.rank))
    return `${TILE_BASE}/${prefix}${rank}.svg`
  }
  const file = HONOR_FILE[tile.suit]
  return file ? `${TILE_BASE}/${file}` : `${TILE_BASE}/Blank.svg`
}

export const TILE_BACK_URL = `${TILE_BASE}/Back.svg`
