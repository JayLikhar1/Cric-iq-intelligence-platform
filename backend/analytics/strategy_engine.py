"""Strategy Lab: Best XI, batting order, bowling plan"""
import random

ROLE_REQUIREMENTS = {
    "batters": 3,
    "all_rounders": 3,
    "wicketkeeper": 1,
    "bowlers": 4,
}

def select_best_xi(team_a: str, team_b: str, venue: str, squads_df, batting_df, bowling_df):
    team_a_squad = squads_df[squads_df["team"] == team_a].to_dict("records")
    if not team_a_squad:
        return {"error": f"Team {team_a} not found"}

    batters = [p for p in team_a_squad if p["role"] == "Batter"]
    wks = [p for p in team_a_squad if "Wicketkeeper" in p["role"]]
    ars = [p for p in team_a_squad if p["role"] == "All-Rounder"]
    bowlers = [p for p in team_a_squad if p["role"] == "Bowler"]

    # Score players by impact
    def score_player(player):
        name = player["player_name"]
        bat = batting_df[batting_df["player"] == name]
        bowl = bowling_df[bowling_df["player"] == name]
        bat_dict = bat.iloc[0].to_dict() if not bat.empty else {}
        bowl_dict = bowl.iloc[0].to_dict() if not bowl.empty else {}
        from analytics.insights_engine import player_impact_score
        return player_impact_score(bat_dict, bowl_dict)

    def top_n(pool, n):
        scored = sorted(pool, key=score_player, reverse=True)
        return scored[:n]

    xi = []
    xi += top_n(wks, 1)
    xi += top_n(batters, 3)
    xi += top_n(ars, 3)
    xi += top_n(bowlers, 4)

    # Fill remaining spots
    remaining = [p for p in team_a_squad if p not in xi]
    while len(xi) < 11 and remaining:
        xi.append(remaining.pop(0))

    return xi[:11]


def get_batting_order(xi: list, batting_df) -> list:
    def bat_score(p):
        name = p["player_name"]
        row = batting_df[batting_df["player"] == name]
        if row.empty:
            return 0
        return row.iloc[0].get("strike_rate", 100) * 0.4 + row.iloc[0].get("average", 20) * 0.6

    openers = [p for p in xi if "Wicketkeeper" in p["role"] or p["role"] == "Batter"]
    others = [p for p in xi if p not in openers]

    openers_sorted = sorted(openers, key=bat_score, reverse=True)
    others_sorted = sorted(others, key=bat_score, reverse=True)

    order = openers_sorted[:2] + others_sorted[:5] + openers_sorted[2:] + others_sorted[5:]
    return [{"position": i+1, "player": p["player_name"], "role": p["role"]} for i, p in enumerate(order[:11])]


def get_bowling_plan(team_b: str, venue: str, squads_df, bowling_df) -> dict:
    venue_lower = venue.lower()
    pitch_type = "spin-friendly" if any(v in venue_lower for v in ["chennai", "delhi", "colombo"]) else "pace-friendly"

    bowlers = squads_df[(squads_df["team"] == team_b) & (squads_df["role"].isin(["Bowler", "All-Rounder"]))]
    bowl_names = bowlers["player_name"].tolist()

    bowl_stats = bowling_df[bowling_df["player"].isin(bowl_names)].sort_values("economy").head(5)

    plan = {
        "pitch_type": pitch_type,
        "powerplay": [],
        "middle_overs": [],
        "death_overs": [],
        "insight": ""
    }

    for _, row in bowl_stats.iterrows():
        econ = row.get("economy", 8)
        if econ < 7:
            plan["powerplay"].append(row["player"])
            plan["death_overs"].append(row["player"])
        else:
            plan["middle_overs"].append(row["player"])

    if pitch_type == "spin-friendly":
        plan["insight"] = f"On this {pitch_type} surface, prioritize spinners in middle overs (7-15). Use pace in powerplay and death."
    else:
        plan["insight"] = f"On this {pitch_type} surface, lead with pace in powerplay. Introduce spinners in middle overs to build pressure."

    return plan


def opposition_weakness(team: str, squads_df, batting_df, bowling_df) -> dict:
    squad = squads_df[squads_df["team"] == team]
    player_names = squad["player_name"].tolist()

    bat_stats = batting_df[batting_df["player"].isin(player_names)]
    bowl_stats = bowling_df[bowling_df["player"].isin(player_names)]

    weaknesses = []
    recommendations = []

    # Check if team has strong spinners
    spin_bowlers = squad[squad["role"] == "Bowler"]["player_name"].tolist()
    has_spin = any(name in bowl_stats["player"].values for name in spin_bowlers)

    avg_sr = bat_stats["strike_rate"].mean() if not bat_stats.empty else 130
    avg_econ = bowl_stats["economy"].mean() if not bowl_stats.empty else 8

    if avg_sr < 140:
        weaknesses.append("Batting strike rate below tournament average — susceptible to dot ball pressure")
        recommendations.append("Bowl tight lines, build pressure with dot balls in powerplay")

    if avg_econ > 8.5:
        weaknesses.append("Bowling economy above 8.5 — tends to leak runs in death overs")
        recommendations.append("Target death overs aggressively with big hitters")

    if not weaknesses:
        weaknesses.append("Well-balanced team with no glaring weaknesses")
        recommendations.append("Focus on match-ups and exploit individual bowler tendencies")

    return {
        "team": team,
        "weaknesses": weaknesses,
        "recommendations": recommendations,
        "avg_batting_sr": round(avg_sr, 1) if not bat_stats.empty else "N/A",
        "avg_bowling_economy": round(avg_econ, 1) if not bowl_stats.empty else "N/A",
    }
