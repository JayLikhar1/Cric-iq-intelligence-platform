from fastapi import APIRouter
from services.data_loader import (get_batting_stats, get_bowling_stats, get_matches,
                                   get_points_table, get_tournament_summary)
from analytics.insights_engine import batting_insight, bowling_insight, player_impact_score

router = APIRouter()

@router.get("/top-performers")
def top_performers():
    bat = get_batting_stats().fillna(0)
    bowl = get_bowling_stats().fillna(0)

    top_bat = bat.nlargest(5, "runs").to_dict(orient="records")
    top_bowl = bowl.nsmallest(5, "economy").to_dict(orient="records")

    for r in top_bat:
        r["ai_insight"] = batting_insight(r)
        r["impact_score"] = player_impact_score(r, None)
    for r in top_bowl:
        r["ai_insight"] = bowling_insight(r)
        r["impact_score"] = player_impact_score(None, r)

    return {"top_batters": top_bat, "top_bowlers": top_bowl}

@router.get("/kpis")
def kpis():
    matches = get_matches()
    bat = get_batting_stats().fillna(0)
    bowl = get_bowling_stats().fillna(0)
    pts = get_points_table()
    summary = get_tournament_summary()
    s = dict(zip(summary["field"], summary["value"]))

    total_matches = matches.shape[0]
    total_teams = pts["team"].nunique()
    top_scorer = bat.loc[bat["runs"].idxmax()]
    top_wicket = bowl.loc[bowl["wickets"].idxmax()]

    return {
        "total_matches": total_matches,
        "total_teams": total_teams,
        "tournament_winner": s.get("winner", "India"),
        "player_of_tournament": s.get("player_of_tournament", "Sanju Samson"),
        "most_runs_player": top_scorer["player"],
        "most_runs": int(top_scorer["runs"]),
        "most_wickets_player": top_wicket["player"],
        "most_wickets": int(top_wicket["wickets"]),
        "highest_team_total": s.get("highest_team_total", "India 255/5"),
        "centuries_scored": s.get("centuries_scored", "6"),
        "notable_records": s.get("notable_records", ""),
    }

@router.get("/phase-analysis")
def phase_analysis():
    bat = get_batting_stats().fillna(0)
    # Simulate phase-wise data from overall stats
    records = bat.to_dict(orient="records")
    phase_data = []
    for r in records:
        sr = r.get("strike_rate", 130)
        phase_data.append({
            "player": r["player"],
            "team": r["team"],
            "powerplay_sr": round(sr * 0.95, 1),
            "middle_sr": round(sr * 0.85, 1),
            "death_sr": round(sr * 1.15, 1),
            "powerplay_runs": round(r.get("runs", 0) * 0.30),
            "middle_runs": round(r.get("runs", 0) * 0.40),
            "death_runs": round(r.get("runs", 0) * 0.30),
        })
    return phase_data
