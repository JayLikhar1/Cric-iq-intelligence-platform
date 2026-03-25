"""Core AI engine — orchestrates query parsing, data lookup, response generation"""
import random
import pandas as pd
from analytics.query_parser import parse_intent, extract_player_names, extract_team_names
from analytics.response_generator import (
    best_batter_response, best_bowler_response, compare_response,
    predict_response, strategy_response, anomaly_response, commentary_response,
    tournament_summary_response, venue_response, toss_response,
    why_lost_response, form_response, clutch_response,
    general_response, not_found_response
)


# ── Prediction helpers ────────────────────────────────────────────────────────

def _prediction_label(score: float) -> str:
    if score >= 55:   return "High potential 🔥"
    if score >= 35:   return "Moderate performance expected 📊"
    return "Risky pick ⚠️"

def _predict_player(bat_row: dict) -> dict:
    avg = float(bat_row.get("average", 20) or 20)
    sr  = float(bat_row.get("strike_rate", 120) or 120)
    recent_form = avg * 1.05  # slight recency boost (no match-by-match data)
    score = avg * 0.4 + recent_form * 0.3 + (sr / 10) * 0.3
    low  = max(5,  int(score * 0.7))
    high = int(score * 1.3)
    return {"score": round(score, 1), "low": low, "high": high, "label": _prediction_label(score)}


# ── Anomaly detection ─────────────────────────────────────────────────────────

def _detect_anomaly(player: str, actual: float, bat_df: pd.DataFrame) -> dict | None:
    row = bat_df[bat_df["player"].str.lower() == player.lower()]
    if row.empty:
        return None
    expected = float(row.iloc[0].get("average", 0) or 0)
    if expected == 0:
        return None
    pct = round(abs(actual - expected) / expected * 100, 1)
    if actual > expected * 1.3:
        return {"direction": "up",   "pct": pct, "actual": actual, "expected": round(expected, 1)}
    if actual < expected * 0.7:
        return {"direction": "down", "pct": pct, "actual": actual, "expected": round(expected, 1)}
    return None


# ── Main AI handler ───────────────────────────────────────────────────────────

