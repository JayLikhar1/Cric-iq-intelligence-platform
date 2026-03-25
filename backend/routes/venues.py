from fastapi import APIRouter
from services.data_loader import get_venues, get_matches

router = APIRouter()

@router.get("/")
def all_venues():
    df = get_venues()
    matches = get_matches()
    records = df.fillna("").to_dict(orient="records")

    for v in records:
        venue_name = v["venue_name"]
        venue_matches = matches[matches["venue"] == venue_name]
        v["total_matches"] = venue_matches.shape[0]

        # Toss analysis per venue
        bat_first = venue_matches[venue_matches["toss_decision"] == "bat"].shape[0]
        field_first = venue_matches[venue_matches["toss_decision"] == "field"].shape[0]
        v["bat_first_count"] = bat_first
        v["field_first_count"] = field_first

        # Pitch insight
        city = v.get("city", "").lower()
        if city in ["chennai", "delhi"]:
            v["pitch_type"] = "Spin-friendly"
            v["pitch_insight"] = f"{v['venue_name']} is known for its spin-friendly surface. Spinners dominate the middle overs here."
        elif city in ["mumbai", "kolkata"]:
            v["pitch_type"] = "Balanced"
            v["pitch_insight"] = f"{v['venue_name']} offers a balanced pitch with something for both pacers and spinners."
        elif city in ["ahmedabad"]:
            v["pitch_type"] = "Batting paradise"
            v["pitch_insight"] = f"{v['venue_name']} is a batting paradise with a true, fast outfield. High scores expected."
        else:
            v["pitch_type"] = "Pace-friendly"
            v["pitch_insight"] = f"{v['venue_name']} tends to assist pace bowlers, especially in the powerplay."

    return records

@router.get("/{venue_name}/matches")
def venue_matches(venue_name: str):
    matches = get_matches()
    rows = matches[matches["venue"].str.lower() == venue_name.lower()].fillna("").to_dict(orient="records")
    return rows
