'use client'

import React, { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { PlusCircle, Trash2, X, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"

type Player = {
  id: string
  sport: "NBA" | "NFL" | "MLB" | string
  name: string
  team: string
  opponent: string
  stat: string
  line: number
  kickoff: string
}

type Leg = { playerId: string; picked: "MORE" | "LESS" }
type Entry = {
  id: string
  legs: Leg[]
  stake: number
  potentialPayout: number
  createdAt: string
  status: "pending" | "won" | "lost" | "void"
}

const theme = {
  blue: "#4B9CD3",
  blueDark: "#2C7DBF",
  black: "#0B0B0C",
  card: "#0c111b",
  green: "#22c55e",
  red: "#ef4444",
}

const payoutTable: Record<number, number> = { 2: 3, 3: 5, 4: 10, 5: 20, 6: 25 }

const formatUSD = (n: number) => n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 })
const getMultiplier = (legsCount: number) => payoutTable[legsCount] ?? 0
const storage = {
  saveEntries: (entries: Entry[]) => localStorage.setItem("dfs_entries", JSON.stringify(entries)),
  loadEntries: (): Entry[] => {
    try { return JSON.parse(localStorage.getItem("dfs_entries") || "[]") } catch { return [] }
  },
}

export default function Page() {
  const [players, setPlayers] = useState<Player[]>([])
  const [query, setQuery] = useState("")
  const [sportFilter, setSportFilter] = useState<string | null>(null)
  const [slipLegs, setSlipLegs] = useState<Leg[]>([])
  const [stake, setStake] = useState<number>(10)
  const [entries, setEntries] = useState<Entry[]>([])

  useEffect(() => {
    fetch("/api/players").then(r => r.json()).then(setPlayers).catch(() => setPlayers([]))
    setEntries(storage.loadEntries())
  }, [])

  useEffect(() => { storage.saveEntries(entries) }, [entries])

  const filteredPlayers = useMemo(() => {
    const q = query.trim().toLowerCase()
    return players.filter(p => {
      if (sportFilter && p.sport !== sportFilter) return false
      if (!q) return true
      return (
        p.name.toLowerCase().includes(q) ||
        p.team.toLowerCase().includes(q) ||
        p.opponent.toLowerCase().includes(q) ||
        p.stat.toLowerCase().includes(q)
      )
    })
  }, [players, query, sportFilter])

  const legsCount = slipLegs.length
  const multiplier = getMultiplier(legsCount)
  const potential = Math.max(0, stake * multiplier)

  const addLeg = (playerId: string, picked: "MORE" | "LESS") => {
    setSlipLegs(prev => {
      const existing = prev.find(l => l.playerId === playerId)
      if (existing) return prev.map(l => l.playerId === playerId ? { ...l, picked } : l)
      const next = [...prev, { playerId, picked }]
      return next.slice(0, 6)
    })
  }
  const removeLeg = (playerId: string) => setSlipLegs(prev => prev.filter(l => l.playerId !== playerId))
  const clearSlip = () => setSlipLegs([])

  const placeEntry = () => {
    if (legsCount < 2) return alert("Pick at least 2 legs.")
    if (stake <= 0) return alert("Enter a stake > 0.")
    const id = crypto.randomUUID()
    const newEntry: Entry = {
      id,
      legs: slipLegs,
      stake,
      potentialPayout: potential,
      createdAt: new Date().toISOString(),
      status: "pending",
    }
    setEntries(prev => [newEntry, ...prev])
    clearSlip()
    setStake(10)
    alert("Entry placed (demo mode). Find it under 'My Entries'.")
  }

  return (
    <div className="min-h-screen" style={{ background: `radial-gradient(1200px 800px at 10% -10%, ${theme.blue}22, transparent), radial-gradient(1200px 800px at 110% 10%, ${theme.blueDark}22, transparent)`, backgroundColor: theme.black }}>
      <TopNav />

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 pb-20 pt-6 md:grid-cols-3">
        <section className="md:col-span-2 space-y-4">
          <Hero />
          <SearchBar query={query} setQuery={setQuery} />
          <SportFilters sportFilter={sportFilter} setSportFilter={setSportFilter} />
          <PlayerGrid players={filteredPlayers} slipLegs={slipLegs} addLeg={addLeg} />
        </section>

        <aside className="md:col-span-1">
          <EntrySlip
            legs={slipLegs}
            stake={stake}
            setStake={setStake}
            potential={potential}
            multiplier={multiplier}
            removeLeg={removeLeg}
            clearSlip={clearSlip}
            placeEntry={placeEntry}
            players={players}
          />
          <HouseRules />
          <MyEntries entries={entries} players={players} />
        </aside>
      </main>

      <Footer />
    </div>
  )
}

function TopNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 backdrop-blur" style={{ backgroundColor: "rgba(12,17,27,0.8)" }}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl" style={{ background: `linear-gradient(135deg, ${theme.blue}, ${theme.blueDark})` }} />
          <span className="text-xl font-bold tracking-tight" style={{ color: theme.blue }}>PickMore</span>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="rounded-2xl" style={{ backgroundColor: theme.blue, color: "black" }}>Responsible Play</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-white">Play Responsibly</DialogTitle>
              <DialogDescription>If you or someone you know has a problem, call or text 1-800-GAMBLER. Set limits—play for fun.</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-white">Pick a Player: More or Less</span>
          <span className="text-sm font-normal text-white/60">Skill-based DFS • Demo Mode</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-white/80">
          Choose 2–6 player projections. For each leg, pick <b>MORE</b> or <b>LESS</b> than the posted line. Combine legs for bigger multipliers.
        </p>
      </CardContent>
    </Card>
  )
}

function SearchBar({ query, setQuery }: { query: string; setQuery: (v: string) => void }) {
  return (
    <div className="relative">
      <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search players, teams, props..." className="pl-10 rounded-2xl border-white/10 text-white placeholder:text-white/50" />
      <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={18} />
    </div>
  )
}

function SportFilters({ sportFilter, setSportFilter }: { sportFilter: string | null; setSportFilter: (s: string | null) => void }) {
  const sports = ["NBA", "NFL", "MLB"]
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button onClick={() => setSportFilter(null)} className={`rounded-full px-3 py-1 text-sm ${!sportFilter ? "ring-2" : "opacity-70"}`} style={{ backgroundColor: theme.card, color: "white" }}>All</button>
      {sports.map((s) => (
        <button key={s} onClick={() => setSportFilter(s)} className={`rounded-full px-3 py-1 text-sm ${sportFilter === s ? "ring-2" : "opacity-70"}`} style={{ backgroundColor: theme.card, color: "white" }}>{s}</button>
      ))}
    </div>
  )
}

function PlayerGrid({ players, slipLegs, addLeg }: { players: Player[]; slipLegs: Leg[]; addLeg: (id: string, pick: "MORE" | "LESS") => void }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {players.map((p) => (
        <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="text-sm uppercase tracking-wider text-white/60">{p.sport}</div>
                  <div className="text-lg font-semibold">{p.name}</div>
                  <div className="text-white/60 text-sm">{p.team} vs {p.opponent}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-white/60">{p.stat}</div>
                  <div className="text-2xl font-bold" style={{ color: theme.blue }}>{p.line}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <PickButton selected={slipLegs.find(l => l.playerId === p.id)?.picked === "MORE"} variant="MORE" onClick={() => addLeg(p.id, "MORE")} />
                <PickButton selected={slipLegs.find(l => l.playerId === p.id)?.picked === "LESS"} variant="LESS" onClick={() => addLeg(p.id, "LESS")} />
              </div>
              <div className="mt-3 text-xs text-white/50">Locks at {new Date(p.kickoff).toLocaleString()}</div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

function PickButton({ selected, variant, onClick }: { selected?: boolean; variant: "MORE" | "LESS"; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition-all ${selected ? "ring-2" : "opacity-90 hover:opacity-100"}`} style={{
      background: variant === "MORE" ? `${theme.blue}22` : `#ef444422`,
      color: variant === "MORE" ? theme.blue : theme.red,
    }}>
      <PlusCircle size={18} /> {variant}
    </button>
  )
}

function EntrySlip({ legs, stake, setStake, potential, multiplier, removeLeg, clearSlip, placeEntry, players }:
  { legs: Leg[]; stake: number; setStake: (n: number) => void; potential: number; multiplier: number; removeLeg: (id: string) => void; clearSlip: () => void; placeEntry: () => void; players: Player[] }) {

  const canPlace = legs.length >= 2 && legs.length <= 6 && stake > 0 && multiplier > 0

  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Your Entry</span>
          <button onClick={clearSlip} className="text-sm text-white/60 hover:text-white" title="Clear">
            <Trash2 size={16} />
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {legs.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/10 p-4 text-center text-white/60">
            Add 2–6 legs to build your entry.
          </div>
        )}
        {legs.map((l) => {
          const p = players.find(mp => mp.id === l.playerId)
          if (!p) return null
          return (
            <div key={l.playerId} className="flex items-center justify-between rounded-xl border border-white/10 p-3">
              <div>
                <div className="text-sm font-medium">{p.name}</div>
                <div className="text-xs text-white/60">{p.stat} {l.picked === "MORE" ? ">" : "<"} {p.line}</div>
              </div>
              <button onClick={() => removeLeg(l.playerId)} className="text-white/60 hover:text-white" title="Remove">
                <X size={16} />
              </button>
            </div>
          )
        })}

        <PayoutLadder currentLegs={legs.length} />

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/70">Stake</span>
            <Input type="number" min={1} value={stake} onChange={(e) => setStake(parseFloat(e.target.value) || 0)} className="w-28 rounded-xl border-white/10 text-white" />
          </div>
          <div className="text-right">
            <div className="text-xs text-white/60">Multiplier</div>
            <div className="text-lg font-semibold" style={{ color: theme.blue }}>{multiplier}x</div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-black/30 p-3">
          <div className="text-sm text-white/70">Potential Payout</div>
          <div className="text-xl font-bold" style={{ color: theme.green }}>{formatUSD(potential)}</div>
        </div>

        <Button className={`w-full rounded-2xl py-6 text-black ${canPlace ? "" : "opacity-50"}`} style={{ backgroundColor: theme.blue }} disabled={!canPlace} onClick={placeEntry}>
          Place Entry
        </Button>

        <div className="text-xs text-white/50">
          By placing an entry, you confirm this is a skill-based DFS contest. Demo only — no real money is transacted.
        </div>
      </CardContent>
    </Card>
  )
}

