"""Advanced analytics engine for CrikIQ"""
import pandas as pd


# ── Century Tracker ──────────────────────────────────────────────────────────
def get_century_tracker(batting_df, scorecards_df, matches_df):
    centuries = []
    # From batting stats (tournament centuries)
    bat = batting_df[batting_df["hundreds"] > 0].fillna(0)
    for _, row in bat.iterrows():
        # Try to find scorecard detail
        sc = scorecards_df[scorecards_df["player"] == row["player"]]
        high_scores = sc[sc["runs"] >= 100] if not sc.empty else pd.DataFrame()
        if not high_scores.empty:
            for _, s in high_scores.iterrows():
                boundary_pct = round(
                    (s.get("fours", 0) * 4 + s.get("sixes", 0) * 6) / max(s["runs"], 1) * 100, 1
                )
                centuries.append({
                    "player": row["player"],
                    "team": row["team"],
                    "runs": int(s["runs"]),
                    "balls": int(s["balls"]) if s.get("balls") else None,
                    "fours": int(s.get("fours", 0)),
                    "sixes": int(s.get("sixes", 0)),
                    "match": s.get("match", ""),
                    "innings": s.get("innings", ""),
                    "dismissal": s.get("dismissal", ""),
                    "strike_rate": round(s["runs"] / max(s["balls"], 1) * 100, 1) if s.get("balls") else None,
                    "boundary_pct": boundary_pct,
                    "insight": _century_insight(row["player"], int(s["runs"]), s.get("balls"), s.get("match", ""))
                })
        else:
            # Fallback from batting stats
            centuries.append({
                "player": row["player"],
                "team": row["team"],
                "runs": int(row.get("runs", 0)),
                "balls": None,
                "fours": int(row.get("fours", 0)),
                "sixes": int(row.get("sixes", 0)),
                "match": "Tournament",
                "innings": "",
                "dismissal": "",
                "strike_rate": float(row.get("strike_rate", 0)),
                "boundary_pct": round(
                    (row.get("fours", 0) * 4 + row.get("sixes", 0) * 6) / max(row.get("runs", 1), 1) * 100, 1
                ),
                "insight": _century_insight(row["player"], int(row.get("runs", 0)), None, "Tournament")
            })
    centuries.sort(key=lambda x: x["runs"], reverse=True)
    return centuries


def _century_insight(player, runs, balls, match):
    sr_desc = ""
    if balls:
        sr = runs / balls * 100
        if sr >= 200:
            sr_desc = f" at a blistering {sr:.0f} strike rate"
        elif sr >= 160:
            sr_desc = f" at an aggressive {sr:.0f} strike rate"
        else:
            sr_desc = f" at {sr:.0f} strike rate"
    match_desc = f" in the {match}" if match and match != "Tournament" else ""
    return f"{player} scored {runs}{sr_desc}{match_desc} — one of the defining innings of the tournament."


# ── Head-to-Head ─────────────────────────────────────────────────────────────
def get_head_to_head(team_a, team_b, matches_df):
    mask = (
        ((matches_df["team1"] == team_a) & (matches_df["team2"] == team_b)) |
        ((matches_df["team1"] == team_b) & (matches_df["team2"] == team_a))
    )
    h2h = matches_df[mask].fillna("").copy()
    records = h2h.to_dict(orient="records")

    a_wins = h2h[h2h["winner"] == team_a].shape[0]
    b_wins = h2h[h2h["winner"] == team_b].shape[0]
    no_result = h2h[h2h["winner"].str.contains("No Result", na=False)].shape[0]
    total = len(records)

    insight = ""
    if total == 0:
        insight = f"{team_a} and {team_b} did not meet in this tournament."
    elif a_wins > b_wins:
        insight = f"{team_a} dominated {team_b} in this tournament, winning {a_wins} out of {total} encounters."
    elif b_wins > a_wins:
        insight = f"{team_b} had the upper hand over {team_a}, winning {b_wins} out of {total} matches."
    else:
        insight = f"{team_a} and {team_b} were evenly matched, splitting their {total} encounter(s)."

    return {
        "team_a": team_a, "team_b": team_b,
        "team_a_wins": a_wins, "team_b_wins": b_wins,
        "no_result": no_result, "total_matches": total,
        "matches": records, "insight": insight
    }


