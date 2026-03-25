from fastapi import APIRouter, Query
from services.data_loader import get_batting_stats, get_bowling_stats, get_squads, get_scorecards
from analytics.insights_engine import batting_insight, bowling_insight, player_impact_score

router = APIRouter()

@router.get("/batting")
def batting_stats(team: str = Query(None)):
    df = get_batting_stats()
    if team:
        df = df[df["team"] == team]
    records = df.fillna(0).to_dict(orient="records")
    for r in records:
        r["ai_insight"] = batting_insight(r)
        r["impact_score"] = player_impact_score(r, None)
    return records

@router.get("/bowling")
def bowling_stats(team: str = Query(None)):
    df = get_bowling_stats()
    if team:
        df = df[df["team"] == team]
    records = df.fillna(0).to_dict(orient="records")
    for r in records:
        r["ai_insight"] = bowling_insight(r)
        r["impact_score"] = player_impact_score(None, r)
    return records

@router.get("/leaderboard")
def leaderboard():
    bat = get_batting_stats().fillna(0)
    bowl = get_bowling_stats().fillna(0)
    bat_records = bat.to_dict(orient="records")
    bowl_records = bowl.to_dict(orient="records")

    combined = {}
    for r in bat_records:
        name = r["player"]
        combined[name] = {"player": name, "team": r["team"], "batting": r, "bowling": None}
    for r in bowl_records:
        name = r["player"]
        if name in combined:
            combined[name]["bowling"] = r
        else:
            combined[name] = {"player": name, "team": r["team"], "batting": None, "bowling": r}

    result = []
    for name, data in combined.items():
        score = player_impact_score(data["batting"], data["bowling"])
        result.append({**data, "impact_score": score})

    result.sort(key=lambda x: x["impact_score"], reverse=True)
    return result

@router.get("/squad/{team}")
def squad(team: str):
    df = get_squads()
    rows = df[df["team"] == team].fillna("").to_dict(orient="records")
    return rows

@router.get("/teams-list")
def teams_list():
    df = get_squads()
    return sorted(df["team"].unique().tolist())

@router.get("/{player_name}")
def player_profile(player_name: str):
    bat = get_batting_stats()
    bowl = get_bowling_stats()
    squads = get_squads()
    scorecards = get_scorecards()

    bat_row = bat[bat["player"].str.lower() == player_name.lower()]
    bowl_row = bowl[bowl["player"].str.lower() == player_name.lower()]
    squad_row = squads[squads["player_name"].str.lower() == player_name.lower()]
    sc_rows = scorecards[scorecards["player"].str.lower() == player_name.lower()]

    bat_data = bat_row.iloc[0].fillna(0).to_dict() if not bat_row.empty else {}
    bowl_data = bowl_row.iloc[0].fillna(0).to_dict() if not bowl_row.empty else {}
    squad_data = squad_row.iloc[0].fillna("").to_dict() if not squad_row.empty else {}

    impact = player_impact_score(bat_data if bat_data else None, bowl_data if bowl_data else None)

    return {
        "profile": squad_data,
        "batting": bat_data,
        "bowling": bowl_data,
        "scorecards": sc_rows.fillna("").to_dict(orient="records"),
        "impact_score": impact,
        "batting_insight": batting_insight(bat_data) if bat_data else "",
        "bowling_insight": bowling_insight(bowl_data) if bowl_data else "",
    }
