"""Keyword-based query parser — no external NLP required"""
import re

INTENTS = {
    "best_batter":     ["best bat", "top bat", "best batsman", "top scorer", "most runs", "highest run", "best striker"],
    "best_bowler":     ["best bowl", "top bowl", "most wicket", "best wicket", "top wicket", "cheapest bowl"],
    "compare":         ["compare", "vs ", " versus ", "better player", "who is better"],
    "predict":         ["predict", "next match", "will score", "expected run", "forecast", "performance predict"],
    "death_overs":     ["death over", "last over", "16 to 20", "final over", "death phase"],
    "powerplay":       ["powerplay", "power play", "first 6", "opening over", "pp "],
    "middle_overs":    ["middle over", "7 to 15", "middle phase"],
    "economy":         ["economy", "cheap bowl", "run rate bowl", "concede"],
    "strike_rate":     ["strike rate", "scoring rate", "aggressive", "attack"],
    "team_analysis":   ["team strength", "team weakness", "team analysis", "how is team", "team perform"],
    "venue":           ["venue", "pitch", "ground", "stadium", "wicket condition"],
    "toss":            ["toss", "bat first", "chase", "field first", "defend"],
    "tournament":      ["tournament", "world cup", "overall", "summary", "winner"],
    "anomaly":         ["unusual", "anomaly", "spike", "exceptional", "below average", "outstanding"],
    "strategy":        ["strategy", "plan", "tactic", "approach", "how to beat", "bowling plan", "batting order"],
    "why_lost":        ["why lost", "why did", "reason for loss", "how lost", "defeat reason"],
    "century":         ["century", "hundred", "100", "ton"],
    "six":             ["six", "sixes", "maximum", "boundary six"],
    "wicket":          ["wicket", "dismissal", "out", "fall of wicket"],
    "form":            ["form", "recent", "current form", "in form", "out of form"],
    "clutch":          ["clutch", "knockout", "pressure", "final", "semi final"],
    "head_to_head":    ["head to head", "h2h", "record against", "history between"],
}

def parse_intent(query: str) -> list:
    q = query.lower().strip()
    matched = []
    for intent, keywords in INTENTS.items():
        if any(kw in q for kw in keywords):
            matched.append(intent)
    return matched if matched else ["general"]

def extract_player_names(query: str, known_players: list) -> list:
    q = query.lower()
    found = []
    for p in known_players:
        if p.lower() in q or p.split()[-1].lower() in q:
            found.append(p)
    return found[:2]

def extract_team_names(query: str, known_teams: list) -> list:
    q = query.lower()
    found = []
    for t in known_teams:
        if t.lower() in q:
            found.append(t)
    return found[:2]

def extract_number(query: str) -> int | None:
    nums = re.findall(r'\d+', query)
    return int(nums[0]) if nums else None
