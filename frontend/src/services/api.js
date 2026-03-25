import axios from 'axios'

const BASE = '/api'

const api = axios.create({ baseURL: BASE, timeout: 10000 })

export const matchesAPI = {
  getAll: () => api.get('/matches/'),
  getSummary: () => api.get('/matches/summary'),
  getTossAnalysis: () => api.get('/matches/toss-analysis'),
  getStageBreakdown: () => api.get('/matches/stage-breakdown'),
  getMatch: (id) => api.get(`/matches/${id}`),
}

export const playersAPI = {
  getBatting: (team) => api.get('/players/batting', { params: team ? { team } : {} }),
  getBowling: (team) => api.get('/players/bowling', { params: team ? { team } : {} }),
  getLeaderboard: () => api.get('/players/leaderboard'),
  getSquad: (team) => api.get(`/players/squad/${team}`),
  getTeamsList: () => api.get('/players/teams-list'),
  getProfile: (name) => api.get(`/players/${encodeURIComponent(name)}`),
}

export const teamsAPI = {
  getAll: () => api.get('/teams/'),
  getPointsTable: () => api.get('/teams/points-table'),
  getStandings: () => api.get('/teams/standings'),
  getStats: (team) => api.get(`/teams/${encodeURIComponent(team)}/stats`),
  getRadar: (team) => api.get(`/teams/${encodeURIComponent(team)}/radar`),
}

export const predictAPI = {
  predictMatch: (teamA, teamB, venue) => api.get('/predict/match', { params: { team_a: teamA, team_b: teamB, venue } }),
  predictTournament: (teams) => api.get('/predict/tournament', { params: { teams: teams.join(',') } }),
  winProbability: (score, overs, wickets, target) => api.get('/predict/win-probability', { params: { score, overs, wickets, target } }),
}

export const strategyAPI = {
  getBestXI: (teamA, teamB, venue) => api.get('/strategy/best-xi', { params: { team_a: teamA, team_b: teamB, venue } }),
  getOppositionWeakness: (team) => api.get('/strategy/opposition-weakness', { params: { team } }),
}

export const insightsAPI = {
  getTopPerformers: () => api.get('/insights/top-performers'),
  getKPIs: () => api.get('/insights/kpis'),
  getPhaseAnalysis: () => api.get('/insights/phase-analysis'),
}

export const venuesAPI = {
  getAll: () => api.get('/venues/'),
  getVenueMatches: (venue) => api.get(`/venues/${encodeURIComponent(venue)}/matches`),
}

export const awardsAPI = {
  getAll: () => api.get('/awards/'),
  getSummary: () => api.get('/awards/summary'),
}

export const advancedAPI = {
  getCenturies: () => api.get('/advanced/centuries'),
  getHeadToHead: (a, b) => api.get('/advanced/head-to-head', { params: { team_a: a, team_b: b } }),
  getStreaks: () => api.get('/advanced/streaks'),
  getClosestMatches: () => api.get('/advanced/closest-matches'),
  getDependency: (team) => api.get('/advanced/dependency', { params: { team } }),
  getBowlingVariety: (team) => api.get('/advanced/bowling-variety', { params: { team } }),
  getBoundaryStats: () => api.get('/advanced/boundary-stats'),
  getClutch: () => api.get('/advanced/clutch'),
  comparePlayers: (p1, p2) => api.get('/advanced/compare-players', { params: { p1, p2 } }),
  getQualificationPath: () => api.get('/advanced/qualification-path'),
  getRecords: () => api.get('/advanced/records'),
  getNRRBreakdown: () => api.get('/advanced/nrr-breakdown'),
  getVenueStrategy: () => api.get('/advanced/venue-strategy'),
}

export const aiAPI = {
  chat: (query) => api.post('/ai/chat', { query }),
  getSuggestions: () => api.get('/ai/suggestions'),
  getAnomalies: () => api.get('/ai/anomalies'),
  getPredictions: () => api.get('/ai/predictions'),
}
