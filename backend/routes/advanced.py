from fastapi import APIRouter, Query
from services.data_loader import (get_matches, get_batting_stats, get_bowling_stats,
                                   get_squads, get_scorecards, get_points_table, get_venues)
from analytics.advanced_analytics import (
    get_century_tracker, get_head_to_head, get_winning_streaks,
    get_closest_matches, get_dependency_score, get_bowling_variety,
    get_boundary_stats, get_clutch_performance, compare_players,
    get_qualification_path, get_records_wall, get_nrr_breakdown,
    get_venue_chase_defend
)

router = APIRouter()

@router.get("/centuries")
def centuries():
    return get_century_tracker(get_batting_stats(), get_scorecards(), get_matches())

@router.get("/head-to-head")
def head_to_head(team_a: str = Query(...), team_b: str = Query(...)):
    return get_head_to_head(team_a, team_b, get_matches())

@router.get("/streaks")
def streaks():
    return get_winning_streaks(get_matches())

@router.get("/closest-matches")
def closest_matches():
    return get_closest_matches(get_matches())

@router.get("/dependency")
def dependency(team: str = Query(...)):
    return get_dependency_score(team, get_batting_stats())

@router.get("/bowling-variety")
def bowling_variety(team: str = Query(...)):
    return get_bowling_variety(team, get_squads(), get_bowling_stats())

@router.get("/boundary-stats")
def boundary_stats():
    return get_boundary_stats(get_batting_stats())

@router.get("/clutch")
def clutch():
    return get_clutch_performance(get_scorecards(), get_batting_stats())

@router.get("/compare-players")
def compare(p1: str = Query(...), p2: str = Query(...)):
    return compare_players(p1, p2, get_batting_stats(), get_bowling_stats())

@router.get("/qualification-path")
def qualification_path():
    return get_qualification_path(get_matches(), get_points_table())

@router.get("/records")
def records():
    return get_records_wall(get_batting_stats(), get_bowling_stats(), get_matches(), get_scorecards())

@router.get("/nrr-breakdown")
def nrr_breakdown():
    return get_nrr_breakdown(get_points_table())

@router.get("/venue-strategy")
def venue_strategy():
    return get_venue_chase_defend(get_matches(), get_venues())
