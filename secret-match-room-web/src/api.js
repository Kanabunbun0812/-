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
      phase: "entry",
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
