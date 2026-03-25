from fastapi import APIRouter, Query
from services.data_loader import get_points_table
from analytics.simulation import predict_match_winner, run_tournament_simulation

router = APIRouter()

@router.get("/match")
def predict_match(team_a: str = Query(...), team_b: str = Query(...), venue: str = Query("Narendra Modi Stadium")):
    pts = get_points_table()
    pts_dict = {}
    for _, row in pts.iterrows():
        pts_dict[row["team"]] = {"points": row.get("points", 4), "net_run_rate": row.get("net_run_rate", 0)}
    return predict_match_winner(team_a, team_b, venue, pts_dict)

@router.get("/tournament")
def predict_tournament(teams: str = Query("India,New Zealand,England,South Africa")):
    team_list = [t.strip() for t in teams.split(",")]
    pts = get_points_table()
    pts_dict = {}
    for _, row in pts.iterrows():
        pts_dict[row["team"]] = {"points": row.get("points", 4), "net_run_rate": row.get("net_run_rate", 0)}
    result = run_tournament_simulation(team_list, pts_dict, n_simulations=2000)
    return {"simulation_runs": 2000, "win_probabilities": result}

@router.get("/win-probability")
def win_probability_live(
    score: int = Query(100),
    overs: float = Query(10.0),
    wickets: int = Query(2),
    target: int = Query(None)
):
    from analytics.insights_engine import win_probability
    return win_probability(score, overs, wickets, target)
