from fastapi import APIRouter
from pydantic import BaseModel
from services.data_loader import (get_batting_stats, get_bowling_stats, get_matches,
                                   get_squads, get_scorecards, get_venues,
                                   get_points_table, get_tournament_summary)
from analytics.ai_engine import handle_query

router = APIRouter()

class ChatRequest(BaseModel):
    query: str

SUGGESTED_QUERIES = [
    "Who is the best batsman?",
    "Best bowler in the tournament",
    "Compare Bumrah and Rashid",
    "Predict Sanju Samson next match",
    "Strategy for India vs New Zealand",
    "Toss impact analysis",
    "Best death over bowler",
    "Tournament summary",
    "Why did Pakistan lose?",
    "Clutch performance of Finn Allen",
]

@router.post("/chat")
def ai_chat(req: ChatRequest):
    if not req.query.strip():
        return {"response": "Please ask me something about the tournament! 🏏", "intent": "empty"}
    result = handle_query(
        query=req.query,
        bat_df=get_batting_stats(),
        bowl_df=get_bowling_stats(),
        matches_df=get_matches(),
        squads_df=get_squads(),
        scorecards_df=get_scorecards(),
        venues_df=get_venues(),
        points_df=get_points_table(),
        tournament_df=get_tournament_summary(),
    )
    return result

@router.get("/suggestions")
def suggestions():
    return {"suggestions": SUGGESTED_QUERIES}

@router.get("/anomalies")
def detect_all_anomalies():
    """Detect anomalies across all players"""
    bat = get_batting_stats().fillna(0)
    anomalies = []
    for _, row in bat.iterrows():
        avg = float(row["average"])
        innings = max(int(row["innings"]), 1)
        per_innings = float(row["runs"]) / innings
        if avg > 0:
            pct = round(abs(per_innings - avg) / avg * 100, 1)
            if per_innings > avg * 1.3:
                anomalies.append({
                    "player": row["player"], "team": row["team"],
                    "type": "exceptional", "pct_above": pct,
                    "actual_avg": round(per_innings, 1), "expected": round(avg, 1),
                    "badge": "🚀 Exceptional Spike",
                    "color": "#30d158"
                })
            elif per_innings < avg * 0.7:
                anomalies.append({
                    "player": row["player"], "team": row["team"],
                    "type": "below_par", "pct_below": pct,
                    "actual_avg": round(per_innings, 1), "expected": round(avg, 1),
                    "badge": "⚠️ Below Expected",
                    "color": "#ff453a"
                })
    return anomalies

@router.get("/predictions")
def all_predictions():
    """Performance predictions for all batters"""
    bat = get_batting_stats().fillna(0)
    results = []
    for _, row in bat.iterrows():
        avg = float(row["average"])
        sr  = float(row["strike_rate"])
        recent = avg * 1.05
        score = avg * 0.4 + recent * 0.3 + (sr / 10) * 0.3
        low  = max(5, int(score * 0.7))
        high = int(score * 1.3)
        label = "High potential 🔥" if score >= 55 else "Moderate 📊" if score >= 35 else "Risky pick ⚠️"
        results.append({
            "player": row["player"], "team": row["team"],
            "predicted_low": low, "predicted_high": high,
            "prediction_score": round(score, 1), "label": label,
            "current_avg": round(avg, 1), "strike_rate": round(sr, 1),
        })
    results.sort(key=lambda x: x["prediction_score"], reverse=True)
    return results
