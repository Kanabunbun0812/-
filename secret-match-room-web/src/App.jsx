import React, { useMemo, useState } from "react";

const demoPeople = [
  ["りん", "女性", "🌹"],
  ["ゆうと", "男性", "🥂"],
  ["かな", "女性", "💄"],
  ["しょうた", "男性", "🕯️"],
  ["あや", "女性", "🍷"],
  ["たくみ", "男性", "🖤"],
  ["みお", "女性", "✨"],
  ["れん", "男性", "🌙"],
];

const makeRoomCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();
const makeSeats = (count) =>
  Array.from({ length: count }, (_, index) => ({
    id: `seat-${index + 1}`,
    label: String(index + 1),
    member: null,
  }));

const demoSeats = (count) =>
  makeSeats(count).map((seat, index) => {
    const person = demoPeople[index];
    if (!person) return seat;
    return {
      ...seat,
      member: {
        id: `member-${index + 1}`,
        name: person[0],
        gender: person[1],
        avatar: person[2],
        seatId: seat.id,
      },
    };
  });

export default function MutualMatchVotingApp() {
  const [mode, setMode] = useState("home");
  const [tab, setTab] = useState("seats");
  const [phase, setPhase] = useState("entry");
  const [roomName, setRoomName] = useState("Midnight Lounge");
  const [roomCode, setRoomCode] = useState(makeRoomCode());
  const [tableShape, setTableShape] = useState("round");
  const [seatCount, setSeatCount] = useState(8);
  const [seats, setSeats] = useState(makeSeats(8));

  const [creatorSeatId, setCreatorSeatId] = useState("seat-1");
  const [creatorName, setCreatorName] = useState("");
  const [creatorGender, setCreatorGender] = useState("女性");
  const [progressUnlocked, setProgressUnlocked] = useState(false);

  const [selectedSeatId, setSelectedSeatId] = useState(null);
  const [draftName, setDraftName] = useState("");
  const [draftGender, setDraftGender] = useState("女性");
  const [pendingVoterId, setPendingVoterId] = useState(null);
  const [currentMemberId, setCurrentMemberId] = useState(null);
  const [targetMode, setTargetMode] = useState("opposite");
  const [allowMultiple, setAllowMultiple] = useState(true);
  const [maxVotes, setMaxVotes] = useState(2);
  const [votes, setVotes] = useState({});
  const [showIncoming, setShowIncoming] = useState(false);

  const members = useMemo(() => seats.filter((s) => s.member).map((s) => s.member), [seats]);
  const selectedSeat = seats.find((s) => s.id === selectedSeatId);
  const currentMember = members.find((m) => m.id === currentMemberId) || null;
  const pendingVoter = members.find((m) => m.id === pendingVoterId) || null;
  const selectedVotes = currentMember ? votes[currentMember.id] || [] : [];
  const filledSeats = members.length;
  const emptySeats = seatCount - filledSeats;
  const votedCount = members.filter((m) => (votes[m.id] || []).length > 0).length;
  const allVoted = filledSeats > 0 && members.every((m) => (votes[m.id] || []).length > 0);
  const canPublish = phase === "voting" && allVoted && progressUnlocked;
  const maxSelectable = allowMultiple ? maxVotes : 1;
  const roomUrl = `secret-match.app/r/${roomCode}`;

  const candidates = useMemo(() => {
    if (!currentMember) return [];
    return members.filter((m) => {
      if (m.id === currentMember.id) return false;
      if (targetMode === "opposite") return m.gender !== currentMember.gender;
      return true;
    });
  }, [members, currentMember, targetMode]);

  const mutualPairs = useMemo(() => {
    const seen = new Set();
    const pairs = [];
    Object.entries(votes).forEach(([from, targets]) => {
      targets.forEach((to) => {
        if ((votes[to] || []).includes(from)) {
          const key = [from, to].sort().join("-");
          if (!seen.has(key)) {
            const a = members.find((m) => m.id === from);
            const b = members.find((m) => m.id === to);
            if (a && b) {
              seen.add(key);
              pairs.push([a, b]);
            }
          }
        }
      });
    });
    return pairs;
  }, [votes, members]);

  const incomingVotes = useMemo(() => {
    if (!currentMember) return [];
    return members.filter((m) => (votes[m.id] || []).includes(currentMember.id));
  }, [members, votes, currentMember]);

  function resetAll() {
    setMode("home");
    setTab("seats");
    setPhase("entry");
    setRoomName("Midnight Lounge");
    setRoomCode(makeRoomCode());
    setTableShape("round");
    setSeatCount(8);
    setSeats(makeSeats(8));
    setCreatorSeatId("seat-1");
    setCreatorName("");
    setCreatorGender("女性");
    setProgressUnlocked(false);
    setSelectedSeatId(null);
    setDraftName("");
    setDraftGender("女性");
    setPendingVoterId(null);
    setCurrentMemberId(null);
    setVotes({});
    setShowIncoming(false);
  }

  function openDemo() {
    setMode("room");
    setTab("seats");
    setPhase("entry");
    setRoomName("Midnight Lounge");
    setRoomCode(makeRoomCode());
    setTableShape("round");
    setSeatCount(8);
    setSeats(demoSeats(8));
    setProgressUnlocked(false);
    setVotes({
      "member-1": ["member-2", "member-4"],
      "member-2": ["member-1"],
      "member-3": ["member-4"],
      "member-4": ["member-3"],
    });
  }

  function changeSeatCount(value) {
    const count = Number(value);
    setSeatCount(count);
    setSeats((prev) => {
      const next = makeSeats(count);
      prev.slice(0, count).forEach((seat, index) => {
        next[index] = { ...next[index], member: seat.member };
      });
      return next;
    });
    setCreatorSeatId("seat-1");
    setSelectedSeatId(null);
    setVotes({});
  }

  function createRoom() {
    if (!creatorName.trim() || !creatorSeatId) return;
    const id = `creator-${Date.now()}`;
    const member = {
      id,
      name: creatorName.trim(),
      gender: creatorGender,
      avatar: creatorGender === "女性" ? "🌹" : "🥂",
      seatId: creatorSeatId,
    };
    setSeats((prev) => prev.map((s) => (s.id === creatorSeatId ? { ...s, member } : s)));
    setCurrentMemberId(null);
    setSelectedSeatId(creatorSeatId);
    setProgressUnlocked(true);
    setMode("room");
    setTab("seats");
    setPhase("entry");
  }

  function registerSeat() {
    if (phase === "result") return;
    if (!selectedSeatId || !draftName.trim()) return;
    const existing = seats.find((s) => s.id === selectedSeatId)?.member;
    if (existing) return;
    const id = `member-${Date.now()}`;
    const member = {
      id,
      name: draftName.trim(),
      gender: draftGender,
      avatar: draftGender === "女性" ? "🌹" : "🥂",
      seatId: selectedSeatId,
    };
    setSeats((prev) => prev.map((s) => (s.id === selectedSeatId ? { ...s, member } : s)));
    setSelectedSeatId(null);
    setDraftName("");
  }

  function clearSeat(seatId) {
    if (phase === "result") return;
    const target = seats.find((s) => s.id === seatId)?.member;
    setSeats((prev) => prev.map((s) => (s.id === seatId ? { ...s, member: null } : s)));
    if (target) {
      setVotes((prev) => {
        const next = { ...prev };
        delete next[target.id];
        Object.keys(next).forEach((id) => {
          next[id] = next[id].filter((v) => v !== target.id);
        });
        return next;
      });
    }
    setSelectedSeatId(null);
  }

  function startVoting() {
    if (!progressUnlocked || filledSeats < 2) return;
    setPhase("voting");
    setTab("identify");
    setCurrentMemberId(null);
    setPendingVoterId(null);
  }

  function publishResults() {
    if (!canPublish) return;
    setPhase("result");
    setTab("result");
    setCurrentMemberId(null);
    setPendingVoterId(null);
  }

  function confirmVoter() {
    if (!pendingVoter) return;
    setCurrentMemberId(pendingVoter.id);
    setTab("vote");
  }

  function toggleVote(targetId) {
    if (!currentMember || phase !== "voting") return;
    setVotes((prev) => {
      const current = prev[currentMember.id] || [];
      if (current.includes(targetId)) {
        return { ...prev, [currentMember.id]: current.filter((id) => id !== targetId) };
      }
      if (!allowMultiple) return { ...prev, [currentMember.id]: [targetId] };
      if (current.length < maxSelectable) return { ...prev, [currentMember.id]: [...current, targetId] };
      return { ...prev, [currentMember.id]: [...current.slice(1), targetId] };
    });
  }

  function submitVote() {
    setCurrentMemberId(null);
    setPendingVoterId(null);
    setTab("identify");
  }

  function seatPosition(index, total) {
    if (tableShape === "round") {
      const angle = -90 + (360 / total) * index;
      const radius = 41;
      return {
        left: `${50 + radius * Math.cos((angle * Math.PI) / 180)}%`,
        top: `${50 + radius * Math.sin((angle * Math.PI) / 180)}%`,
        transform: "translate(-50%, -50%)",
      };
    }
    const half = Math.ceil(total / 2);
    const top = index < half;
    const pos = top ? index : index - half;
    const cols = top ? half : total - half;
    return {
      left: `${cols === 1 ? 50 : 13 + (74 * pos) / (cols - 1)}%`,
      top: top ? "16%" : "84%",
      transform: "translate(-50%, -50%)",
    };
  }

  function seatClass(member, active, compact) {
    const base = compact ? "h-12 w-12 text-xs" : "h-16 w-16";
    if (active) return `${base} border-[#f7d7a2] bg-[#f7d7a2]/20 text-white`;
    if (!member) return `${base} border-white/10 bg-black/35 text-white/45`;
    if (member.gender === "女性") return `${base} border-rose-300/50 bg-rose-500/25 text-rose-50`;
    return `${base} border-sky-300/45 bg-sky-500/20 text-sky-50`;
  }

  function Shell({ children }) {
    return (
      <div className="min-h-screen overflow-hidden bg-[#080409] text-[#fff7ea]">
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_5%,rgba(244,63,94,0.24),transparent_30%),radial-gradient(circle_at_90%_10%,rgba(251,191,36,0.12),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(190,24,93,0.20),transparent_35%)]" />
        <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-24 pt-4 sm:max-w-lg">
          <div className="mb-3 flex items-center justify-between text-xs text-[#f7d7a2]/70">
            <span>9:41</span>
            <span>●●● 5G 🔋</span>
          </div>
          {children}
        </div>
      </div>
    );
  }

  function PhaseBadge() {
    const label = phase === "entry" ? "入力・修正OK" : phase === "voting" ? "投票タイム" : "結果公表タイム";
    return <span className="rounded-full bg-rose-500/25 px-3 py-1 text-xs font-black text-rose-50">{label}</span>;
  }

  function SeatMap({ compact = false, creator = false }) {
    return (
      <div className={`relative overflow-hidden rounded-[2rem] border border-[#f7d7a2]/15 bg-[radial-gradient(circle_at_center,rgba(127,29,29,.55),rgba(8,4,9,.98)_62%)] ${compact ? "h-[250px]" : "h-[340px]"}`}>
        <div className={`absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center border border-[#f7d7a2]/20 bg-gradient-to-br from-[#5d1022] to-[#1b090e] ${tableShape === "round" ? (compact ? "h-28 w-28 rounded-full" : "h-40 w-40 rounded-full") : (compact ? "h-20 w-[68%] rounded-[1.5rem]" : "h-28 w-[72%] rounded-[2rem]")}`}>
          <div className="text-center">
            <p className={compact ? "text-xl" : "text-2xl"}>🕯️🌹🕯️</p>
            <p className="mt-1 text-xs text-[#f7d7a2]/75">{tableShape === "round" ? "円卓" : "長方形"}</p>
          </div>
        </div>
        {seats.map((seat, index) => {
          const active = creator ? creatorSeatId === seat.id : selectedSeatId === seat.id;
          return (
            <button
              key={seat.id}
              onClick={() => {
                if (creator) setCreatorSeatId(seat.id);
                else if (phase !== "result") setSelectedSeatId(seat.id);
              }}
              style={seatPosition(index, seats.length)}
              className={`absolute rounded-full border text-center shadow-xl active:scale-95 ${seatClass(seat.member, active, compact)}`}
            >
              <span className="block text-[10px] opacity-70">{seat.label}番</span>
              <span className="block truncate px-1 text-xs font-black">{seat.member ? seat.member.name : "空席"}</span>
              {seat.member?.gender && <span className="block text-[10px]">{seat.member.gender === "女性" ? "♀" : "♂"}</span>}
            </button>
          );
        })}
      </div>
    );
  }

  if (mode === "home") {
    return (
      <Shell>
        <section className="flex flex-1 flex-col justify-between rounded-[2.2rem] border border-[#f7d7a2]/20 bg-[#12080d]/80 p-5 shadow-[0_0_70px_rgba(244,63,94,.22)] backdrop-blur-xl">
          <div>
            <div className="mb-8 text-center">
              <p className="text-xs tracking-[0.45em] text-[#f7d7a2]/70">SECRET MATCH</p>
              <h1 className="mt-4 font-serif text-5xl font-black leading-tight text-[#ffe8b7]">Match<br />Room</h1>
              <p className="mx-auto mt-4 max-w-xs text-sm leading-7 text-[#e6c9aa]/75">ログインなし。幹事が部屋URLを作り、全員が席と名前を入力。本人確認後に投票し、最後に両想いだけ一括発表します。</p>
            </div>
            <div className="rounded-[2rem] border border-[#f7d7a2]/15 bg-black/30 p-4 text-sm leading-7 text-[#e6c9aa]/75">
              <p>1. 幹事が部屋・人数・配置を作成</p>
              <p>2. 幹事が自分の席も登録</p>
              <p>3. URLを共有して全員が席入力</p>
              <p>4. 誤操作防止ロックを解除して投票タイム開始</p>
              <p>5. 本人確認してから投票</p>
              <p>6. 全員投票後、確認して両想いを一括発表</p>
            </div>
          </div>
          <div className="grid gap-3">
            <button onClick={() => setMode("create")} className="rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-[#f7d7a2] px-5 py-4 text-sm font-black text-white">♡ 新しい部屋を作成する</button>
            <button onClick={openDemo} className="rounded-2xl border border-[#f7d7a2]/25 bg-black/30 px-5 py-4 text-sm font-black text-[#ffe8b7]">デモ部屋を見る</button>
          </div>
        </section>
      </Shell>
    );
  }

  if (mode === "create") {
    return (
      <Shell>
        <section className="flex-1 rounded-[2.2rem] border border-[#f7d7a2]/20 bg-[#12080d]/80 p-5 shadow-[0_0_70px_rgba(244,63,94,.22)] backdrop-blur-xl">
          <div className="mb-5 flex items-center justify-between">
            <button onClick={() => setMode("home")} className="rounded-full border border-[#f7d7a2]/15 px-3 py-2 text-xs text-[#f7d7a2]">← Top</button>
            <div className="text-center">
              <p className="text-[11px] tracking-[0.35em] text-[#f7d7a2]/70">CREATE ROOM</p>
              <h1 className="font-serif text-2xl font-bold text-[#ffe8b7]">部屋を作成</h1>
            </div>
            <button onClick={resetAll} className="rounded-full border border-[#f7d7a2]/15 px-3 py-2 text-xs text-[#f7d7a2]">Reset</button>
          </div>
          <div className="grid gap-4">
            <Panel title="部屋名">
              <input value={roomName} onChange={(e) => setRoomName(e.target.value)} className="input" placeholder="例：二次会、同窓会" />
            </Panel>
            <Panel title="テーブル配置">
              <div className="grid grid-cols-2 gap-2">
                <Choice active={tableShape === "round"} onClick={() => setTableShape("round")}>○ 円卓</Choice>
                <Choice active={tableShape === "rectangle"} onClick={() => setTableShape("rectangle")}>▭ 長方形</Choice>
              </div>
            </Panel>
            <Panel title="席数">
              <select value={seatCount} onChange={(e) => changeSeatCount(e.target.value)} className="input">
                {[4, 5, 6, 7, 8, 10, 12, 14, 16, 20].map((n) => <option key={n} value={n}>{n}席</option>)}
              </select>
              <p className="mt-2 text-xs text-[#e6c9aa]/65">空席ありで開始できます。</p>
            </Panel>
            <Panel title="作成者の席を登録">
              <SeatMap compact creator />
              <input value={creatorName} onChange={(e) => setCreatorName(e.target.value)} className="input mt-4" placeholder="あなたの名前" />
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Choice active={creatorGender === "女性"} onClick={() => setCreatorGender("女性")}>♀ 女性</Choice>
                <Choice active={creatorGender === "男性"} onClick={() => setCreatorGender("男性")}>♂ 男性</Choice>
              </div>
            </Panel>
            <Panel title="投票設定">
              <label className="flex items-center justify-between text-sm font-bold text-[#ffe8b7]">
                <span>複数人投票を許可</span>
                <input type="checkbox" checked={allowMultiple} onChange={(e) => setAllowMultiple(e.target.checked)} className="h-5 w-5 accent-rose-500" />
              </label>
              {allowMultiple && (
                <select value={maxVotes} onChange={(e) => setMaxVotes(Number(e.target.value))} className="input mt-3">
                  {[2, 3, 4, 5].map((n) => <option key={n} value={n}>最大 {n}人まで</option>)}
                </select>
              )}
            </Panel>
            <button onClick={createRoom} disabled={!creatorName.trim()} className="rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-[#f7d7a2] px-5 py-4 text-sm font-black text-white disabled:opacity-40">♡ 自分の席を登録して部屋URLを作成</button>
          </div>
        </section>
      </Shell>
    );
  }

  return (
    <Shell>
      <Header />
      <Tabs />
      {tab === "seats" && <SeatsScreen />}
      {tab === "identify" && <IdentifyScreen />}
      {tab === "vote" && <VoteScreen />}
      {tab === "result" && <ResultScreen />}
    </Shell>
  );

  function Header() {
    return (
      <div className="mb-4 rounded-[2rem] border border-[#f7d7a2]/20 bg-black/35 p-3 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <button onClick={() => setMode("home")} className="smallBtn">← Top</button>
          <div className="text-center">
            <p className="text-[11px] tracking-[0.35em] text-[#f7d7a2]/70">ROOM URL</p>
            <h1 className="font-serif text-xl font-bold text-[#ffe8b7]">{roomName}</h1>
          </div>
          <button onClick={resetAll} className="smallBtn">Reset</button>
        </div>
        <div className="mt-3 rounded-2xl border border-[#f7d7a2]/15 bg-[#12080d]/80 px-3 py-2 text-xs text-[#f5dcae]/80">{roomUrl}</div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <PhaseBadge />
          <span className="text-xs text-[#e6c9aa]/65">参加 {filledSeats}/{seatCount}・投票 {votedCount}/{filledSeats}</span>
        </div>
      </div>
    );
  }

  function Tabs() {
    const items = [["seats", "席入力"], ["identify", "投票"], ["result", "結果"]];
    return (
      <div className="mb-4 grid grid-cols-3 gap-2 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-1.5">
        {items.map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={`rounded-2xl px-3 py-2 text-xs font-bold ${tab === id || (id === "identify" && tab === "vote") ? "bg-rose-500/85 text-white" : "text-[#f7d7a2]/65"}`}>{label}</button>
        ))}
      </div>
    );
  }

  function SeatsScreen() {
    return (
      <section className="screen">
        <Title over="ENTRY" title="席と名前を入力" text="入力は結果公表前まで修正できます。幹事が投票タイムを開始します。" />
        <SeatMap />
        <Panel>
          {phase === "result" ? (
            <p className="text-center text-sm text-[#e6c9aa]/70">結果公表後は席を変更できません。</p>
          ) : !selectedSeatId ? (
            <p className="text-center text-sm text-[#e6c9aa]/70">空席をタップしてください。</p>
          ) : selectedSeat?.member ? (
            <div className="text-center">
              <p className="text-sm text-[#f7d7a2]/70">{selectedSeat.label}番席</p>
              <p className="mt-2 text-2xl font-black text-white">{selectedSeat.member.name}</p>
              <button onClick={() => clearSeat(selectedSeat.id)} className="mt-4 w-full rounded-2xl border border-rose-300/35 bg-rose-500/15 px-4 py-3 text-sm font-black text-rose-100">間違えて登録したので削除する</button>
            </div>
          ) : (
            <div>
              <p className="mb-3 text-center text-sm font-bold text-[#f7d7a2]">{selectedSeat.label}番席で参加</p>
              <input value={draftName} onChange={(e) => setDraftName(e.target.value)} className="input" placeholder="名前を入力" />
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Choice active={draftGender === "女性"} onClick={() => setDraftGender("女性")}>♀ 女性</Choice>
                <Choice active={draftGender === "男性"} onClick={() => setDraftGender("男性")}>♂ 男性</Choice>
              </div>
              <button onClick={registerSeat} disabled={!draftName.trim()} className="mainBtn mt-3">♡ この席で参加する</button>
            </div>
          )}
        </Panel>
        <Panel title="進行操作">
          <label className="mb-3 flex items-center justify-between gap-3 rounded-2xl border border-[#f7d7a2]/15 bg-black/25 px-4 py-3 text-sm font-bold text-[#ffe8b7]">
            <span>誤操作防止ロックを解除</span>
            <input type="checkbox" checked={progressUnlocked} onChange={(e) => setProgressUnlocked(e.target.checked)} className="h-5 w-5 accent-amber-400" />
          </label>
          <button onClick={startVoting} disabled={filledSeats < 2 || phase === "result" || !progressUnlocked} className="goldBtn">投票タイム開始</button>
          <p className="mt-2 text-center text-xs text-[#e6c9aa]/60">空席はOK。結果公表前なら席の追加・削除・修正ができます。進行ボタンはロック解除時だけ押せます。</p>
        </Panel>
      </section>
    );
  }

  function IdentifyScreen() {
    return (
      <section className="screen">
        <Title over="IDENTITY CHECK" title="本人確認" text="投票は本人だけができます。自分の名前を選んで確認してください。" />
        {phase !== "voting" ? (
          <Panel><p className="text-center text-sm text-[#e6c9aa]/70">現在は投票タイムではありません。</p></Panel>
        ) : (
          <>
            <div className="grid gap-3">
              {members.map((m) => {
                const done = (votes[m.id] || []).length > 0;
                const active = pendingVoterId === m.id;
                return (
                  <button key={m.id} onClick={() => setPendingVoterId(m.id)} className={`personCard ${active ? "border-rose-300 bg-rose-500/25" : "border-[#f7d7a2]/15 bg-black/25"}`}>
                    <Avatar member={m} />
                    <div className="min-w-0 flex-1">
                      <p className="font-black text-white">{m.seatId.replace("seat-", "")}番 {m.name}</p>
                      <p className="text-xs text-[#e6c9aa]/65">{m.gender}・{done ? "投票済み" : "未投票"}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            <Panel>
              {pendingVoter ? (
                <div className="text-center">
                  <p className="text-sm text-[#e6c9aa]/70">本当にこの人ですか？</p>
                  <p className="mt-1 text-2xl font-black text-white">{pendingVoter.name}さん</p>
                  <button onClick={confirmVoter} className="mainBtn mt-4">はい、本人です。投票する</button>
                </div>
              ) : (
                <p className="text-center text-sm text-[#e6c9aa]/70">自分の名前を選んでください。</p>
              )}
            </Panel>
            <button onClick={publishResults} disabled={!canPublish} className="outlineBtn mt-4 disabled:opacity-40">幹事が結果公表タイムへ進める</button>
            {!canPublish && <p className="mt-2 text-center text-xs text-[#e6c9aa]/60">登録済み全員が投票済み、かつ誤操作防止ロック解除中に公表できます。</p>}
          </>
        )}
      </section>
    );
  }

  function VoteScreen() {
    if (!currentMember || phase !== "voting") {
      return <section className="screen"><Panel><p className="text-center text-sm text-[#e6c9aa]/70">本人確認から投票してください。</p></Panel></section>;
    }
    return (
      <section className="screen">
        <Title over="SECRET VOTE" title="投票する" text="気になるお相手を選んでください。" />
        <Panel>
          <div className="flex items-center gap-4">
            <Avatar member={currentMember} large />
            <div>
              <p className="text-xs text-[#f7d7a2]/65">投票者</p>
              <p className="font-serif text-4xl font-black text-white">{currentMember.seatId.replace("seat-", "")}番</p>
              <p className="text-sm text-[#e6c9aa]/75">{currentMember.name}（本人確認済み）</p>
            </div>
          </div>
        </Panel>
        <div className="mb-4 grid grid-cols-2 gap-2">
          <Choice active={targetMode === "opposite"} onClick={() => setTargetMode("opposite")}>💘 異性のみ</Choice>
          <Choice active={targetMode === "all"} onClick={() => setTargetMode("all")}>👥 全員</Choice>
        </div>
        <div className="grid gap-3">
          {candidates.map((c) => {
            const selected = selectedVotes.includes(c.id);
            return (
              <button key={c.id} onClick={() => toggleVote(c.id)} className={`personCard ${selected ? "border-rose-300 bg-rose-500/25" : "border-[#f7d7a2]/15 bg-black/25"}`}>
                <Avatar member={c} />
                <div className="min-w-0 flex-1">
                  <p className="font-black text-white">{c.seatId.replace("seat-", "")}番 {c.name}</p>
                  <p className="text-xs text-[#e6c9aa]/65">{c.gender}</p>
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-full border text-xl ${selected ? "border-rose-200 bg-rose-500 text-white" : "border-white/20 text-white/55"}`}>♡</div>
              </button>
            );
          })}
        </div>
        <button onClick={submitVote} className="mainBtn mt-5">♡ 投票を確定して次の人へ（{selectedVotes.length}/{maxSelectable}）</button>
      </section>
    );
  }

  function ResultScreen() {
    return (
      <section className="screen">
        <Title over="PUBLIC RESULT" title="両想い発表" text="成立したペアだけ一括公表します。" />
        {phase !== "result" ? (
          <Panel>
            <p className="text-center text-xl font-black text-[#ffe8b7]">まだ結果公表前です</p>
            <button onClick={publishResults} disabled={!canPublish} className="goldBtn mt-4">結果公表タイムにする</button>
            <p className="mt-2 text-center text-xs text-[#e6c9aa]/60">登録済み全員が投票済み、かつ誤操作防止ロック解除中に公表できます。</p>
          </Panel>
        ) : mutualPairs.length > 0 ? (
          <div className="grid gap-4">
            {mutualPairs.map(([a, b]) => (
              <Panel key={`${a.id}-${b.id}`}>
                <div className="mb-4 flex items-center justify-center gap-4">
                  <Avatar member={a} large />
                  <div className="text-4xl">💗</div>
                  <Avatar member={b} large />
                </div>
                <p className="text-center font-serif text-2xl font-black text-white">{a.name}さん と {b.name}さん</p>
                <p className="mt-2 text-center text-sm text-[#ffe8b7]">両想い成立</p>
              </Panel>
            ))}
          </div>
        ) : (
          <Panel><p className="text-center text-xl font-black text-[#ffe8b7]">今回は両想いなし</p></Panel>
        )}
        <Panel title="ルーム状況">
          <div className="grid grid-cols-3 gap-2 text-center">
            <Stat label="参加" value={filledSeats} />
            <Stat label="空席" value={emptySeats} />
            <Stat label="成立" value={mutualPairs.length} />
          </div>
        </Panel>
        <Panel title="オプション：自分に届いた矢印を見る">
          <label className="flex items-center justify-between text-sm font-bold text-[#ffe8b7]">
            <span>確認する</span>
            <input type="checkbox" checked={showIncoming} onChange={(e) => setShowIncoming(e.target.checked)} className="h-5 w-5 accent-rose-500" />
          </label>
          {showIncoming && (
            <div className="mt-4 grid gap-3">
              <select value={currentMemberId || ""} onChange={(e) => setCurrentMemberId(e.target.value)} className="input">
                <option value="">自分の名前を選択</option>
                {members.map((m) => <option key={m.id} value={m.id}>{m.seatId.replace("seat-", "")}番 {m.name}</option>)}
              </select>
              {currentMember && <p className="rounded-2xl bg-white/[0.04] p-4 text-sm text-[#e6c9aa]/75">{currentMember.name}さんに届いた矢印：{incomingVotes.length}人</p>}
            </div>
          )}
        </Panel>
      </section>
    );
  }

  function Panel({ title, children }) {
    return (
      <div className="mb-4 rounded-[2rem] border border-[#f7d7a2]/15 bg-black/30 p-4">
        {title && <p className="mb-3 text-sm font-bold text-[#ffe8b7]">{title}</p>}
        {children}
      </div>
    );
  }

  function Choice({ active, onClick, children }) {
    const text = String(children);
    const isMale = text.includes("男性") || text.includes("♂");
    const activeClass = isMale
      ? "border-sky-300 bg-sky-500/35 text-white shadow-[0_0_18px_rgba(56,189,248,.25)]"
      : "border-rose-300 bg-rose-500/35 text-white shadow-[0_0_18px_rgba(244,63,94,.25)]";
    return <button onClick={onClick} className={`rounded-2xl border px-4 py-3 text-sm font-black ${active ? activeClass : "border-[#f7d7a2]/15 bg-black/25 text-[#f7d7a2]/70"}`}>{children}</button>;
  }

  function Title({ over, title, text }) {
    return (
      <div className="mb-4 text-center">
        <p className="text-xs tracking-[0.3em] text-[#f7d7a2]/70">{over}</p>
        <h2 className="mt-1 font-serif text-3xl font-black text-[#ffe8b7]">{title}</h2>
        <p className="mt-2 text-xs leading-5 text-[#e6c9aa]/70">{text}</p>
      </div>
    );
  }

  function Avatar({ member, large = false }) {
    const genderClass = member.gender === "女性" ? "border-rose-300/45 bg-rose-500/20" : "border-sky-300/45 bg-sky-500/20";
    return <div className={`flex items-center justify-center rounded-full border text-2xl ${genderClass} ${large ? "h-20 w-20 text-4xl" : "h-14 w-14"}`}>{member.avatar}</div>;
  }

  function Stat({ label, value }) {
    return <div className="rounded-2xl bg-white/[0.04] p-3"><p className="text-xs text-[#e6c9aa]/60">{label}</p><p className="mt-1 text-2xl font-black">{value}</p></div>;
  }
}
