import mongoose from "mongoose";

const LanguageSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: [true, "Enter tag name"],
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

const Language = mongoose.model("Language", LanguageSchema);
export default Language;
