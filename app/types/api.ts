// Types for Riot Stats API
export interface MatchId {
  matchId: string;
  tier: Tier;
  rank: Rank;
}

export type Tier = 'PLATINUM' | 'EMERALD' | 'DIAMOND' | 'MASTER' | 'CHALLENGER';
export type Rank = 'I' | 'II' | 'III' | 'IV';

export interface Player {
  puuid: string;
  tier: Tier;
  rank: Rank;
  leaguePoints: number;
  wins: number;
  losses: number;
  veteran: boolean;
  inactive: boolean;
  freshBlood: boolean;
}

export interface MatchData {
  metadata: MatchDataMetadata;
  info: MatchDataInfo;
}

export interface ChampionStats {
  championName: string;
  championId: number;
  totalGames: number;
  wins: number;
  losses: number;
  winrate: number;
  averageKills?: number;
  averageDeaths?: number;
  averageAssists?: number;
  kda?: number;
  damagePerMinute?: number;
  csPerMinute?: number;
  goldPerMinute?: number;
  roles?: Array<{ role: string; games: number; winrate?: number }>;
  items?: Array<{ itemId: number; itemName?: string; games: number; wins?: number; winrate?: number }>;
  runes?: Array<{ primary: string; secondary?: string; games: number; wins?: number; winrate?: number }>;
  teammates?: Array<{ puuid?: string; summonerName?: string; games: number; wins?: number; winrate?: number }>;
  opponents?: Array<{ puuid?: string; summonerName?: string; games: number; wins?: number; winrate?: number }>;
}

export interface MatchDataMetadata {
  dataVersion: string;
  matchId: string;
  participants: string[];
}

export interface MatchDataInfo {
  endOfGameResult: string;
  gameCreation: number;
  gameDuration: number;
  gameEndTimestamp: number;
  gameId: number;
  gameMode: string;
  gameName: string;
  gameStartTimestamp: number;
  gameType: string;
  gameVersion: string;
  mapId: number;
  platformId: string;
  queueId: number;
  participants: MatchDataParticipant[];
  teams: MatchDataTeam[];
  tournamentCode?: string;
}

export interface MatchDataParticipant {
  puuid: string;
  participantId: number;
  teamId: 100 | 200;
  championId: number;
  championName: string;
  individualPosition: string;
  teamPosition: string;
  kills: number;
  deaths: number;
  assists: number;
  win: boolean;
  goldEarned: number;
  totalDamageDealtToChampions: number;
  totalMinionsKilled: number;
  summonerName: string;
  summonerId: string;
  riotIdGameName: string;
  riotIdTagline: string;
  itemsPurchased: number;
  item0: number;
  item1: number;
  item2: number;
  item3: number;
  item4: number;
  item5: number;
  item6: number;
  perks: Record<string, any>;
}

export interface MatchDataTeam {
  teamId: 100 | 200;
  win: boolean;
  bans: { championId: number; pickTurn: number }[];
  feats: Record<string, { featState: number }>;
  objectives: Record<string, { first: boolean; kills: number }>;
}

export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  sort?: string;
}
