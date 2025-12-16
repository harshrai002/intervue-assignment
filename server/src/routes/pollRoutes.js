import express from "express";
import { getAllPolls, getPollById, createPoll } from "../controllers/pollController.js";

const router = express.Router();

// pass io to routes using middleware
export default function(io) {
  router.get("/", getAllPolls);
  router.get("/:id", getPollById);
  router.post("/", (req, res) => createPoll(req, res, io));
  
  return router;
}
