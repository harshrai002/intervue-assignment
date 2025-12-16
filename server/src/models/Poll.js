import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
  text: String,
  isCorrect: Boolean,
  votes: { type: Number, default: 0 },
});

const pollSchema = new mongoose.Schema({
  question: String,
  options: [optionSchema],
  timeLimit: Number,
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
});

const Poll = mongoose.model("Poll", pollSchema);

export default Poll;
