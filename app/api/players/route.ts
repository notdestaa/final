import { NextResponse } from "next/server"

// Multi-sport mock projections
const players = [
  { id: "nba-1", sport: "NBA", name: "LaMelo Ball", team: "CHA", opponent: "ATL", stat: "Points", line: 24.5, kickoff: "2025-10-18T23:00:00Z" },
  { id: "nba-2", sport: "NBA", name: "Trae Young", team: "ATL", opponent: "CHA", stat: "Assists", line: 9.5, kickoff: "2025-10-18T23:00:00Z" },
  { id: "nfl-1", sport: "NFL", name: "Bijan Robinson", team: "ATL", opponent: "CAR", stat: "Rush+Rec Yds", line: 89.5, kickoff: "2025-09-14T17:00:00Z" },
  { id: "mlb-1", sport: "MLB", name: "Ronald Acuña Jr.", team: "ATL", opponent: "MIA", stat: "Total Bases", line: 1.5, kickoff: "2025-09-05T23:20:00Z" },
  { id: "mlb-2", sport: "MLB", name: "Aaron Judge", team: "NYY", opponent: "BOS", stat: "Home Runs", line: 0.5, kickoff: "2025-09-06T23:05:00Z" },
  { id: "nba-3", sport: "NBA", name: "Jayson Tatum", team: "BOS", opponent: "NYK", stat: "Points", line: 27.5, kickoff: "2025-10-20T00:00:00Z" },
  { id: "nfl-2", sport: "NFL", name: "Patrick Mahomes", team: "KC", opponent: "LAC", stat: "Passing Yds", line: 285.5, kickoff: "2025-09-15T20:25:00Z" }
]

export async function GET() {
  return NextResponse.json(players)
}