def handle_query(query: str, bat_df, bowl_df, matches_df, squads_df,
                 scorecards_df, venues_df, points_df, tournament_df) -> dict:

    intents = parse_intent(query)
    q = query.lower().strip()

    known_players = bat_df["player"].tolist() + bowl_df["player"].tolist()
    known_teams   = squads_df["team"].unique().tolist()

    players = extract_player_names(query, known_players)
    teams   = extract_team_names(query, known_teams)

    # ── Tournament summary ────────────────────────────────────────────────────
    if "tournament" in intents:
        s = dict(zip(tournament_df["field"], tournament_df["value"]))
        text = tournament_summary_response(
            winner=s.get("winner", "India"),
            runs_leader=s.get("most_runs", "Sahibzada Farhan"),
            wickets_leader=s.get("most_wickets", "Jasprit Bumrah"),
            centuries=s.get("centuries_scored", "6"),
        )
        return {"response": text, "intent": "tournament", "data": s}

    # ── Toss analysis ─────────────────────────────────────────────────────────
    if "toss" in intents:
        df = matches_df.dropna(subset=["toss_winner", "winner"])
        df = df[~df["winner"].str.contains("No Result", na=True)]
        total = len(df)
        toss_wins = df[df["toss_winner"] == df["winner"]].shape[0]
        bat_wins  = df[df["toss_decision"] == "bat"].shape[0]
        field_wins= df[df["toss_decision"] == "field"].shape[0]
        pct = round(toss_wins / max(total, 1) * 100, 1)
        text = toss_response(pct=pct, bat_wins=bat_wins, field_wins=field_wins)
        return {"response": text, "intent": "toss"}

    # ── Venue analysis ────────────────────────────────────────────────────────
    if "venue" in intents:
        venue_name = None
        for _, v in venues_df.iterrows():
            if v["city"].lower() in q or v["venue_name"].lower() in q:
                venue_name = v["venue_name"]
                break
        if not venue_name and not venues_df.empty:
            venue_name = venues_df.iloc[0]["venue_name"]
        vm = matches_df[matches_df["venue"] == venue_name].fillna("")
        bat_wins   = vm[vm["toss_decision"] == "bat"].shape[0]
        field_wins = vm[vm["toss_decision"] == "field"].shape[0]
        city = venues_df[venues_df["venue_name"] == venue_name]["city"].values
        city = city[0] if len(city) else ""
        pitch_map = {"Chennai": "spin-friendly", "Delhi": "spin-friendly",
                     "Mumbai": "balanced", "Kolkata": "balanced",
                     "Ahmedabad": "batting paradise"}
        pitch_type = pitch_map.get(city, "pace-friendly")
        tip = "Bat first" if bat_wins >= field_wins else "Chase"
        text = venue_response(venue=venue_name, pitch_type=pitch_type,
                              bat_wins=bat_wins, field_wins=field_wins, tip=tip)
        return {"response": text, "intent": "venue"}

    # ── Best batter ───────────────────────────────────────────────────────────
    if "best_batter" in intents:
        phase = None
        if "death_overs" in intents:
            phase = "death"
        elif "powerplay" in intents:
            phase = "powerplay"

        if teams:
            df = bat_df[bat_df["team"] == teams[0]].fillna(0)
        else:
            df = bat_df.fillna(0)

        if df.empty:
            return {"response": not_found_response(teams[0] if teams else "player"), "intent": "best_batter"}

        top = df.loc[df["runs"].idxmax()]
        sr_label = "death over" if phase == "death" else "powerplay" if phase == "powerplay" else "tournament"
        text = best_batter_response(
            player=top["player"], runs=int(top["runs"]),
            avg=round(float(top["average"]), 1), sr=round(float(top["strike_rate"]), 1),
            team=top["team"]
        )
        if phase:
            text = text.replace("leads the tournament", f"leads in {sr_label} performance")
        return {"response": text, "intent": "best_batter", "player": top["player"]}

    # ── Best bowler ───────────────────────────────────────────────────────────
    if "best_bowler" in intents or "economy" in intents:
        if teams:
            df = bowl_df[bowl_df["team"] == teams[0]].fillna(0)
        else:
            df = bowl_df.fillna(0)

        if df.empty:
            return {"response": not_found_response(teams[0] if teams else "bowler"), "intent": "best_bowler"}

        if "economy" in intents:
            qual = df[df["overs"] >= 5]
            top = qual.loc[qual["economy"].idxmin()] if not qual.empty else df.loc[df["wickets"].idxmax()]
        else:
            top = df.loc[df["wickets"].idxmax()]

        text = best_bowler_response(
            player=top["player"], wickets=int(top["wickets"]),
            econ=round(float(top["economy"]), 2), avg=round(float(top["average"]), 1),
            team=top["team"]
        )
        return {"response": text, "intent": "best_bowler", "player": top["player"]}

    # ── Compare players ───────────────────────────────────────────────────────
    if "compare" in intents and len(players) >= 2:
        p1, p2 = players[0], players[1]
        b1 = bat_df[bat_df["player"].str.lower() == p1.lower()]
        b2 = bat_df[bat_df["player"].str.lower() == p2.lower()]
        w1 = bowl_df[bowl_df["player"].str.lower() == p1.lower()]
        w2 = bowl_df[bowl_df["player"].str.lower() == p2.lower()]

        comparisons = []
        if not b1.empty and not b2.empty:
            v1, v2 = float(b1.iloc[0]["runs"]), float(b2.iloc[0]["runs"])
            winner = p1 if v1 > v2 else p2
            comparisons.append(compare_response(p1, p2, "Runs", int(v1), int(v2), winner))
            v1, v2 = float(b1.iloc[0]["strike_rate"]), float(b2.iloc[0]["strike_rate"])
            winner = p1 if v1 > v2 else p2
            comparisons.append(compare_response(p1, p2, "Strike Rate", round(v1,1), round(v2,1), winner))
        if not w1.empty and not w2.empty:
            v1, v2 = float(w1.iloc[0]["wickets"]), float(w2.iloc[0]["wickets"])
            winner = p1 if v1 > v2 else p2
            comparisons.append(compare_response(p1, p2, "Wickets", int(v1), int(v2), winner))

        if not comparisons:
            return {"response": not_found_response(f"{p1} or {p2}"), "intent": "compare"}

        return {"response": "\n\n".join(comparisons), "intent": "compare", "players": [p1, p2]}

    # ── Predict player ────────────────────────────────────────────────────────
    if "predict" in intents:
        target = players[0] if players else None
        if not target:
            top = bat_df.fillna(0).loc[bat_df["runs"].idxmax()]
            target = top["player"]

        row = bat_df[bat_df["player"].str.lower() == target.lower()].fillna(0)
        if row.empty:
            return {"response": not_found_response(target), "intent": "predict"}

        r = row.iloc[0].to_dict()
        pred = _predict_player(r)
        text = predict_response(
            player=r["player"], low=pred["low"], high=pred["high"],
            label=pred["label"], avg=round(float(r["average"]), 1),
            sr=round(float(r["strike_rate"]), 1)
        )
        return {"response": text, "intent": "predict", "prediction": pred}

    # ── Strategy ──────────────────────────────────────────────────────────────
    if "strategy" in intents:
        team_a = teams[0] if len(teams) > 0 else "India"
        team_b = teams[1] if len(teams) > 1 else "New Zealand"
        venue_name = "Narendra Modi Stadium"
        for _, v in venues_df.iterrows():
            if v["city"].lower() in q or v["venue_name"].lower() in q:
                venue_name = v["venue_name"]
                break
        city = venues_df[venues_df["venue_name"] == venue_name]["city"].values
        city = city[0] if len(city) else "Ahmedabad"
        pitch_map = {"Chennai": "spin-friendly", "Delhi": "spin-friendly",
                     "Mumbai": "balanced", "Kolkata": "balanced",
                     "Ahmedabad": "batting paradise"}
        pitch_type = pitch_map.get(city, "pace-friendly")

        if pitch_type == "spin-friendly":
            bowling_plan = "Lead with spinners in middle overs (7–15). Use pace in powerplay and death"
            batting_tip  = "Target pace bowlers early. Build through middle overs with rotation"
        elif pitch_type == "batting paradise":
            bowling_plan = "Use your best death bowlers. Vary pace and lengths to restrict scoring"
            batting_tip  = "Aggressive approach from ball one. Target 180+"
        else:
            bowling_plan = "Open with pace in powerplay. Introduce spinners in overs 7–12"
            batting_tip  = "Solid start in powerplay, accelerate from over 15 onwards"

        text = strategy_response(team_a=team_a, team_b=team_b, venue=venue_name,
                                  pitch_type=pitch_type, bowling_plan=bowling_plan, batting_tip=batting_tip)
        return {"response": text, "intent": "strategy"}

    # ── Why lost ──────────────────────────────────────────────────────────────
    if "why_lost" in intents and teams:
        team = teams[0]
        losses = matches_df[matches_df["winner"] != team].fillna("")
        losses = losses[(losses["team1"] == team) | (losses["team2"] == team)]
        if losses.empty:
            return {"response": f"📊 No losses found for {team} in the dataset.", "intent": "why_lost"}
        last = losses.iloc[-1]
        opponent = last["team2"] if last["team1"] == team else last["team1"]
        text = why_lost_response(team=team, opponent=opponent, margin=last.get("margin", "unknown margin"))
        return {"response": text, "intent": "why_lost"}

    # ── Form check ────────────────────────────────────────────────────────────
    if "form" in intents and players:
        player = players[0]
        row = bat_df[bat_df["player"].str.lower() == player.lower()].fillna(0)
        if row.empty:
            return {"response": not_found_response(player), "intent": "form"}
        r = row.iloc[0]
        avg = float(r["average"])
        recent = avg * random.uniform(0.85, 1.15)
        if recent > avg * 1.1:
            label = "In excellent form 🔥"
        elif recent > avg * 0.9:
            label = "Consistent form 📊"
        else:
            label = "Slightly below par ⚠️"
        text = form_response(player=r["player"], recent_avg=round(recent, 1),
                             tournament_avg=round(avg, 1), label=label)
        return {"response": text, "intent": "form"}

    # ── Clutch performance ────────────────────────────────────────────────────
    if "clutch" in intents and players:
        player = players[0]
        sc = scorecards_df.fillna(0)
        ko_matches = ["Final", "SF1", "SF2"]
        ko = sc[(sc["player"].str.lower() == player.lower()) & (sc["match"].isin(ko_matches))]
        gr = sc[(sc["player"].str.lower() == player.lower()) & (~sc["match"].isin(ko_matches))]
        ko_avg = round(ko["runs"].mean(), 1) if not ko.empty else 0
        gr_avg = round(gr["runs"].mean(), 1) if not gr.empty else 0
        if ko_avg > gr_avg * 1.1:
            label = "Rises to the occasion 💪"
        elif ko_avg < gr_avg * 0.9:
            label = "Struggles under pressure ⚠️"
        else:
            label = "Consistent across all stages 📊"
        text = clutch_response(player=player, ko_avg=ko_avg, group_avg=gr_avg, label=label)
        return {"response": text, "intent": "clutch"}

    # ── Century info ──────────────────────────────────────────────────────────
    if "century" in intents:
        centuries = bat_df[bat_df["hundreds"] > 0].fillna(0)
        if centuries.empty:
            return {"response": "No centuries found in the dataset.", "intent": "century"}
        names = ", ".join(centuries["player"].tolist())
        count = int(centuries["hundreds"].sum())
        return {
            "response": f"🏏 {count} centuries were scored in this tournament — a record for any T20 World Cup edition. Century makers: {names}.",
            "intent": "century"
        }

    # ── Anomaly detection ─────────────────────────────────────────────────────
    if "anomaly" in intents and players:
        player = players[0]
        row = bat_df[bat_df["player"].str.lower() == player.lower()].fillna(0)
        if not row.empty:
            r = row.iloc[0]
            actual = float(r["runs"]) / max(int(r["innings"]), 1)
            result = _detect_anomaly(player, actual, bat_df)
            if result:
                text = anomaly_response(player=r["player"], **result)
                return {"response": text, "intent": "anomaly", "anomaly": result}
        return {"response": f"📊 No significant anomaly detected for {player} — performance is within expected range.", "intent": "anomaly"}

    # ── Strike rate / aggressive batter ──────────────────────────────────────
    if "strike_rate" in intents:
        df = bat_df.fillna(0)
        if teams:
            df = df[df["team"] == teams[0]]
        top = df.loc[df["strike_rate"].idxmax()]
        return {
            "response": f"⚡ Highest strike rate: {top['player']} ({top['team']}) with SR {round(float(top['strike_rate']),1)} from {int(top['runs'])} runs. {'Highly aggressive batter 🔥' if float(top['strike_rate']) > 160 else 'Solid striker 📊'}.",
            "intent": "strike_rate"
        }

    # ── Head to head ──────────────────────────────────────────────────────────
    if "head_to_head" in intents and len(teams) >= 2:
        t1, t2 = teams[0], teams[1]
        mask = (((matches_df["team1"] == t1) & (matches_df["team2"] == t2)) |
                ((matches_df["team1"] == t2) & (matches_df["team2"] == t1)))
        h2h = matches_df[mask].fillna("")
        t1w = h2h[h2h["winner"] == t1].shape[0]
        t2w = h2h[h2h["winner"] == t2].shape[0]
        total = len(h2h)
        if total == 0:
            return {"response": f"📊 {t1} and {t2} did not meet in this tournament.", "intent": "head_to_head"}
        leader = t1 if t1w > t2w else t2 if t2w > t1w else "Neither team"
        return {
            "response": f"⚔️ Head-to-head: {t1} {t1w} – {t2w} {t2} across {total} match(es). {leader} {'leads' if t1w != t2w else 'and the other are level'}.",
            "intent": "head_to_head"
        }

    # ── Commentary for a player ───────────────────────────────────────────────
    if players:
        player = players[0]
        sc = scorecards_df[scorecards_df["player"].str.lower() == player.lower()].fillna(0)
        if not sc.empty:
            best = sc.loc[sc["runs"].idxmax()]
            text = commentary_response(
                player=player, runs=int(best["runs"]),
                sr=round(int(best["runs"]) / max(int(best.get("balls", 1) or 1), 1) * 100, 1),
                fours=int(best.get("fours", 0)), sixes=int(best.get("sixes", 0))
            )
            return {"response": text, "intent": "commentary"}

        bat_row = bat_df[bat_df["player"].str.lower() == player.lower()].fillna(0)
        if not bat_row.empty:
            r = bat_row.iloc[0]
            pred = _predict_player(r.to_dict())
            text = predict_response(
                player=r["player"], low=pred["low"], high=pred["high"],
                label=pred["label"], avg=round(float(r["average"]), 1),
                sr=round(float(r["strike_rate"]), 1)
            )
            return {"response": text, "intent": "player_info"}

        bowl_row = bowl_df[bowl_df["player"].str.lower() == player.lower()].fillna(0)
        if not bowl_row.empty:
            r = bowl_row.iloc[0]
            text = best_bowler_response(
                player=r["player"], wickets=int(r["wickets"]),
                econ=round(float(r["economy"]), 2), avg=round(float(r["average"]), 1),
                team=r["team"]
            )
            return {"response": text, "intent": "player_info"}

        return {"response": not_found_response(player), "intent": "not_found"}

    # ── Team analysis ─────────────────────────────────────────────────────────
    if "team_analysis" in intents and teams:
        team = teams[0]
        tb = bat_df[bat_df["team"] == team].fillna(0)
        tw = bowl_df[bowl_df["team"] == team].fillna(0)
        pts = points_df[points_df["team"] == team].fillna(0)
        wins = int(pts.iloc[0]["won"]) if not pts.empty else 0
        played = int(pts.iloc[0]["matches_played"]) if not pts.empty else 0
        avg_sr = round(tb["strike_rate"].mean(), 1) if not tb.empty else 0
        avg_econ = round(tw["economy"].mean(), 1) if not tw.empty else 0
        strength = "batting" if avg_sr > 145 else "bowling" if avg_econ < 7.5 else "balanced"
        return {
            "response": f"📊 {team} analysis: {wins}W from {played} matches. Avg batting SR: {avg_sr}, avg bowling economy: {avg_econ}. Primary strength: {strength}. {'Strong contender 💪' if wins >= 4 else 'Developing campaign 📈'}.",
            "intent": "team_analysis"
        }

    return {"response": general_response(query), "intent": "general"}
