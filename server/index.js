import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.get("/players", async (req, res) => {
  const { data, error } = await supabase.from("Player").select("*");
  if (error) return res.status(500).json(error);
  res.json(data);
});

app.post("/players", async (req, res) => {
  const { username } = req.body;
  const { data, error } = await supabase.from("Player").insert([{ username, gold: 0, health: 1 }]).select();
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

app.listen(5000, () => console.log("Server running on port 5000"));