# ── Winning Streaks ───────────────────────────────────────────────────────────
def get_winning_streaks(matches_df):
    from collections import defaultdict
    team_results = defaultdict(list)
    for _, row in matches_df.sort_values("date").iterrows():
        winner = row.get("winner", "")
        for team in [row.get("team1"), row.get("team2")]:
            if not team or pd.isna(team):
                continue
            if winner == team:
                team_results[team].append("W")
            elif "No Result" in str(winner) or pd.isna(winner) or winner == "":
                team_results[team].append("NR")
            else:
                team_results[team].append("L")

    streaks = []
    for team, results in team_results.items():
        max_streak = cur = 0
        for r in results:
            if r == "W":
                cur += 1
                max_streak = max(max_streak, cur)
            else:
                cur = 0
        # Current streak
        cur_streak = 0
        for r in reversed(results):
            if r == "W":
                cur_streak += 1
            else:
                break
        streaks.append({
            "team": team,
            "max_win_streak": max_streak,
            "current_streak": cur_streak,
            "total_wins": results.count("W"),
            "total_losses": results.count("L"),
            "form": results[-5:],
        })
    streaks.sort(key=lambda x: x["max_win_streak"], reverse=True)
    return streaks


# ── Closest Matches ───────────────────────────────────────────────────────────
def get_closest_matches(matches_df):
    df = matches_df.copy().fillna("")
    close = []
    for _, row in df.iterrows():
        margin = str(row.get("margin", ""))
        score = 999
        label = "close"
        if "wkts" in margin or "wickets" in margin:
            try:
                wkts = int(margin.split()[0])
                score = wkts
                label = f"{wkts} wickets"
            except:
                pass
        elif "runs" in margin:
            try:
                runs = int(margin.split()[0])
                score = runs
                label = f"{runs} runs"
            except:
                pass
        else:
            continue
        close.append({
            "match_no": row["match_no"],
            "team1": row["team1"], "team2": row["team2"],
            "winner": row["winner"], "margin": label,
            "margin_score": score, "stage": row["stage"],
            "date": row["date"], "venue": row["venue"],
            "type": "wickets" if "wickets" in label or "wkts" in label else "runs"
        })
    close.sort(key=lambda x: x["margin_score"])
    return close[:10]


# ── Dependency Score ──────────────────────────────────────────────────────────
def get_dependency_score(team, batting_df):
    team_bat = batting_df[batting_df["team"] == team].fillna(0).sort_values("runs", ascending=False)
    if team_bat.empty:
        return {"team": team, "dependency_score": 0, "top_players": [], "insight": "No data."}

    total_runs = team_bat["runs"].sum()
    top2_runs = team_bat.head(2)["runs"].sum()
    top1_runs = team_bat.head(1)["runs"].sum()
    dep_score = round(top2_runs / max(total_runs, 1) * 100, 1)

    top_players = team_bat.head(3)[["player", "runs", "average", "strike_rate"]].to_dict(orient="records")

    if dep_score >= 70:
        insight = f"{team} is heavily reliant on their top 2 batters who contribute {dep_score}% of team runs — a significant vulnerability if they fail."
    elif dep_score >= 50:
        insight = f"{team} has moderate dependency on their top batters ({dep_score}% of runs). Depth exists but top order is crucial."
    else:
        insight = f"{team} shows excellent batting depth with top 2 contributing only {dep_score}% — a well-balanced lineup."

    return {
        "team": team,
        "total_runs": int(total_runs),
        "top2_runs": int(top2_runs),
        "top1_runs": int(top1_runs),
        "dependency_score": dep_score,
        "top_players": top_players,
        "insight": insight
    }


