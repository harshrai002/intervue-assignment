import Poll from "../models/Poll.js";

// store current poll and timer - shared across app
export let currentPoll = null;
export let timeLeft = 0;
let timerInterval = null;

// start timer function
export const startTimer = (duration, io) => {
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

export const getAllPolls = async (req, res) => {
  try {
    const polls = await Poll.find().sort({ createdAt: -1 });
    res.json(polls);
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ error: "Failed to fetch polls" });
  }
};

export const getPollById = async (req, res) => {
  try {
    const pollId = req.params.id;
    const poll = await Poll.findById(pollId);

    if (!poll) {
      return res.status(404).json({ error: "Poll not found" });
    }

    res.json(poll);
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ error: "Failed to fetch poll" });
  }
};

export const createPoll = async (req, res, io) => {
  try {
    const { question, options, timeLimit } = req.body;

    const newPoll = new Poll({
      question: question,
      options: options,
      timeLimit: timeLimit || 60,
    });

    const savedPoll = await newPoll.save();
    currentPoll = savedPoll;
    
    startTimer(savedPoll.timeLimit, io);
    
    io.emit("newPoll", { poll: savedPoll, timeLeft: savedPoll.timeLimit });

    res.status(201).json(savedPoll);
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ error: "Failed to create poll" });
  }
};
