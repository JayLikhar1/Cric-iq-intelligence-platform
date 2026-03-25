from fastapi import APIRouter
from services.data_loader import get_awards, get_tournament_summary

router = APIRouter()

@router.get("/")
def all_awards():
    df = get_awards()
    return df.fillna("").to_dict(orient="records")

@router.get("/summary")
def awards_summary():
    awards = get_awards().fillna("").to_dict(orient="records")
    summary = get_tournament_summary()
    s = dict(zip(summary["field"], summary["value"]))
    return {
        "awards": awards,
        "tournament": s.get("tournament_name"),
        "winner": s.get("winner"),
        "final_score": s.get("final_score"),
        "notable_records": s.get("notable_records"),
    }
