import { supabase } from "./supabaseClient";

export function makeRoomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function createRoomInDb({
  roomName,
  tableShape,
  seatCount,
  allowMultiple,
  maxVotes,
  targetMode,
}) {
  const roomCode = makeRoomCode();

  const { data, error } = await supabase
    .from("rooms")
    .insert({
      room_code: roomCode,
      room_name: roomName,
      table_shape: tableShape,
      seat_count: seatCount,
      allow_multiple: allowMultiple,
      max_votes: maxVotes,
      target_mode: targetMode || "opposite",
      phase: "entry",
      current_round: 1,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getRoomByCode(roomCode) {
  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("room_code", roomCode)
    .single();

  if (error) throw error;
  return data;
}

export async function getMembers(roomId) {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("room_id", roomId)
    .order("seat_id", { ascending: true });

  if (error) throw error;
  return data;
}

export async function addMemberToDb({ roomId, seatId, name, gender }) {
  const avatar = gender === "女性" ? "🌹" : "🥂";

  const { data, error } = await supabase
    .from("members")
    .insert({
      room_id: roomId,
      seat_id: seatId,
      name,
      gender,
      avatar,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteMemberFromDb(memberId) {
  const { error } = await supabase
    .from("members")
    .delete()
    .eq("id", memberId);

  if (error) throw error;
}

export async function getVotes(roomId, roundNumber) {
  let query = supabase
    .from("votes")
    .select("*")
    .eq("room_id", roomId);

  if (roundNumber !== undefined && roundNumber !== null) {
    query = query.eq("round_number", roundNumber);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function replaceVotesInDb({ roomId, roundNumber, fromMemberId, toMemberIds }) {
  const round = roundNumber || 1;

  const { error: deleteError } = await supabase
    .from("votes")
    .delete()
    .eq("room_id", roomId)
    .eq("round_number", round)
    .eq("from_member_id", fromMemberId);

  if (deleteError) throw deleteError;

  if (!toMemberIds.length) return [];

  const rows = toMemberIds.map((toMemberId) => ({
    room_id: roomId,
    round_number: round,
    from_member_id: fromMemberId,
    to_member_id: toMemberId,
  }));

  const { data, error } = await supabase
    .from("votes")
    .insert(rows)
    .select();

  if (error) throw error;
  return data;
}

export async function updateRoomPhase(roomId, phase) {
  const { data, error } = await supabase
    .from("rooms")
    .update({ phase })
    .eq("id", roomId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateRoomPhaseAndRound(roomId, phase, currentRound) {
  const { data, error } = await supabase
    .from("rooms")
    .update({ phase, current_round: currentRound })
    .eq("id", roomId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteRoomFromDb(roomId) {
  const { error } = await supabase
    .from("rooms")
    .delete()
    .eq("id", roomId);

  if (error) throw error;
}