# ── Bowling Variety Index ─────────────────────────────────────────────────────
def get_bowling_variety(team, squads_df, bowling_df):
    squad = squads_df[squads_df["team"] == team]
    bowlers = squad[squad["role"].isin(["Bowler", "All-Rounder"])]["player_name"].tolist()
    bowl_stats = bowling_df[bowling_df["player"].isin(bowlers)].fillna(0)

    spinners = ["Varun Chakravarthy", "Axar Patel", "Ravi Bishnoi", "Adil Rashid", "Ish Sodhi",
                "Rashid Khan", "Mujeeb Ur Rahman", "Noor Ahmad", "Wanindu Hasaranga",
                "Maheesh Theekshana", "Keshav Maharaj", "Tabraiz Shamsi", "Shadab Khan",
                "Mohammad Nawaz", "Imad Wasim", "Sikandar Raza", "Ryan Burl", "Mark Watt"]

    spin_count = sum(1 for p in bowlers if p in spinners)
    pace_count = len(bowlers) - spin_count
    variety_score = round(min(len(bowl_stats) / max(len(bowlers), 1) * 100, 100), 1)

    return {
        "team": team,
        "total_bowlers": len(bowlers),
        "spinners": spin_count,
        "pacers": pace_count,
        "variety_score": variety_score,
        "active_bowlers": len(bowl_stats),
        "insight": f"{team} deployed {len(bowl_stats)} bowlers with {spin_count} spinners and {pace_count} pacers — "
                   + ("a spin-heavy attack." if spin_count > pace_count else "a pace-dominant attack." if pace_count > spin_count else "a balanced attack.")
    }


# ── Boundary Percentage ───────────────────────────────────────────────────────
def get_boundary_stats(batting_df):
    df = batting_df.fillna(0).copy()
    results = []
    for _, row in df.iterrows():
        boundary_runs = row["fours"] * 4 + row["sixes"] * 6
        total_runs = max(row["runs"], 1)
        boundary_pct = round(boundary_runs / total_runs * 100, 1)
        running_pct = round(100 - boundary_pct, 1)
        six_pct = round(row["sixes"] * 6 / total_runs * 100, 1)
        results.append({
            "player": row["player"],
            "team": row["team"],
            "runs": int(row["runs"]),
            "fours": int(row["fours"]),
            "sixes": int(row["sixes"]),
            "boundary_runs": int(boundary_runs),
            "boundary_pct": boundary_pct,
            "six_pct": six_pct,
            "running_pct": running_pct,
            "insight": f"{row['player']} scored {boundary_pct}% of their runs in boundaries"
                       + (" — an extremely aggressive approach." if boundary_pct >= 65
                          else " — balanced between boundaries and running." if boundary_pct >= 45
                          else " — relies heavily on running between wickets.")
        })
    results.sort(key=lambda x: x["boundary_pct"], reverse=True)
    return results


# ── Clutch Performance (Knockout vs Group) ────────────────────────────────────
def get_clutch_performance(scorecards_df, batting_df):
    knockout_matches = ["Final", "SF1", "SF2"]
    sc = scorecards_df.fillna(0)

    knockout_sc = sc[sc["match"].isin(knockout_matches)]
    group_sc = sc[~sc["match"].isin(knockout_matches)]

    results = []
    for player in sc["player"].unique():
        ko = knockout_sc[knockout_sc["player"] == player]
        gr = group_sc[group_sc["player"] == player]

        ko_runs = int(ko["runs"].sum()) if not ko.empty else 0
        gr_runs = int(gr["runs"].sum()) if not gr.empty else 0
        ko_innings = len(ko)
        gr_innings = len(gr)

        ko_avg = round(ko_runs / max(ko_innings, 1), 1)
        gr_avg = round(gr_runs / max(gr_innings, 1), 1)

        clutch_delta = round(ko_avg - gr_avg, 1)
        clutch_label = "Rises in knockouts" if clutch_delta > 10 else \
                       "Consistent performer" if abs(clutch_delta) <= 10 else \
                       "Struggles in knockouts"

        results.append({
            "player": player,
            "knockout_runs": ko_runs,
            "group_runs": gr_runs,
            "knockout_avg": ko_avg,
            "group_avg": gr_avg,
            "clutch_delta": clutch_delta,
            "clutch_label": clutch_label,
            "insight": f"{player} averaged {ko_avg} in knockouts vs {gr_avg} in group stage — {clutch_label.lower()}."
        })

    results.sort(key=lambda x: x["clutch_delta"], reverse=True)
    return results


