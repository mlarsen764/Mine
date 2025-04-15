import { supabase } from ".";

export const saveGameState = async ({ userId, tiles, currentPosition, gold, allies, items }) => {
  const { error } = await supabase
    .from("game_state")
    .upsert([
      {
        user_id: userId,
        board: tiles,
        position: currentPosition,
        gold,
        allies,
        items,
      },
    ], { onConflict: "user_id" });

  if (error) {
    console.error("Error saving game state:", error);
  }
};

export const loadGameState = async (userId) => {
  const { data, error } = await supabase
    .from("game_state")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error loading game state:", error);
    return null;
  }

  return data;
};

export const resetGameState = async (userId) => {
  const { error } = await supabase
    .from("game_state")
    .delete()
    .eq("user_id", userId);

  if (error) {
    console.error("Error resetting game state:", error);
  }
};