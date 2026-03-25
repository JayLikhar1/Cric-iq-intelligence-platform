import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def load_csv(filename):
    path = os.path.join(BASE_DIR, filename)
    return pd.read_csv(path)

def get_matches():
    return load_csv("matches.csv")

def get_squads():
    return load_csv("squads.csv")

def get_batting_stats():
    return load_csv("batting_stats.csv")

def get_bowling_stats():
    return load_csv("bowling_stats.csv")

def get_scorecards():
    return load_csv("key_scorecards.csv")

def get_venues():
    return load_csv("venues.csv")

def get_awards():
    return load_csv("awards.csv")

def get_points_table():
    return load_csv("points_table.csv")

def get_tournament_summary():
    return load_csv("tournament_summary.csv")
