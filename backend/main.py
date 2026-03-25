from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import matches, players, teams, predict, strategy, insights, venues, awards, advanced, ai_chat

app = FastAPI(title="CrikIQ API", version="1.0.0", description="Cricket Intelligence Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(matches.router, prefix="/matches", tags=["Matches"])
app.include_router(players.router, prefix="/players", tags=["Players"])
app.include_router(teams.router, prefix="/teams", tags=["Teams"])
app.include_router(predict.router, prefix="/predict", tags=["Predictions"])
app.include_router(strategy.router, prefix="/strategy", tags=["Strategy"])
app.include_router(insights.router, prefix="/insights", tags=["Insights"])
app.include_router(venues.router, prefix="/venues", tags=["Venues"])
app.include_router(awards.router, prefix="/awards", tags=["Awards"])
app.include_router(advanced.router, prefix="/advanced", tags=["Advanced Analytics"])
app.include_router(ai_chat.router, prefix="/ai", tags=["AI Chat"])

@app.get("/")
def root():
    return {"message": "CrikIQ: Where Data Meets Match-Winning Decisions.", "status": "online"}

@app.get("/health")
def health():
    return {"status": "healthy"}
