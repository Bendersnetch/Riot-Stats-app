<template>
  <div class="container mx-auto p-4 space-y-6">
    <NuxtLink to="/champions" class="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400">
      <span aria-hidden="true">←</span>
      Back to champions
    </NuxtLink>

    <div v-if="loading" class="flex justify-center py-16">
      <Loading />
    </div>

    <div v-else-if="error" class="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-200">
      <p class="font-semibold">{{ error }}</p>
      <button
        type="button"
        class="self-start rounded-md bg-red-600 px-3 py-1 text-sm font-medium text-white transition hover:bg-red-500 dark:bg-red-500 dark:hover:bg-red-400"
        @click="fetchChampionStats"
      >
        Retry
      </button>
    </div>

    <div v-else-if="championStats" class="space-y-6">
      <div class="space-y-6 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <div class="flex flex-col gap-6 md:flex-row md:items-center">
          <img
            v-if="championImage"
            :src="championImage"
            :alt="championName"
            class="h-24 w-24 rounded-lg object-cover ring-2 ring-gray-200 dark:ring-gray-700"
            @error="onImgError"
          />
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ championName }}</h1>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Total Games" :value="totalGames" />
          <StatCard label="Wins" :value="wins" accent="text-emerald-500" />
          <StatCard label="Losses" :value="losses" accent="text-rose-500" />
          <StatCard label="Win Rate" :value="`${winRate}%`" accent="text-indigo-500" />
        </div>
      </div>

      <div v-if="performanceMetrics.length" class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 class="mb-4 text-xl font-bold">Performance Snapshot</h2>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard v-for="metric in performanceMetrics" :key="metric.label" :label="metric.label" :value="metric.value" />
        </div>
      </div>

      <div v-if="laneStats.length" class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 class="text-xl font-bold mb-4">Lane Performance</h2>
        <ul class="divide-y divide-gray-200 dark:divide-gray-700">
          <li v-for="lane in laneStats" :key="lane.label" class="py-3 flex items-center justify-between">
            <div class="font-medium">{{ lane.label }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">{{ lane.games }} games • {{ lane.winrate }} win rate</div>
          </li>
        </ul>
      </div>

      <div v-if="itemSections.length" class="grid gap-6 md:grid-cols-2">
        <div v-for="section in itemSections" :key="section.title" class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 class="text-xl font-bold mb-3">{{ section.title }}</h2>
          <ul class="space-y-2">
            <li v-for="build in section.entries" :key="build.label" class="flex items-center justify-between text-sm">
              <span class="truncate">{{ build.label }}</span>
              <span class="text-gray-600 dark:text-gray-400">{{ build.detail }}</span>
            </li>
          </ul>
        </div>
      </div>

      <div v-if="runeSets.length || summonerSpells.length" class="grid gap-6 md:grid-cols-2">
        <div v-if="runeSets.length" class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 class="text-xl font-bold mb-3">Rune Pages</h2>
          <ul class="space-y-3">
            <li v-for="set in runeSets" :key="set.label" class="flex items-center justify-between text-sm">
              <span class="truncate">{{ set.label }}</span>
              <span class="text-gray-600 dark:text-gray-400">{{ set.detail }}</span>
            </li>
          </ul>
        </div>
        <div v-if="summonerSpells.length" class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 class="text-xl font-bold mb-3">Summoner Spells</h2>
          <ul class="space-y-2 text-sm">
            <li v-for="spell in summonerSpells" :key="spell.label" class="flex items-center justify-between">
              <span class="truncate">{{ spell.label }}</span>
              <span class="text-gray-600 dark:text-gray-400">{{ spell.detail }}</span>
            </li>
          </ul>
        </div>
      </div>

      <div v-if="matchupSections.length" class="grid gap-6 md:grid-cols-2">
        <div v-for="section in matchupSections" :key="section.title" class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 class="text-xl font-bold mb-3">{{ section.title }}</h2>
          <ul class="space-y-2 text-sm">
            <li v-for="entry in section.entries" :key="section.title + ':' + entry.label" class="flex items-center justify-between">
              <span class="truncate">{{ entry.label }}</span>
              <span class="text-gray-600 dark:text-gray-400">{{ entry.detail }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div v-else class="rounded-lg border border-gray-200 bg-white p-6 text-gray-600 shadow dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
      Select a champion to view stats.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, defineComponent } from 'vue'
import { useRoute } from 'vue-router'
import { useApi } from '~/composables/useApi'
import type { ChampionStats } from '~/types/api'
import Loading from '~/components/Loading.vue'

const route = useRoute()
const api = useApi()

const loading = ref(true)
const error = ref<string | null>(null)
type StatsRecord = ChampionStats & Record<string, any>

const championStats = ref<StatsRecord | null>(null)

const championParam = computed(() => {
  const raw = route.params.champion
  if (typeof raw === 'string') return decodeURIComponent(raw)
  if (Array.isArray(raw)) return decodeURIComponent(raw[0] ?? '')
  return ''
})

const championName = computed(() => championStats.value?.championName || championStats.value?.name || championStats.value?.champion || championParam.value)
const championTitle = computed(() => championStats.value?.title || championStats.value?.championTitle || '')
const wins = computed(() => Number(championStats.value?.wins ?? championStats.value?.totalWins ?? 0))
const totalGames = computed(() => {
  const stats = championStats.value
  if (!stats) return 0
  if (stats.totalGames != null) return Number(stats.totalGames)
  if ((stats as StatsRecord).games != null) return Number((stats as StatsRecord).games)
  if ((stats as StatsRecord).count != null) return Number((stats as StatsRecord).count)
  const losses = Number(stats.losses ?? stats.totalLosses ?? 0)
  return wins.value + losses
})
const losses = computed(() => {
  const explicit = championStats.value?.losses ?? championStats.value?.totalLosses
  if (explicit != null) return Number(explicit)
  return Math.max(totalGames.value - wins.value, 0)
})
const winRate = computed(() => {
  if (championStats.value?.winrate != null) return Number(championStats.value.winrate).toFixed(1)
  if (!totalGames.value) return '0.0'
  return ((wins.value / totalGames.value) * 100).toFixed(1)
})

const sanitizeChampionKey = (value?: string | null) => {
  if (!value) return ''
  return String(value).replace(/[^A-Za-z0-9]/g, '')
}

const championImagePath = (value?: string | null) => {
  const key = sanitizeChampionKey(value)
  if (!key) return ''
  return `/tiles/${key}_0.jpg`
}

const championImage = computed(() => {
  const candidates = [
    championStats.value?.tileName,
    championStats.value?.championName,
    championStats.value?.name,
    championParam.value,
  ]
  for (const candidate of candidates) {
    const path = championImagePath(candidate)
    if (path) return path
  }
  return ''
})

const performanceMetrics = computed(() => {
  if (!championStats.value) return [] as { label: string; value: string }[]
  const s: StatsRecord = championStats.value
  const metrics: { label: string; value: string }[] = []
  const avgKills = s.avgKills ?? s.averageKills
  const avgDeaths = s.avgDeaths ?? s.averageDeaths
  const avgAssists = s.avgAssists ?? s.averageAssists
  if (avgKills != null && avgDeaths != null && avgAssists != null) {
    metrics.push({ label: 'Average K/D/A', value: `${Number(avgKills).toFixed(1)}/${Number(avgDeaths).toFixed(1)}/${Number(avgAssists).toFixed(1)}` })
    const kda = (Number(avgKills) + Number(avgAssists)) / Math.max(1, Number(avgDeaths))
    metrics.push({ label: 'KDA Ratio', value: kda.toFixed(2) })
  } else if (s.kda != null) {
    metrics.push({ label: 'KDA Ratio', value: Number(s.kda).toFixed(2) })
  }
  const damagePerMinute = s.damagePerMinute ?? s.dpm ?? s.avgDamagePerMinute
  if (damagePerMinute != null) metrics.push({ label: 'Damage / Min', value: Math.round(Number(damagePerMinute)).toString() })
  const goldPerMinute = s.goldPerMinute ?? s.gpm ?? s.avgGoldPerMinute
  if (goldPerMinute != null) metrics.push({ label: 'Gold / Min', value: Math.round(Number(goldPerMinute)).toString() })
  const csPerMinute = s.csPerMinute ?? s.csPerMin ?? s.cspm
  if (csPerMinute != null) metrics.push({ label: 'CS / Min', value: Number(csPerMinute).toFixed(2) })
  const kp = s.killParticipation ?? s.kp
  if (kp != null) metrics.push({ label: 'Kill Participation', value: `${Number(kp).toFixed(1)}%` })
  return metrics
})

const buildLabel = (items: any) => {
  if (!items) return ''
  if (Array.isArray(items)) {
    return items.filter(Boolean).map((item: any) => item.itemName || item.name || item).join(' › ')
  }
  if (typeof items === 'object') {
    const values = Object.values(items)
    if (values.every(v => typeof v === 'string')) {
      return (values as string[]).join(' › ')
    }
  }
  return String(items)
}

const formatWinrate = (value?: number, winsCount?: number, gamesCount?: number) => {
  if (value != null) return `${Number(value).toFixed(1)}%`
  if (winsCount != null && gamesCount) return `${((winsCount / gamesCount) * 100).toFixed(1)}%`
  return '0.0%'
}

const laneStats = computed(() => {
  if (!championStats.value) return [] as { label: string; games: number; winrate: string }[]
  const s: StatsRecord = championStats.value
  const lanes = s.lanes ?? s.positions ?? s.roles ?? []
  if (!Array.isArray(lanes)) return []
  return lanes.slice(0, 5).map((lane: any) => ({
    label: lane.lane || lane.position || lane.role || lane.name,
    games: Number(lane.games ?? lane.count ?? 0),
    winrate: formatWinrate(lane.winrate, lane.wins, lane.games ?? lane.count)
  }))
})

const itemSections = computed(() => {
  if (!championStats.value) return [] as { title: string; entries: { label: string; detail: string }[] }[]
  const s: StatsRecord = championStats.value
  const sections: { title: string; entries: { label: string; detail: string }[] }[] = []
  const addSection = (title: string, builds: any, limit = 5) => {
    if (!builds) return
    const list = Array.isArray(builds) ? builds : [builds]
    const entries = list
      .filter(Boolean)
      .slice(0, limit)
      .map((b: any) => ({
        label: buildLabel(b.items ?? b.build ?? b),
        detail: `${formatWinrate(b.winrate, b.wins, b.games ?? b.count)} • ${(b.games ?? b.count ?? 0)} games`
      }))
      .filter(entry => entry.label)
    if (entries.length) sections.push({ title, entries })
  }
  addSection('Core Item Builds', s.coreItems ?? s.itemBuilds ?? s.items)
  addSection('Starting Items', s.startingItems, 5)
  addSection('Situational Items', s.situationalItems ?? s.otherItems)
  return sections
})

const runeSets = computed(() => {
  if (!championStats.value) return [] as { label: string; detail: string }[]
  const s: StatsRecord = championStats.value
  const runes = s.runes ?? s.runePages ?? []
  if (!Array.isArray(runes)) return []
  return runes.slice(0, 5).map((page: any) => ({
    label: page.name || [page.primary, page.secondary].filter(Boolean).join(' + ') || buildLabel(page.perks ?? page),
    detail: `${formatWinrate(page.winrate, page.wins, page.games ?? page.count)} • ${(page.games ?? page.count ?? 0)} games`
  }))
})

const summonerSpells = computed(() => {
  if (!championStats.value) return [] as { label: string; detail: string }[]
  const s: StatsRecord = championStats.value
  const spells = s.summonerSpells ?? s.spells ?? []
  if (!Array.isArray(spells)) return []
  return spells.slice(0, 5).map((spell: any) => ({
    label: buildLabel(spell.combo ?? spell.spells ?? spell),
    detail: `${formatWinrate(spell.winrate, spell.wins, spell.games ?? spell.count)} • ${(spell.games ?? spell.count ?? 0)} games`
  }))
})

const matchupSections = computed(() => {
  if (!championStats.value) return [] as { title: string; entries: { label: string; detail: string }[] }[]
  const sections: { title: string; entries: { label: string; detail: string }[] }[] = []
  const s: StatsRecord = championStats.value
  const best = s.bestMatchups ?? s.strongAgainst ?? []
  const worst = s.worstMatchups ?? s.weakAgainst ?? []
  const synergies = s.synergies ?? s.bestTeammates ?? []
  const add = (title: string, list: any) => {
    if (!Array.isArray(list) || !list.length) return
    sections.push({
      title,
      entries: list.slice(0, 5).map((entry: any) => ({
        label: entry.championName || entry.name || entry.champion || entry.partner || entry.matchup,
        detail: `${formatWinrate(entry.winrate, entry.wins, entry.games ?? entry.count)} • ${(entry.games ?? entry.count ?? 0)} games`
      }))
    })
  }
  add('Favorable Matchups', best)
  add('Hard Matchups', worst)
  add('Best Synergies', synergies)
  return sections
})

const rawPayload = computed(() => JSON.stringify(championStats.value, null, 2))

const onImgError = (event: Event) => {
  const img = event.target as HTMLImageElement
  if (img && !img.dataset.fallback) {
    img.dataset.fallback = '1'
    img.src = '/favicon.ico'
  }
}

const fetchChampionStats = async () => {
  const champion = championParam.value
  if (!champion) {
    error.value = 'Champion name is missing.'
    championStats.value = null
    loading.value = false
    return
  }
  loading.value = true
  error.value = null
  championStats.value = null
  try {
    const data = await api.champions.stats.details(champion)
    championStats.value = data as StatsRecord
  } catch (e: any) {
    const status = e?.response?.status
    if (status === 404) {
      error.value = `No stats available for ${champion}.`
    } else {
      console.error('Failed to load champion stats', e)
      error.value = 'Failed to load champion stats.'
    }
    championStats.value = null
  } finally {
    loading.value = false
  }
}

onMounted(fetchChampionStats)
watch(() => route.params.champion, () => fetchChampionStats())

const StatCard = defineComponent({
  name: 'StatCard',
  props: {
    label: { type: String, required: true },
    value: { type: [String, Number], required: true },
    accent: { type: String, default: '' },
  },
  template: `
    <div class="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{{ label }}</div>
      <div :class="['text-xl font-semibold mt-1', accent]">{{ value }}</div>
    </div>
  `,
})
</script>
