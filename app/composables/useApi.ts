import { useRequest } from './useRequest'

export const useApi = () => {
  const request = useRequest()
  const baseUrl = 'http://localhost:8080/api'

  // Match IDs API
  const matchIds = {
    health: () => request.get('/health'),
    list: (params?: { tier?: string; rank?: string; page?: number; size?: number; sort?: string }) => 
      request.get('/match-ids', { params }),
    getById: (matchId: string) => request.get(`/match-ids/${matchId}`),
    stats: {
      count: (params?: { tier?: string; rank?: string }) => request.get('/match-ids/stats/count', { params }),
      distinctTiers: () => request.get('/match-ids/stats/distinct-tiers'),
    },
    getMatchData: (matchId: string) => request.get(`/match-ids/${matchId}/data`),
  }

  // Players API
  const players = {
    // Deprecated: server-side pagination/sort/filtering is removed.
    // Fetch the full players list and let the client perform sorting/pagination.
    list: () => request.get('/players'),
    getByPuuid: (puuid: string) => request.get(`/players/${puuid}`),
    stats: {
      count: (params?: { tier?: string; rank?: string; minLp?: number; maxLp?: number }) =>
        request.get('/players/stats/count', { params }),
      leaderboard: (params?: { by?: 'lp' | 'wins' | 'winrate'; tier?: string; rank?: string; limit?: number }) =>
        request.get('/players/stats/leaderboard', { params }),
      winrate: (puuid: string) => request.get(`/players/stats/winrate/${puuid}`),
      distribution: () => request.get('/players/stats/distribution'),
      details: (puuid: string) => request.get(`/matches/stats/players/${puuid}`),
    },
    getMatches: (puuid: string, params?: { page?: number; size?: number }) =>
      request.get(`/players/${puuid}/matches`, { params }),
  }

  const champions = {
    stats: {
      details: (champion: string) => request.get(`/matches/stats/champions/${encodeURIComponent(champion)}`),
    },
  }

  // Match Data API
  const matchData = {
    list: (params?: {
      matchId?: string;
      platformId?: string;
      queueId?: number;
      gameVersion?: string;
      startTimeFrom?: number;
      startTimeTo?: number;
      durationMin?: number;
      durationMax?: number;
      page?: number;
      size?: number;
      sort?: string;
    }) => request.get('/matches', { params }),
    getById: (matchId: string) => request.get(`/matches/${matchId}`),
    getPlayers: (matchId: string) => request.get(`/matches/${matchId}/players`),
    getByPuuid: (puuid: string, params?: { page?: number; size?: number }) =>
      request.get(`/matches/participants/${puuid}`, { params }),
    stats: {
      durations: (params?: {
        queueId?: number;
        platformId?: string;
        startTimeFrom?: number;
        startTimeTo?: number;
      }) => request.get('/matches/stats/durations', { params }),
      champions: (params?: { byTeam?: boolean; limit?: number }) =>
        request.get('/matches/stats/champions', { params }),
      winrateByChampion: (params?: { queueId?: number; platformId?: string }) =>
        request.get('/matches/stats/winrate-by-champion', { params }),
    },
  }

  return {
    matchIds,
    players,
    champions,
    matchData,
  }
}
