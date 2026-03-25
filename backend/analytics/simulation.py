"""Monte Carlo tournament simulation"""
import random
from collections import defaultdict

def simulate_match(team_a: str, team_b: str, points_data: dict) -> str:
    """Returns winner based on win rate probability"""
    a_pts = points_data.get(team_a, {}).get("points", 4)
    b_pts = points_data.get(team_b, {}).get("points", 4)
    total = a_pts + b_pts
    if total == 0:
        return random.choice([team_a, team_b])
    prob_a = a_pts / total
    return team_a if random.random() < prob_a else team_b


def run_tournament_simulation(teams: list, points_data: dict, n_simulations: int = 1000) -> dict:
    """Monte Carlo simulation for tournament winner probability"""
    win_counts = defaultdict(int)

    for _ in range(n_simulations):
        # Simulate knockout from SF onwards
        if len(teams) >= 4:
            sf_teams = teams[:4]
            random.shuffle(sf_teams)
            f1 = simulate_match(sf_teams[0], sf_teams[1], points_data)
            f2 = simulate_match(sf_teams[2], sf_teams[3], points_data)
            winner = simulate_match(f1, f2, points_data)
            win_counts[winner] += 1
        elif len(teams) == 2:
            winner = simulate_match(teams[0], teams[1], points_data)
            win_counts[winner] += 1

    total = sum(win_counts.values())
    return {team: round(count / total * 100, 1) for team, count in sorted(win_counts.items(), key=lambda x: -x[1])}


def predict_match_winner(team_a: str, team_b: str, venue: str, points_data: dict) -> dict:
    """Predict match winner with confidence"""
    a_pts = points_data.get(team_a, {}).get("points", 4)
    b_pts = points_data.get(team_b, {}).get("points", 4)
    a_nrr = points_data.get(team_a, {}).get("net_run_rate", 0)
    b_nrr = points_data.get(team_b, {}).get("net_run_rate", 0)

    a_score = a_pts * 10 + a_nrr * 5
    b_score = b_pts * 10 + b_nrr * 5

    total = abs(a_score) + abs(b_score)
    if total == 0:
        a_prob = 50
    else:
        a_prob = round((a_score / (a_score + b_score)) * 100, 1) if (a_score + b_score) > 0 else 50

    a_prob = max(20, min(80, a_prob))
    b_prob = round(100 - a_prob, 1)

    predicted_winner = team_a if a_prob > b_prob else team_b
    confidence = max(a_prob, b_prob)

    return {
        "team_a": team_a,
        "team_b": team_b,
        "team_a_probability": a_prob,
        "team_b_probability": b_prob,
        "predicted_winner": predicted_winner,
        "confidence": confidence,
        "venue": venue,
        "insight": f"Based on tournament performance, {predicted_winner} holds a {confidence:.0f}% win probability at {venue}."
    }
