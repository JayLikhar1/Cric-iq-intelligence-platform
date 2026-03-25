export const TEAM_COLORS = {
  India: '#1a73e8',
  'New Zealand': '#000000',
  England: '#003087',
  'South Africa': '#007A4D',
  Pakistan: '#01411C',
  Australia: '#FFCD00',
  'West Indies': '#7B0041',
  'Sri Lanka': '#003478',
  Zimbabwe: '#EF3340',
  Scotland: '#003F87',
  Ireland: '#169B62',
  Afghanistan: '#000000',
  Netherlands: '#FF6600',
  USA: '#B22234',
  Nepal: '#003580',
  Canada: '#FF0000',
  Oman: '#DB161B',
  UAE: '#00732F',
  Italy: '#009246',
  Namibia: '#003580',
}

export const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899']

export const getTeamColor = (team) => TEAM_COLORS[team] || '#3b82f6'
