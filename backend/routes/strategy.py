from fastapi import APIRouter, Query
from services.data_loader import get_squads, get_batting_stats, get_bowling_stats
from analytics.strategy_engine import select_best_xi, get_batting_order, get_bowling_plan, opposition_weakness

router = APIRouter()

@router.get("/best-xi")
def best_xi(team_a: str = Query(...), team_b: str = Query(...), venue: str = Query("Narendra Modi Stadium")):
    squads = get_squads()
    bat = get_batting_stats()
    bowl = get_bowling_stats()

    xi = select_best_xi(team_a, team_b, venue, squads, bat, bowl)
    if isinstance(xi, dict) and "error" in xi:
        return xi

    batting_order = get_batting_order(xi, bat)
    bowling_plan = get_bowling_plan(team_b, venue, squads, bowl)
    weakness = opposition_weakness(team_b, squads, bat, bowl)

    return {
        "team": team_a,
        "vs": team_b,
        "venue": venue,
        "best_xi": [{"player": p["player_name"], "role": p["role"]} for p in xi],
        "batting_order": batting_order,
        "bowling_plan": bowling_plan,
        "opposition_weakness": weakness,
        "insight": f"For {team_a} vs {team_b} at {venue}, the strategy focuses on {bowling_plan['pitch_type']} conditions. {bowling_plan['insight']}"
    }

@router.get("/opposition-weakness")
def opp_weakness(team: str = Query(...)):
    squads = get_squads()
    bat = get_batting_stats()
    bowl = get_bowling_stats()
    return opposition_weakness(team, squads, bat, bowl)
