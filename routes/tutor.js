const express = require("express");
const { COURSES } = require("../src/courses");
const { getCurriculum } = require("../src/curriculum");
const db = require("../src/db");
const { requireTutor } = require("../src/tutor-auth");

const router = express.Router();

const VALID_STATUSES = new Set(["not_started", "in_progress", "done"]);

router.get("/curriculum", requireTutor, async (req, res) => {
  const progressRows = await db.getAllProgress();
  const progressByKey = {};
  for (const row of progressRows) {
    progressByKey[`${row.course_id}:${row.week_number}`] = {
      status: row.status,
      note: row.note,
      updatedBy: row.updated_by,
      updatedAt: row.updated_at,
    };
  }

  const courses = COURSES.map((c) => {
    const curriculum = getCurriculum(c.id);
    const weeks = (curriculum?.weeks || []).map((w) => ({
      ...w,
      progress: progressByKey[`${c.id}:${w.number}`] || { status: "not_started", note: null },
    }));
    const doneCount = weeks.filter((w) => w.progress.status === "done").length;
    return {
      id: c.id,
      name: c.name,
      duration: c.duration,
      overview: curriculum?.overview || "",
      finalProject: curriculum?.finalProject || "",
      weeks,
      percentComplete: weeks.length ? Math.round((doneCount / weeks.length) * 100) : 0,
    };
  });

  res.json({ courses });
});

router.post("/progress", requireTutor, async (req, res) => {
  const { courseId, week, status, note, updatedBy } = req.body || {};
  if (!courseId || !getCurriculum(courseId)) return res.status(400).json({ error: "Unknown course." });
  const weekNum = Number(week);
  if (!Number.isInteger(weekNum) || weekNum < 1) return res.status(400).json({ error: "Invalid week." });
  if (!VALID_STATUSES.has(status)) return res.status(400).json({ error: "Invalid status." });

  const updated = await db.upsertProgress(courseId, weekNum, {
    status,
    note: note ? String(note).slice(0, 2000) : null,
    updatedBy: updatedBy ? String(updatedBy).slice(0, 100) : null,
  });
  res.json({ ok: true, progress: updated });
});

module.exports = router;