# ── Player Comparison ─────────────────────────────────────────────────────────
def compare_players(p1, p2, batting_df, bowling_df):
    def get_stats(name):
        bat = batting_df[batting_df["player"].str.lower() == name.lower()]
        bowl = bowling_df[bowling_df["player"].str.lower() == name.lower()]
        return {
            "batting": bat.iloc[0].fillna(0).to_dict() if not bat.empty else {},
            "bowling": bowl.iloc[0].fillna(0).to_dict() if not bowl.empty else {},
        }

    s1, s2 = get_stats(p1), get_stats(p2)

    comparisons = []
    metrics = [
        ("Runs", "batting", "runs", "higher"),
        ("Average", "batting", "average", "higher"),
        ("Strike Rate", "batting", "strike_rate", "higher"),
        ("Wickets", "bowling", "wickets", "higher"),
        ("Economy", "bowling", "economy", "lower"),
        ("Bowling Avg", "bowling", "average", "lower"),
    ]
    for label, cat, key, better in metrics:
        v1 = s1[cat].get(key, 0) or 0
        v2 = s2[cat].get(key, 0) or 0
        if v1 == 0 and v2 == 0:
            continue
        winner = p1 if (v1 > v2 if better == "higher" else v1 < v2) else p2
        comparisons.append({"metric": label, "p1_value": v1, "p2_value": v2, "winner": winner})

    p1_wins = sum(1 for c in comparisons if c["winner"] == p1)
    p2_wins = sum(1 for c in comparisons if c["winner"] == p2)
    overall = p1 if p1_wins > p2_wins else p2 if p2_wins > p1_wins else "Tied"

    return {
        "player1": p1, "player2": p2,
        "player1_stats": s1, "player2_stats": s2,
        "comparisons": comparisons,
        "p1_wins": p1_wins, "p2_wins": p2_wins,
        "overall_better": overall,
        "insight": f"{overall} edges out in this head-to-head comparison, winning {max(p1_wins, p2_wins)} of {len(comparisons)} metrics."
                   if overall != "Tied" else f"{p1} and {p2} are evenly matched across all metrics."
    }


# ── Qualification Path ────────────────────────────────────────────────────────
def get_qualification_path(matches_df, points_df):
    qualified = points_df[points_df["qualified"].str.startswith("Yes", na=False)]["team"].tolist()
    paths = []
    for team in qualified:
        team_matches = matches_df[
            (matches_df["team1"] == team) | (matches_df["team2"] == team)
        ].sort_values("date").fillna("")

        stages = []
        for _, m in team_matches.iterrows():
            won = m["winner"] == team
            stages.append({
                "match_no": m["match_no"],
                "stage": m["stage"],
                "opponent": m["team2"] if m["team1"] == team else m["team1"],
                "result": "W" if won else ("NR" if "No Result" in str(m["winner"]) else "L"),
                "date": m["date"],
                "venue": m["venue"],
            })

        group_pts = points_df[points_df["team"] == team]
        pts = int(group_pts.iloc[0]["points"]) if not group_pts.empty else 0
        qualified_stage = str(group_pts.iloc[0]["qualified"]) if not group_pts.empty else ""

        paths.append({
            "team": team,
            "journey": stages,
            "total_matches": len(stages),
            "wins": sum(1 for s in stages if s["result"] == "W"),
            "losses": sum(1 for s in stages if s["result"] == "L"),
            "points": pts,
            "qualified_as": qualified_stage,
        })

    paths.sort(key=lambda x: x["wins"], reverse=True)
    return paths


