import { useRequest } from './useRequest'

export const useApi = () => {
  const request = useRequest()
  const baseUrl = 'http://localhost:8080/api'

  // Match IDs API
  const matchIds = {
    health: () => request.get('/health'),
    list: (params?: { tier?: string; rank?: string; page?: number; size?: number; sort?: string }) => 
      request.get('/match-ids', { params }),
    create: (data: any) => request.post('/match-ids', data),
    bulkUpsert: (data: any[]) => request.post('/match-ids/bulk', data),
    getById: (matchId: string) => request.get(`/match-ids/${matchId}`),
    update: (matchId: string, data: any) => request.put(`/match-ids/${matchId}`, data),
    patch: (matchId: string, data: any) => request.patch(`/match-ids/${matchId}`, data),
    delete: (matchId: string) => request.delete(`/match-ids/${matchId}`),
    stats: {
      count: (params?: { tier?: string; rank?: string }) => request.get('/match-ids/stats/count', { params }),
      distinctTiers: () => request.get('/match-ids/stats/distinct-tiers'),
    },
    getMatchData: (matchId: string) => request.get(`/match-ids/${matchId}/data`),
  }

  // Players API
  const players = {
    list: (params?: {
      tier?: string;
      rank?: string;
      minLp?: number;
      maxLp?: number;
      veteran?: boolean;
      inactive?: boolean;
      freshBlood?: boolean;
      page?: number;
      size?: number;
      sort?: string;
    }) => request.get('/players', { params }),
    create: (data: any) => request.post('/players', data),
    bulkUpsert: (data: any[]) => request.post('/players/bulk', data),
    getByPuuid: (puuid: string) => request.get(`/players/${puuid}`),
    update: (puuid: string, data: any) => request.put(`/players/${puuid}`, data),
    patch: (puuid: string, data: any) => request.patch(`/players/${puuid}`, data),
    delete: (puuid: string) => request.delete(`/players/${puuid}`),
    stats: {
      count: (params?: { tier?: string; rank?: string; minLp?: number; maxLp?: number }) =>
        request.get('/players/stats/count', { params }),
      leaderboard: (params?: { by?: 'lp' | 'wins' | 'winrate'; tier?: string; rank?: string; limit?: number }) =>
        request.get('/players/stats/leaderboard', { params }),
      winrate: (puuid: string) => request.get(`/players/stats/winrate/${puuid}`),
      distribution: () => request.get('/players/stats/distribution'),
    },
    getMatches: (puuid: string, params?: { page?: number; size?: number }) =>
      request.get(`/players/${puuid}/matches`, { params }),
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
    }) => request.get('/match-data', { params }),
    create: (data: any) => request.post('/match-data', data),
    bulkUpsert: (data: any[]) => request.post('/match-data/bulk', data),
    getById: (matchId: string) => request.get(`/match-data/${matchId}`),
    delete: (matchId: string) => request.delete(`/match-data/${matchId}`),
    getPlayers: (matchId: string) => request.get(`/match-data/${matchId}/players`),
    getByPuuid: (puuid: string, params?: { page?: number; size?: number }) =>
      request.get(`/match-data/participants/by-puuid/${puuid}`, { params }),
    stats: {
      durations: (params?: {
        queueId?: number;
        platformId?: string;
        startTimeFrom?: number;
        startTimeTo?: number;
      }) => request.get('/match-data/stats/durations', { params }),
      champions: (params?: { byTeam?: boolean; limit?: number }) =>
        request.get('/match-data/stats/champions', { params }),
      winrateByChampion: (params?: { queueId?: number; platformId?: string }) =>
        request.get('/match-data/stats/winrate-by-champion', { params }),
    },
  }

  return {
    matchIds,
    players,
    matchData,
  }
}
