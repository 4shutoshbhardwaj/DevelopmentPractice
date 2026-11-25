const express = require("express");
const db = require("./config/db");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors({
  origin: "http://localhost:3000",
}));

app.use(express.json());

// Test MySQL connection
db.getConnection((error, connection) => {
  if (error) {
    console.error("MySQL connection failed:", error.message);
    return;
  }

  console.log("MySQL connected successfully!");

  connection.release();
});

// Health check API
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend server is running!",
  });
});

app.get("/api/students", (req, res) => {
  const sql = "SELECT * FROM students";

  db.query(sql, (error, results) => {
    if (error) {
      console.error("Error fetching students:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch students",
      });
    }

    res.status(200).json({
      success: true,
      students: results,
    });
  });
});

app.post("/api/students", (req, res) => {
  const { name, email, course, age, status } = req.body;

  const sql = `
    INSERT INTO students (name, email, course, age, status)
    VALUES (?, ?, ?, ?, ?)
  `;

  const values = [
    name,
    email,
    course,
    age,
    status || "Active",
  ];

  db.query(sql, values, (error, result) => {
    if (error) {
      console.error("Error adding student:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to add student",
      });
    }

    res.status(201).json({
      success: true,
      message: "Student added successfully!",
      studentId: result.insertId,
    });
  });
});

app.put("/api/students/:id", (req, res) => {
  const { id } = req.params;
  const { name, email, course, age, status } = req.body;

  const sql = `
    UPDATE students
    SET name = ?, email = ?, course = ?, age = ?, status = ?
    WHERE id = ?
  `;

  const values = [name, email, course, age, status, id];

  db.query(sql, values, (error, result) => {
    if (error) {
      console.error("Error updating student:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to update student",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Student updated successfully!",
    });
  });
});

app.delete("/api/students/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM students WHERE id = ?";

  db.query(sql, [id], (error, result) => {
    if (error) {
      console.error("Error deleting student:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to delete student",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Student deleted successfully!",
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});