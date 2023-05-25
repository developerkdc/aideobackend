import mongoose from "mongoose";

const CreditsSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
    }
});

const Credits = mongoose.model("Credits", CreditsSchema);
export default Credits;
