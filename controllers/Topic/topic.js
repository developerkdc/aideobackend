import catchAsyncErrors from "../../middlewares/catchAsyncErrors.js";
import Content from "../../models/Content.js";
import Log from "../../models/Logs.js";
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
  const { name } = req.body;
  const data = { name: name };
  const topic = await Topic.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  const updatedTopic = await topic.save();
  return res.status(200).json(updatedTopic);
});

export const addTopicContent = catchAsyncErrors(async (req, res, next) => {
  const { contentIds, tagIds } = req.body;
  // console.log(tagIds)
  const { topicId } = req.params;
  const topic = await Topic.findByIdAndUpdate(
    topicId,
    { contentId: contentIds, tags: tagIds },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );
  const updatedTopic = await topic.save();
  return res.status(200).json(updatedTopic);
});

export const configTopicSelectType = catchAsyncErrors(
  async (req, res, next) => {
    const { topicId } = req.params;
    const { configType } = req.body;
    const topic = await Topic.findByIdAndUpdate(
      topicId,
      { configType },
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    );
    const updatedTopic = await topic.save();
    return res.status(200).json(updatedTopic);
  }
);

//Mobile Apis

// export const getAllTopicByCity = catchAsyncErrors(async (req, res, next) => {
//   const { city } = req.params;

//   const topics = await Topic.find({ status: "active" })
//     .sort({ position: 1 })
//     .populate({ path: "tags", select: "_id" });

//   const autoTopics = topics.filter((topic) => topic.configType === "auto");

//   for (const topic of autoTopics) {
//     const tagIds = topic.tags.map((tag) => tag._id.toString());

//     const logs = await Log.aggregate([
//       { $match: { city: city, tagIds: { $in: tagIds } } },
//       { $sort: { watchDuration: -1 } },
//       {
//         $group: {
//           _id: "$contentId",
//           watchDuration: { $first: "$watchDuration" },
//         },
//       },
//       { $project: { _id: 0, contentId: "$_id" } },
//     ]);

//     const contentIds = logs.map((log) => log.contentId);

//     // Update the contentId property of the topic only if it is an auto topic
//     topic.contentId = contentIds;
//   }

//   const formattedTopics = topics.map((topic) => {
//     return {
//       _id: topic._id,
//       name: topic.name,
//       status: topic.status,
//       tags: topic.tags,
//       description: topic.description,
//       contentId: topic.configType === "auto" ? topic.contentId : topic.contentId.map(String),
//       position: topic.position,
//       createdDate: topic.createdDate,
//       __v: topic.__v,
//       configType: topic.configType,
//     };
//   });

//   const formattedOutput = JSON.stringify(formattedTopics, null, 4);

//   console.log(formattedOutput);

//   res.send(topics);
// });

export const getAllTopicByCity = catchAsyncErrors(async (req, res, next) => {
  const { city } = req.params;

  const topics = await Topic.find({ status: "active" })
    .sort({ position: 1 })
    .populate({ path: "tags", select: "_id" });

  for (const topic of topics) {
    const contentIds = topic.contentId;

    const contentDetails = await Content.find(
      { _id: { $in: contentIds } },
      { title: 1, thumbnail: 1 }
    );

    topic.content = contentDetails.map((content) => {
      return {
        contentId: content._id,
        title: content.title,
        thumbnail: content.thumbnail,
      };
    });
  }

  const formattedTopics = topics.map((topic) => {
    return {
      _id: topic._id,
      name: topic.name,
      status: topic.status,
      tags: topic.tags,
      description: topic.description,
      content: topic.content,
      position: topic.position,
      createdDate: topic.createdDate,
      __v: topic.__v,
      configType: topic.configType,
    };
  });

  const formattedOutput = JSON.stringify(formattedTopics, null, 4);

  console.log(formattedOutput);

  res.send(formattedTopics);
});
