import express from "express";
import cors from "cors";
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: './db.env' });

const { Pool } = pkg;
const app = express();   // ✅ ประกาศ app ก่อน
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());   // ✅ ค่อยเรียกหลังจาก app ถูกสร้างแล้ว

// PostgreSQL pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Routes
app.get("/api/transactions", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM transactions ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/transactions", async (req, res) => {
  const { name, type, amount } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO transactions (name, type, amount) VALUES ($1, $2, $3) RETURNING *",
      [name, type, amount]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/transactions/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM transactions WHERE id = $1", [id]);
    res.json({ message: "Transaction deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
