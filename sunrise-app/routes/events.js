import express from "express";
const router = express.Router();

// Simple in-memory storage
let events = [
  { id: 1, title: "Meeting", start: "2025-11-20" },
  { id: 2, title: "Exam", start: "2025-11-22" },
];

// GET all events
router.get("/", (req, res) => res.json(events));

// POST a new event
router.post("/", (req, res) => {
  const event = req.body;
  event.id = events.length + 1; // simple incremental ID
  events.push(event);
  res.json(event);
});

// PUT to update event (optional)
router.put("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = events.findIndex(e => e.id === id);
  if (index !== -1) {
    events[index] = { ...events[index], ...req.body };
    return res.json(events[index]);
  }
  res.status(404).send("Event not found");
});

// DELETE an event (optional)
router.delete("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  events = events.filter(e => e.id !== id);
  res.sendStatus(204);
});

export default router;