# ── Records Wall ─────────────────────────────────────────────────────────────
def get_records_wall(batting_df, bowling_df, matches_df, scorecards_df):
    bat = batting_df.fillna(0)
    bowl = bowling_df.fillna(0)
    sc = scorecards_df.fillna(0)

    records = []

    # Highest individual score in tournament
    if not bat.empty:
        top = bat.loc[bat["runs"].idxmax()]
        records.append({"category": "Most Runs", "record": f"{int(top['runs'])} runs", "holder": top["player"], "team": top["team"], "detail": f"Avg {top['average']} · SR {top['strike_rate']}"})

    # Highest strike rate (min 100 runs)
    qualified_bat = bat[bat["runs"] >= 100]
    if not qualified_bat.empty:
        top_sr = qualified_bat.loc[qualified_bat["strike_rate"].idxmax()]
        records.append({"category": "Highest Strike Rate", "record": f"SR {top_sr['strike_rate']}", "holder": top_sr["player"], "team": top_sr["team"], "detail": f"{int(top_sr['runs'])} runs"})

    # Most sixes
    if not bat.empty:
        top_6 = bat.loc[bat["sixes"].idxmax()]
        records.append({"category": "Most Sixes", "record": f"{int(top_6['sixes'])} sixes", "holder": top_6["player"], "team": top_6["team"], "detail": f"{int(top_6['runs'])} runs"})

    # Most wickets
    if not bowl.empty:
        top_w = bowl.loc[bowl["wickets"].idxmax()]
        records.append({"category": "Most Wickets", "record": f"{int(top_w['wickets'])} wickets", "holder": top_w["player"], "team": top_w["team"], "detail": f"Avg {top_w['average']} · Econ {top_w['economy']}"})

    # Best economy (min 5 overs)
    qual_bowl = bowl[bowl["overs"] >= 5]
    if not qual_bowl.empty:
        best_econ = qual_bowl.loc[qual_bowl["economy"].idxmin()]
        records.append({"category": "Best Economy", "record": f"Econ {best_econ['economy']}", "holder": best_econ["player"], "team": best_econ["team"], "detail": f"{int(best_econ['wickets'])} wickets"})

    # Best bowling figures
    if not bowl.empty:
        best_fig = bowl.loc[bowl["wickets"].idxmax()]
        records.append({"category": "Best Bowling Figures", "record": best_fig.get("best_figures", "—"), "holder": best_fig["player"], "team": best_fig["team"], "detail": f"{int(best_fig['wickets'])} tournament wickets"})

    # Highest score in a single innings (from scorecards)
    if not sc.empty:
        top_inn = sc.loc[sc["runs"].idxmax()]
        records.append({"category": "Highest Individual Innings", "record": f"{int(top_inn['runs'])} runs", "holder": top_inn["player"], "team": top_inn.get("team", ""), "detail": f"{top_inn.get('match','')} · {top_inn.get('balls','')} balls"})

    # Most boundaries in tournament
    if not bat.empty:
        bat["total_boundaries"] = bat["fours"] + bat["sixes"]
        top_b = bat.loc[bat["total_boundaries"].idxmax()]
        records.append({"category": "Most Boundaries", "record": f"{int(top_b['total_boundaries'])} boundaries", "holder": top_b["player"], "team": top_b["team"], "detail": f"{int(top_b['fours'])} fours · {int(top_b['sixes'])} sixes"})

    return records


# ── NRR Breakdown ─────────────────────────────────────────────────────────────
def get_nrr_breakdown(points_df):
    df = points_df.fillna(0).copy()
    df["nrr_float"] = pd.to_numeric(df["net_run_rate"], errors="coerce").fillna(0)
    df_sorted = df.sort_values("nrr_float", ascending=False)
    records = df_sorted.to_dict(orient="records")
    for r in records:
        nrr = float(r.get("net_run_rate", 0))
        r["nrr_insight"] = (
            "Dominant run margins — consistently outscored opponents." if nrr > 2 else
            "Strong run margins — comfortable wins." if nrr > 1 else
            "Positive but tight margins." if nrr > 0 else
            "Negative NRR — losses outweighed wins in run terms."
        )
    return records


# ── Venue Chase vs Defend ─────────────────────────────────────────────────────
def get_venue_chase_defend(matches_df, venues_df):
    results = []
    for _, venue in venues_df.iterrows():
        vname = venue["venue_name"]
        vm = matches_df[matches_df["venue"] == vname].fillna("")
        total = len(vm)
        if total == 0:
            continue

        bat_first = vm[vm["toss_decision"] == "bat"]
        field_first = vm[vm["toss_decision"] == "field"]

        bat_wins = sum(1 for _, m in bat_first.iterrows() if m["winner"] == m["toss_winner"])
        field_wins = sum(1 for _, m in field_first.iterrows() if m["winner"] == m["toss_winner"])

        results.append({
            "venue": vname,
            "city": venue["city"],
            "total_matches": total,
            "bat_first_count": len(bat_first),
            "field_first_count": len(field_first),
            "bat_first_wins": bat_wins,
            "field_first_wins": field_wins,
            "recommendation": "Bat first" if bat_wins >= field_wins else "Chase",
            "insight": f"At {vname}, {'batting first' if bat_wins >= field_wins else 'chasing'} is the preferred strategy based on toss outcomes."
        })
    return results
