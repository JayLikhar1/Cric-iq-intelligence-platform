from fastapi import APIRouter
from services.data_loader import get_matches, get_tournament_summary
from analytics.insights_engine import match_insight, generate_tournament_summary_insight

router = APIRouter()

@router.get("/")
def all_matches():
    df = get_matches()
    return df.fillna("").to_dict(orient="records")

@router.get("/summary")
def tournament_summary():
    df = get_tournament_summary()
    summary = dict(zip(df["field"], df["value"]))
    summary["ai_insight"] = generate_tournament_summary_insight(summary)
    return summary

@router.get("/toss-analysis")
def toss_analysis():
    df = get_matches()
    df = df.dropna(subset=["toss_winner", "winner"])
    df = df[df["winner"].notna() & (df["winner"] != "No Result")]
    toss_won_match = df[df["toss_winner"] == df["winner"]].shape[0]
    total = df.shape[0]
    return {
        "toss_winner_won_match": toss_won_match,
        "total_matches": total,
        "toss_win_percentage": round(toss_won_match / total * 100, 1) if total > 0 else 0,
        "bat_first_wins": df[df["toss_decision"] == "bat"].shape[0],
        "field_first_wins": df[df["toss_decision"] == "field"].shape[0],
        "insight": f"Teams winning the toss won {round(toss_won_match/total*100,1)}% of matches. "
                   f"Batting first was chosen {df[df['toss_decision']=='bat'].shape[0]} times."
    }

@router.get("/stage-breakdown")
def stage_breakdown():
    df = get_matches()
    stages = df.groupby("stage").size().reset_index(name="count")
    return stages.to_dict(orient="records")

@router.get("/{match_no}")
def match_detail(match_no: int):
    df = get_matches()
    row = df[df["match_no"] == match_no]
    if row.empty:
        return {"error": "Match not found"}
    record = row.iloc[0].fillna("").to_dict()
    record["ai_insight"] = match_insight(record)
    return record
