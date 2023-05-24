import mongoose from "mongoose";

const TopicSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Enter topic name"],
        unique: true,
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
    },
    tags: {
        type: [mongoose.Schema.ObjectId],
        ref: "Tag",
    },
    description: {
        type: String,
        min: 10,
        required: [true, "Enter Description"],
    },
    contentId:{
        type: [mongoose.Schema.ObjectId],
        ref: "Content"
    },
    position: {
        type: Number,
        default: 0,
    },
    createdDate: {
        type: Date,
        default: Date.now(),
    },
});

TopicSchema.pre("save", async function (next) {
    if (this.isNew) {
        // Only increment position for new documents
        const latestTopic = await this.constructor
            .findOne({}, "position")
            .sort("-position")
            .exec();

        this.position = latestTopic ? latestTopic.position + 1 : 0;
    }

    next();
});

const Topic = mongoose.model("Topic", TopicSchema);
export default Topic;
