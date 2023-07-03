import mongoose from "mongoose";

const ContentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Enter Title"],
  },
  zip: {
    type: String,
    required: [true, "Upload Zip file"],
  },
  tags: {
    type: [mongoose.Schema.ObjectId],
    ref: "Tag",
    required: true,
  },
  ageRating: {
    type: String,
    enum: ["Adult", "Naughty", "Universal"],
    required: true,
  },
  language: {
    type: mongoose.Schema.ObjectId,
    ref: "Language",
    required: true,
  },
  thumbnail: {
    type: String,
  },
  livelink: {
    type: String,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  liveDate: {
    type: Date,
  },
  disabledDate: {
    type: Date,
  },
  creatorId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  description: {
    type: String,
    min: 10,
    required: [true, "Enter Description"],
  },
  story: {
    type: Array,
  },
  visual: {
    type: Array,
  },
  audio: {
    type: Array,
  },
  completeProject: {
    type: Array,
  },
  allocated: [
    {
      allocatedBy: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
      allocatedTo: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    },
  ],
  liveStatus: {
    type: String,
    enum: ["Live", "Not Live", "Scheduled"],
    default: "Not Live",
  },
  verifiedStatus: {
    type: Boolean,
    default: false,
  },
  merchandise: {
    type: Boolean,
    default: false,
  },
  merchandiseNote: {
    type: String,
  },
  contentData: {
    type: Object,
  },
  verifiedBy: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
});

const Content = mongoose.model("Content", ContentSchema);
export default Content;
