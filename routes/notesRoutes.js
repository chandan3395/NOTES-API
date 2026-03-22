const express = require("express");
const {createNote,getNoteById,updateNote,getNotes, deleteNote,getAdminStats} = require("../controller/notesController") ;
const {protect} = require("../middleware/protect") ;
const { validateCreateNote } = require("../middleware/noteValidation");
const restrictTo = require("../middleware/restrictTo");
const checkOwnership = require("../middleware/checkOwnership");


// creates a mini router
const router = express.Router();
// CRUD
router.post("/", protect, validateCreateNote, createNote);
// get notes doesn't need ownership check – it already filters by user inside the controller
router.get("/", protect, getNotes);
// single-note routes still use checkOwnership
router.get("/:id", protect, checkOwnership, getNoteById);
router.put("/:id", protect, checkOwnership, updateNote);
router.delete("/:id", protect, checkOwnership, deleteNote);

// admin stats endpoint – place before the ":id" route so it isn't treated as an ID
router.get("/admin/stats", protect, restrictTo("admin"), getAdminStats);

module.exports = router ;