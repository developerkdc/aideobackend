import mongoose from "mongoose";

const LogSchema = new mongoose.Schema({
  contentId: {
    type: mongoose.Schema.ObjectId,
    ref: "Content",
  },
  city: {
    type: String,
  },
  tagIds: {
    type: Array,
  },
  watchDuration: {
    type: Number,
  },
});

const Log = mongoose.model("Log", LogSchema);
export default Log;
