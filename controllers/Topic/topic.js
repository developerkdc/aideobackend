import catchAsyncErrors from "../../middlewares/catchAsyncErrors.js";
import Topic from "../../models/Topic.js";
import Errorhandler from "../../utils/errorHandler.js";

export const addTopic = catchAsyncErrors(async (req, res, next) => {
    const { name, description, tags } = req.body;
    const topic = new Topic({
        name: name,
        description: description,
        tags: tags,
    });
    const savedtopic = await topic.save();
    return res.status(200).json(savedtopic);
});

export const getAllTopics = catchAsyncErrors(async (req, res, next) => {
    const topic = await Topic.find()
    .sort({ position: 1 })
    .populate({ path: "tags", select: "name" })
    .lean();
    return res.status(200).json(topic);
});

export const arrangeTopic = catchAsyncErrors(async (req, res, next) => {
    const { oldpos, position } = req.params;

    // Find the topic by ID
    const topic = await Topic.findOne({ position: oldpos });

    if (!topic) {
        return next(new Errorhandler("Topic Not Found", 404));
    }

    // Get the current position of the topic
    const currentPos = topic.position;
    if (currentPos != position) {
        // Retrieve all topics with position greater than or equal to the desired position
        if (position < currentPos) {
            const topicsToUpdate = await Topic.find({
                position: { $gte: position, $lte: currentPos - 1 },
            });

            // Update the positions of the topics to create space for the new position
            const updatePromises = topicsToUpdate.map(async (t) => {
                const updatedPosition = t.position + 1;
                await Topic.findByIdAndUpdate(
                    t._id,
                    { position: updatedPosition },
                    { new: true }
                );
            });
            await Promise.all(updatePromises);
        }
        if (position > currentPos) {
            const topicsToUpdate = await Topic.find({
                position: { $gte: currentPos, $lte: position },
            });

            // Update the positions of the topics to create space for the new position
            const updatePromises = topicsToUpdate.map(async (t) => {
                const updatedPosition = t.position - 1;
                await Topic.findByIdAndUpdate(
                    t._id,
                    { position: updatedPosition },
                    { new: true }
                );
            });
            await Promise.all(updatePromises);
        }

        // Update the position of the moved topic
        topic.position = position;
        await topic.save();

        // Send the updated topics as response
        const updatedTopics = await Topic.find().sort({ position: 1 });
        res.status(200).json({ success: true, topics: updatedTopics });
    } else {
        return next(
            new Errorhandler("Topic Already present on that position", 500)
        );
    }
});

export const updateTopicStatus = catchAsyncErrors(async (req, res, next) => {
    const Id = req.body.id;
    const newUserRole = {
        status: req.body.status,
    };
    if (!req.body.id) {
        return next(new Errorhandler("Provide id & status", 500));
    }
    const topic = await Topic.findByIdAndUpdate(Id, newUserRole, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    if (!topic) {
        return next(new Errorhandler("UserId does not exist", 404));
    }

    return res.status(200).json({
        success: true,
    });
});

export const deleteTopic = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const topic = await Topic.findById(id);
    const currentPos = topic.position;
    await Topic.findByIdAndRemove(id);
    const topicsToUpdate = await Topic.find({
        position: { $gte: currentPos },
    });

    // Update the positions of the topics to create space for the new position
    const updatePromises = topicsToUpdate.map(async (t) => {
        const updatedPosition = t.position - 1;
        await Topic.findByIdAndUpdate(
            t._id,
            { position: updatedPosition },
            { new: true }
        );
    });
    await Promise.all(updatePromises);
    
    return res.status(200).json({ message: "Topic deleted successfully" });
});

export const editTopic = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    const {name} = req.body ;
    const data = {name:name}
    const topic = await Topic.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });
    const updatedTopic = await topic.save();
    return res.status(200).json(updatedTopic);
});


export const addTopicContent = catchAsyncErrors(async(req,res,next)=>{
    const {contentIds,tagIds} = req.body
    const {topicId} = req.params
    const topic = await Topic.findByIdAndUpdate(topicId,{contentId:contentIds,tags:tagIds},{
        new: true,
        runValidators: true,
        useFindAndModify: false,
    })
    const updatedTopic = await topic.save()
    return res.status(200).json(updatedTopic);
})