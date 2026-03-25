"""Dynamic response generator with template variation"""
import random

# ── Template pools ────────────────────────────────────────────────────────────

def _pick(templates: list, **kwargs) -> str:
    return random.choice(templates).format(**kwargs)

def best_batter_response(player, runs, avg, sr, team):
    return _pick([
        "🏏 {player} ({team}) leads the tournament with {runs} runs at an average of {avg} and a strike rate of {sr}. A dominant force at the top.",
        "📊 The run charts are topped by {player} from {team} — {runs} runs, avg {avg}, SR {sr}. Consistently outstanding.",
        "⚡ {player} has been the standout batter this tournament. {runs} runs at SR {sr} for {team} — hard to stop.",
    ], player=player, runs=runs, avg=avg, sr=sr, team=team)

def best_bowler_response(player, wickets, econ, avg, team):
    return _pick([
        "🎯 {player} ({team}) is the tournament's most dangerous bowler — {wickets} wickets at an economy of {econ}. Lethal.",
        "🔥 {player} leads the wicket charts with {wickets} scalps for {team}. Economy of {econ} makes them near unplayable.",
        "📉 {player} from {team} has been exceptional — {wickets} wickets, avg {avg}, economy {econ}. A match-winner.",
    ], player=player, wickets=wickets, econ=econ, avg=avg, team=team)

def compare_response(p1, p2, metric, p1_val, p2_val, winner):
    return _pick([
        "⚖️ Comparing {p1} vs {p2} on {metric}: {p1} scores {p1_val} vs {p2}'s {p2_val}. {winner} has the edge here.",
        "📊 Head-to-head on {metric} — {p1}: {p1_val} | {p2}: {p2_val}. {winner} comes out on top.",
        "🔍 {metric} comparison: {p1} ({p1_val}) vs {p2} ({p2_val}). Advantage goes to {winner}.",
    ], p1=p1, p2=p2, metric=metric, p1_val=p1_val, p2_val=p2_val, winner=winner)

def predict_response(player, low, high, label, avg, sr):
    return _pick([
        "🔮 Based on tournament form, {player} is projected to score {low}–{high} runs next match. Avg: {avg}, SR: {sr}. Verdict: {label}.",
        "📈 Performance model for {player}: expected output {low}–{high} runs. Current avg {avg}, SR {sr}. Assessment: {label}.",
        "🎯 {player}'s prediction score suggests {low}–{high} runs in the next outing. Form indicators: avg {avg}, SR {sr}. {label}.",
    ], player=player, low=low, high=high, label=label, avg=avg, sr=sr)

def strategy_response(team_a, team_b, venue, pitch_type, bowling_plan, batting_tip):
    return _pick([
        "🧠 Strategy for {team_a} vs {team_b} at {venue} ({pitch_type}): {bowling_plan}. Batting tip: {batting_tip}.",
        "⚡ Tactical brief — {team_a} facing {team_b} on a {pitch_type} surface at {venue}. {bowling_plan}. {batting_tip}.",
        "🏟️ At {venue} ({pitch_type}), {team_a} should: {bowling_plan}. For batting: {batting_tip}.",
    ], team_a=team_a, team_b=team_b, venue=venue, pitch_type=pitch_type, bowling_plan=bowling_plan, batting_tip=batting_tip)

def anomaly_response(player, actual, expected, pct, direction):
    if direction == "up":
        return _pick([
            "🚀 Exceptional spike detected! {player} performed {pct}% above their tournament average ({actual} vs expected {expected}). Outstanding!",
            "⭐ {player} is on fire — {pct}% above average this match ({actual} vs {expected}). A performance spike worth noting.",
        ], player=player, actual=actual, expected=expected, pct=pct)
    else:
        return _pick([
            "📉 Below-par performance from {player} — {pct}% below their average ({actual} vs expected {expected}). A rare off day.",
            "⚠️ {player} underperformed by {pct}% ({actual} vs expected {expected}). Worth monitoring going forward.",
        ], player=player, actual=actual, expected=expected, pct=pct)

