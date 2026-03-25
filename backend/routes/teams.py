from fastapi import APIRouter
from services.data_loader import get_points_table, get_squads, get_batting_stats, get_bowling_stats, get_matches
from analytics.insights_engine import team_insight

router = APIRouter()

@router.get("/")
def all_teams():
    df = get_squads()
    return sorted(df["team"].unique().tolist())

@router.get("/points-table")
def points_table():
    df = get_points_table()
    records = df.fillna("").to_dict(orient="records")
    for r in records:
        r["ai_insight"] = team_insight(r.get("team", ""), r)
    return records

@router.get("/standings")
def standings():
    df = get_points_table()
    groups = {}
    for _, row in df.iterrows():
        g = row["group"]
        if g not in groups:
            groups[g] = []
        groups[g].append(row.fillna("").to_dict())
    return groups

@router.get("/{team_name}/stats")
def team_stats(team_name: str):
    pts = get_points_table()
    bat = get_batting_stats()
    bowl = get_bowling_stats()
    squads = get_squads()
    matches = get_matches()

    team_pts = pts[pts["team"] == team_name]
    team_bat = bat[bat["team"] == team_name].fillna(0)
    team_bowl = bowl[bowl["team"] == team_name].fillna(0)
    team_squad = squads[squads["team"] == team_name].fillna("")

    team_matches = matches[(matches["team1"] == team_name) | (matches["team2"] == team_name)]
    wins = matches[matches["winner"] == team_name].shape[0]

    pts_data = team_pts.iloc[0].to_dict() if not team_pts.empty else {}
    insight = team_insight(team_name, pts_data)

    return {
        "team": team_name,
        "points_table": pts_data,
        "batting_stats": team_bat.to_dict(orient="records"),
        "bowling_stats": team_bowl.to_dict(orient="records"),
        "squad": team_squad.to_dict(orient="records"),
        "total_wins": wins,
        "total_matches": team_matches.shape[0],
        "ai_insight": insight,
    }

@router.get("/{team_name}/radar")
def team_radar(team_name: str):
    bat = get_batting_stats()
    bowl = get_bowling_stats()

    team_bat = bat[bat["team"] == team_name].fillna(0)
    team_bowl = bowl[bowl["team"] == team_name].fillna(0)

    avg_sr = team_bat["strike_rate"].mean() if not team_bat.empty else 0
    avg_avg = team_bat["average"].mean() if not team_bat.empty else 0
    avg_econ = team_bowl["economy"].mean() if not team_bowl.empty else 10
    avg_wkts = team_bowl["wickets"].mean() if not team_bowl.empty else 0
    total_runs = team_bat["runs"].sum() if not team_bat.empty else 0

    return {
        "team": team_name,
        "radar": [
            {"metric": "Batting SR", "value": round(min(avg_sr / 2, 100), 1)},
            {"metric": "Batting Avg", "value": round(min(avg_avg * 1.5, 100), 1)},
            {"metric": "Bowling Economy", "value": round(max(0, 100 - avg_econ * 8), 1)},
            {"metric": "Wicket Taking", "value": round(min(avg_wkts * 8, 100), 1)},
            {"metric": "Run Scoring", "value": round(min(total_runs / 4, 100), 1)},
        ]
    }
