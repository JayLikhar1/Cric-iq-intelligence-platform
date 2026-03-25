"""Rule-based NLP insight engine for CrikIQ"""

def batting_insight(player: dict) -> str:
    sr = player.get("strike_rate", 0)
    avg = player.get("average", 0)
    runs = player.get("runs", 0)
    hundreds = player.get("hundreds", 0)
    fifties = player.get("fifties", 0)

    parts = []
    if sr >= 180:
        parts.append("an explosive striker who consistently attacks from ball one")
    elif sr >= 150:
        parts.append("an aggressive batter with a high-impact strike rate")
    elif sr >= 130:
        parts.append("a balanced batter who scores at a healthy pace")
    else:
        parts.append("a measured batter who builds innings carefully")

    if avg >= 60:
        parts.append("exceptional consistency across the tournament")
    elif avg >= 40:
        parts.append("strong reliability at the crease")
    elif avg >= 25:
        parts.append("decent contributions throughout the campaign")
    else:
        parts.append("flashes of brilliance despite modest averages")

    if hundreds >= 2:
        parts.append(f"remarkably scored {hundreds} centuries — a rare feat in T20 cricket")
    elif hundreds == 1:
        parts.append("backed up with a match-defining century")
    if fifties >= 3:
        parts.append(f"with {fifties} half-centuries showing consistent form")

    return f"{player.get('player', 'This player')} is {parts[0]}, demonstrating {parts[1]}. " + \
           (f"They {parts[2]}." if len(parts) > 2 else "") + \
           (f" {parts[3].capitalize()}." if len(parts) > 3 else "")


def bowling_insight(player: dict) -> str:
    econ = player.get("economy", 0)
    wkts = player.get("wickets", 0)
    avg = player.get("average", 0)
    five_wkt = player.get("five_wicket_hauls", 0)

    parts = []
    if econ <= 6.5:
        parts.append("a miserly bowler who suffocates opposition scoring")
    elif econ <= 7.5:
        parts.append("an economical bowler who controls the run flow")
    elif econ <= 9.0:
        parts.append("an attacking bowler who trades runs for wickets")
    else:
        parts.append("an aggressive wicket-seeker who bowls with intent")

    if wkts >= 12:
        parts.append(f"one of the tournament's most prolific wicket-takers with {wkts} scalps")
    elif wkts >= 9:
        parts.append(f"a consistent threat with {wkts} wickets to their name")
    else:
        parts.append(f"contributing {wkts} wickets to the team's cause")

    if avg <= 15:
        parts.append("each wicket coming at a remarkably low cost")
    elif avg <= 20:
        parts.append("maintaining an impressive wickets-to-runs ratio")

    if five_wkt >= 1:
        parts.append("including a five-wicket haul that turned the tide of a match")

    return f"{player.get('player', 'This bowler')} is {parts[0]}, emerging as {parts[1]}. " + \
           (f"{parts[2].capitalize()}." if len(parts) > 2 else "") + \
           (f" {parts[3].capitalize()}." if len(parts) > 3 else "")


def team_insight(team: str, stats: dict) -> str:
    wins = stats.get("won", 0)
    played = stats.get("matches_played", 0)
    nrr = stats.get("net_run_rate", 0)
    win_pct = (wins / played * 100) if played > 0 else 0

    if win_pct >= 80:
        strength = "dominant force"
    elif win_pct >= 60:
        strength = "strong contender"
    elif win_pct >= 40:
        strength = "competitive side"
    else:
        strength = "developing team"

    nrr_desc = "commanding run margins" if nrr > 1.5 else \
               "healthy run margins" if nrr > 0.5 else \
               "tight margins" if nrr > -0.5 else "challenging run rates"

    return (f"{team} emerged as a {strength} in this tournament, winning {wins} out of {played} matches "
            f"with {nrr_desc} (NRR: {nrr:+.2f}). "
            f"Their {win_pct:.0f}% win rate reflects "
            f"{'exceptional' if win_pct >= 80 else 'solid' if win_pct >= 60 else 'moderate'} campaign performance.")


def match_insight(match: dict) -> str:
    result = match.get("result", "")
    toss_winner = match.get("toss_winner", "")
    toss_decision = match.get("toss_decision", "")
    winner = match.get("winner", "")
    margin = match.get("margin", "")

    toss_impact = ""
    if toss_winner and winner:
        if toss_winner == winner:
            toss_impact = f"The toss proved decisive as {toss_winner} chose to {toss_decision} and went on to win. "
        else:
            toss_impact = f"Despite losing the toss, {winner} overcame the disadvantage to claim victory. "

    margin_desc = ""
    if "wickets" in str(margin):
        margin_desc = f"A comfortable win by {margin} suggests strong batting depth. "
    elif "runs" in str(margin):
        try:
            runs = int(str(margin).split()[0])
            if runs > 50:
                margin_desc = f"A dominant {margin} victory showcasing superior all-round performance. "
            else:
                margin_desc = f"A closely contested match decided by just {margin}. "
        except:
            margin_desc = ""

    return toss_impact + margin_desc + (f"Key result: {result}" if result else "")


def player_impact_score(batting: dict = None, bowling: dict = None) -> float:
    """Composite impact score 0-100"""
    score = 0
    if batting:
        runs = batting.get("runs", 0)
        sr = batting.get("strike_rate", 100)
        avg = batting.get("average", 0)
        hundreds = batting.get("hundreds", 0)
        fifties = batting.get("fifties", 0)
        score += min(runs / 4, 25)
        score += min((sr - 100) / 8, 15) if sr > 100 else 0
        score += min(avg / 4, 15)
        score += hundreds * 5
        score += fifties * 2

    if bowling:
        wkts = bowling.get("wickets", 0)
        econ = bowling.get("economy", 10)
        avg = bowling.get("average", 30)
        score += min(wkts * 2, 20)
        score += max(0, (10 - econ) * 2)
        score += max(0, (30 - avg) / 2)

    return round(min(score, 100), 1)


def win_probability(batting_team_score: int, overs_done: float, wickets_lost: int,
                    target: int = None, total_overs: int = 20) -> dict:
    """Simple win probability engine"""
    if target is None:
        # First innings - estimate final score
        projected = (batting_team_score / overs_done) * total_overs if overs_done > 0 else 0
        wicket_penalty = wickets_lost * 8
        projected = max(projected - wicket_penalty, batting_team_score)
        win_prob = min(max((projected - 140) / 80 * 100, 20), 80)
        return {"projected_score": round(projected), "win_probability": round(win_prob, 1)}
    else:
        # Second innings chase
        runs_needed = target - batting_team_score
        balls_remaining = (total_overs - overs_done) * 6
        if balls_remaining <= 0:
            return {"win_probability": 0.0 if runs_needed > 0 else 100.0}
        required_rate = (runs_needed / balls_remaining) * 6
        wickets_remaining = 10 - wickets_lost
        base_prob = max(0, min(100, 100 - (required_rate - 6) * 12 + wickets_remaining * 3))
        return {"required_rate": round(required_rate, 2), "win_probability": round(base_prob, 1)}


def generate_tournament_summary_insight(summary: dict) -> str:
    return (
        f"The {summary.get('tournament_name', 'tournament')} was a landmark edition of T20 cricket. "
        f"{summary.get('winner', 'The champion')} lifted the trophy with a stunning {summary.get('final_score', 'victory')}. "
        f"Across {summary.get('total_matches', 55)} matches, {summary.get('centuries_scored', 6)} centuries were scored — "
        f"the most in any single T20 World Cup edition. "
        f"{summary.get('notable_records', '')}."
    )
