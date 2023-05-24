import mongoose from "mongoose";

const TagSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Enter tag name"],
        unique: true,
    },
    createdDate: {
        type: Date,
        default: Date.now(),
    },
});

const Tag = mongoose.model("Tag", TagSchema);
export default Tag;