def commentary_response(player, runs, sr, fours, sixes):
    return _pick([
        "🎙️ What a sensational innings! {player} blazes to {runs} runs at a strike rate of {sr}, smashing {fours} fours and {sixes} sixes. Breathtaking!",
        "🔥 {player} is absolutely on fire! {runs} runs, {sixes} maximums, SR {sr}. The crowd is on its feet!",
        "⚡ Unstoppable! {player} tears apart the bowling with {runs} runs — {fours} boundaries, {sixes} sixes, SR {sr}. A masterclass!",
    ], player=player, runs=runs, sr=sr, fours=fours, sixes=sixes)

def tournament_summary_response(winner, runs_leader, wickets_leader, centuries):
    return _pick([
        "🏆 {winner} lifted the trophy in a dominant campaign. {runs_leader} topped the batting charts while {wickets_leader} led the wicket takers. {centuries} centuries were scored — a record for any T20 World Cup.",
        "📊 Tournament wrap: {winner} are champions! {runs_leader} was the standout batter, {wickets_leader} the premier bowler. {centuries} centuries — the most ever in a T20 WC edition.",
    ], winner=winner, runs_leader=runs_leader, wickets_leader=wickets_leader, centuries=centuries)

def venue_response(venue, pitch_type, bat_wins, field_wins, tip):
    return _pick([
        "🏟️ {venue} is a {pitch_type} surface. Teams batting first have won {bat_wins} times vs {field_wins} chasing. Tip: {tip}.",
        "📍 At {venue} ({pitch_type}): bat-first wins {bat_wins}, chase wins {field_wins}. Strategic recommendation: {tip}.",
    ], venue=venue, pitch_type=pitch_type, bat_wins=bat_wins, field_wins=field_wins, tip=tip)

def toss_response(pct, bat_wins, field_wins):
    return _pick([
        "🪙 Toss analysis: winning the toss led to match wins {pct}% of the time. Batting first won {bat_wins} matches vs {field_wins} for fielding first.",
        "📊 Toss impact: {pct}% of toss winners went on to win the match. Bat-first: {bat_wins} wins | Field-first: {field_wins} wins.",
    ], pct=pct, bat_wins=bat_wins, field_wins=field_wins)

def why_lost_response(team, opponent, margin):
    return _pick([
        "🔍 {team} lost to {opponent} by {margin}. Key factors: inability to defend/chase the target, bowling/batting collapse under pressure.",
        "📉 The defeat of {team} against {opponent} ({margin}) points to execution gaps — either in the powerplay or death overs.",
    ], team=team, opponent=opponent, margin=margin)

def form_response(player, recent_avg, tournament_avg, label):
    return _pick([
        "📈 {player}'s current form: recent avg {recent_avg} vs tournament avg {tournament_avg}. Assessment: {label}.",
        "🔍 Form check on {player} — recent average {recent_avg}, overall {tournament_avg}. Status: {label}.",
    ], player=player, recent_avg=recent_avg, tournament_avg=tournament_avg, label=label)

def clutch_response(player, ko_avg, group_avg, label):
    return _pick([
        "💪 Clutch rating for {player}: knockout avg {ko_avg} vs group stage avg {group_avg}. Verdict: {label}.",
        "🎯 Under pressure, {player} averages {ko_avg} (knockouts) vs {group_avg} (groups). {label}.",
    ], player=player, ko_avg=ko_avg, group_avg=group_avg, label=label)

def general_response(query):
    suggestions = [
        "Try asking: 'Who is the best batsman?', 'Compare Bumrah and Rashid', 'Predict Samson next match', 'Strategy for India vs New Zealand'",
        "I can help with: player comparisons, performance predictions, strategy advice, venue analysis, and tournament insights.",
        "Ask me about: best bowlers, death over specialists, powerplay performers, team weaknesses, or match predictions.",
    ]
    return f"🤔 I couldn't find a specific answer for '{query}'. {random.choice(suggestions)}"

def not_found_response(entity):
    return f"❓ I couldn't find data for '{entity}' in the tournament records. Try using the full player or team name."