function PayoutLadder({ currentLegs }: { currentLegs: number }) {
  const rows = [2, 3, 4, 5, 6]
  return (
    <div className="rounded-xl border border-white/10 p-3">
      <div className="mb-2 text-xs uppercase tracking-wider text-white/60">Payout Ladder</div>
      <div className="grid grid-cols-5 gap-2 text-center text-sm">
        {rows.map((n) => (
          <div key={n} className={`rounded-lg p-2 ${currentLegs === n ? "ring-2" : "opacity-80"}`} style={{ boxShadow: "inset 0 0 0 2px transparent" }}>
            <div className="text-white/70">{n} Legs</div>
            <div className="font-semibold" style={{ color: theme.blue }}>{getMultiplier(n)}x</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function HouseRules() {
  const [quickMode, setQuickMode] = useState(true)
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span>House Rules (Demo)</span>
          <div className="flex items-center gap-2 text-xs text-white/70">
            Quick Mode
            <Switch checked={quickMode} onCheckedChange={setQuickMode} />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-white/70">
        <ul className="list-disc space-y-1 pl-4">
          <li>Choose 2–6 legs per entry; see payout ladder for multipliers.</li>
          <li>Lines from mock API; locks at scheduled start times.</li>
          <li>Push/void on DNP (demo rule).</li>
          <li>No real money; for demonstration only.</li>
        </ul>
        <div className="rounded-lg bg-black/30 p-3 text-xs">
          <b>Georgia Note:</b> This demo treats entries as skill-based DFS-style contests and does not process payments. For real deployment, consult counsel to align with Georgia and federal requirements.
        </div>
      </CardContent>
    </Card>
  )
}

function MyEntries({ entries, players }: { entries: Entry[]; players: Player[] }) {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-base">My Entries</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {entries.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/10 p-4 text-center text-white/60">
            No entries yet.
          </div>
        )}
        {entries.map((e) => (
          <div key={e.id} className="space-y-2 rounded-xl border border-white/10 p-3">
            <div className="flex items-center justify-between text-sm">
              <div className="text-white/70">{new Date(e.createdAt).toLocaleString()}</div>
              <span className={`rounded-full px-2 py-0.5 text-xs bg-white/10 text-white/70`}>{e.status.toUpperCase()}</span>
            </div>
            {e.legs.map((l, i) => {
              const p = players.find(mp => mp.id === l.playerId)
              if (!p) return null
              return (
                <div key={i} className="flex items-center justify-between rounded-lg bg-black/30 p-2 text-sm">
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-white/60 text-xs">{p.stat} {l.picked === "MORE" ? ">" : "<"} {p.line}</div>
                  </div>
                  <div className="text-white/60">{p.team} vs {p.opponent}</div>
                </div>
              )
            })}
            <div className="flex items-center justify-between text-sm">
              <div className="text-white/70">Stake: <b>{formatUSD(e.stake)}</b></div>
              <div>Potential: <b style={{ color: theme.blue }}>{formatUSD(e.potentialPayout)}</b></div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function Footer() {
  return (
    <footer className="mt-10 border-t border-white/10 py-8 text-center text-xs text-white/50">
      <div className="mx-auto max-w-7xl px-4">
        © {new Date().getFullYear()} PickMore • Skill-based DFS Demo • Built with Next.js + Tailwind
      </div>
    </footer>
  )
}
