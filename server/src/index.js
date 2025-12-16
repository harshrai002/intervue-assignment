import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import Poll from "./models/Poll.js";

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/polling-app";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB!");
  })
  .catch((error) => {
    console.log("MongoDB error:", error);
  });

// global state
let currentPoll = null;
let timeLeft = 0;
let timerInterval = null;
let connectedUsers = [];

const startTimer = (duration) => {
  timeLeft = duration;
  
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  
  io.emit("timerUpdate", timeLeft);
  
  timerInterval = setInterval(() => {
    timeLeft = timeLeft - 1;
    io.emit("timerUpdate", timeLeft);
    console.log("Timer:", timeLeft);
    
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      io.emit("timeUp");
    }
  }, 1000);
};

app.get("/", (req, res) => {
  res.json({ message: "Server running" });
});

// get all polls
app.get("/api/polls", async (req, res) => {
  try {
    const polls = await Poll.find().sort({ createdAt: -1 });
    res.json(polls);
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ error: "Failed to fetch polls" });
  }
});

// get poll by id
app.get("/api/polls/:id", async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      return res.status(404).json({ error: "Poll not found" });
    }
    res.json(poll);
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ error: "Failed to fetch poll" });
  }
});

// get current active poll
app.get("/api/current-poll", (req, res) => {
  if (currentPoll && timeLeft > 0) {
    res.json({ poll: currentPoll, timeLeft: timeLeft });
  } else {
    res.json({ poll: null, timeLeft: 0 });
  }
});

// create poll
app.post("/api/polls", async (req, res) => {
  try {
    const { question, options, timeLimit } = req.body;

    const newPoll = new Poll({
      question: question,
      options: options,
      timeLimit: timeLimit || 60,
    });

    const savedPoll = await newPoll.save();
    currentPoll = savedPoll;
    
    startTimer(savedPoll.timeLimit);
    
    io.emit("newPoll", { poll: savedPoll, timeLeft: savedPoll.timeLimit });

    res.status(201).json(savedPoll);
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ error: "Failed to create poll" });
  }
});

io.on("connection", (socket) => {
  console.log("user connected:", socket.id);

  socket.on("studentJoin", (studentName) => {
    // check if name already exists
    const nameExists = connectedUsers.some(
      user => user.name.toLowerCase().trim() === studentName.toLowerCase().trim()
    );
    
    if (nameExists) {
      socket.emit("nameError", "This name is already taken. Please use a different name.");
      return;
    }
    
    const student = {
      id: socket.id,
      name: studentName,
    };
    connectedUsers.push(student);
    io.emit("usersUpdate", connectedUsers);
    console.log("Student joined:", studentName);
    
    // send success with current poll data
    socket.emit("joinSuccess", { 
      poll: currentPoll, 
      timeLeft: timeLeft 
    });
  });

  // student requests current poll when they reach waiting page
  socket.on("getCurrentPoll", () => {
    if (currentPoll) {
      socket.emit("newPoll", { poll: currentPoll, timeLeft: timeLeft });
    }
  });

  socket.on("teacherJoin", () => {
    console.log("Teacher joined, timeLeft:", timeLeft);
    socket.emit("usersUpdate", connectedUsers);
    
    if (currentPoll) {
      socket.emit("currentPoll", { poll: currentPoll, timeLeft: timeLeft });
      socket.emit("timerUpdate", timeLeft);
    }
  });

  socket.on("submitAnswer", async (data) => {
    try {
      const { pollId, optionIndex } = data;

      const poll = await Poll.findById(pollId);
      if (poll) {
        poll.options[optionIndex].votes = poll.options[optionIndex].votes + 1;
        await poll.save();
        currentPoll = poll;
        io.emit("pollUpdate", poll);
      }
    } catch (error) {
      console.log("Error:", error);
    }
  });

  socket.on("kickStudent", (studentId) => {
    connectedUsers = connectedUsers.filter((user) => user.id !== studentId);
    io.to(studentId).emit("kicked");
    io.emit("usersUpdate", connectedUsers);
  });

  socket.on("disconnect", () => {
    connectedUsers = connectedUsers.filter((user) => user.id !== socket.id);
    io.emit("usersUpdate", connectedUsers);
    console.log("user disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
