import catchAsyncErrors from "../../middlewares/catchAsyncErrors.js";
import Content from "../../models/Content.js";
import path from "path";
import User from "../../models/User.js";
import Topic from "../../models/Topic.js";
import AdmZip from "adm-zip";
import fs from "fs";
import { promisify } from "util";
import yauzl from "yauzl";
import { fileURLToPath } from "url";
import { dirname } from "path";
import cron from "node-cron";
import schedule from "node-schedule";
import mongoose from "mongoose";
import Errorhandler from "../../utils/errorHandler.js";
import ApiFeatures from "../../utils/apiFeatures.js";
import Credits from "../../models/Credits.js";
import Log from "../../models/Logs.js";
const mkdirAsync = promisify(fs.mkdir);

// export const addContent = catchAsyncErrors(async (req, res, next) => {
//   const {
//     title,
//     zip,
//     tags,
//     ageRating,
//     language,
//     thumbnail,
//     livelink,
//     creatorId,
//     description,
//     story,
//     visual,
//     audio,
//     completeProject,
//     allocated,
//   } = req.body;

//   // Ensure both files are provided
//   if (!zip || !thumbnail) {
//     return res
//       .status(400)
//       .json({ error: "Both zipfile and imagefile are required" });
//   }

//   // Create a new content object
//   const content = new Content({
//     title,
//     zip,
//     tags,
//     ageRating,
//     language,
//     thumbnail,
//     livelink,
//     creatorId: req.user._id,
//     description,
//     story,
//     visual,
//     audio,
//     completeProject,
//     allocated, // Assuming you have user authentication and req.user contains the user ID
//   });

//   // Save the content object to the database
//   const savedContent = await content.save();

//   const contentId = savedContent._id;

//   // Update the user's contentId field
//   await User.findByIdAndUpdate(req.user._id, {
//     $push: { contentId: savedContent._id },
//   });

//   // Extract files from the zip and update ContentData
//   const zipFile = new AdmZip(fs.readFileSync(zip));
//   const zipEntries = zipFile.getEntries();

//   const folderName = path.basename(zip, path.extname(zip));
//   const folderEntries = zipEntries.filter((entry) =>
//     entry.entryName.startsWith(folderName)
//   );

//   // Check if the zip file contains the expected folder
//   if (folderEntries.length === 0) {
//     return res.status(400).json({ error: "Invalid zip file structure" });
//   }
//   res.status(200).json("Content Uploaded Successfully");
//   // Get the current file path
//   const currentFilePath = fileURLToPath(import.meta.url);

//   // Determine the directory path
//   const uploadDirectory = path.join(dirname(currentFilePath), "uploads");

//   // Create the directory if it doesn't exist
//   if (!fs.existsSync(uploadDirectory)) {
//     fs.mkdirSync(uploadDirectory, { recursive: true });
//   }

//   // Find the index.json entry
//   const indexJsonEntry = folderEntries.find(
//     (entry) => entry.name === "index.json"
//   );

//   // Check if index.json is found
//   if (!indexJsonEntry) {
//     return res.status(400).json({ error: "index.json file not found" });
//   }

//   // Generate a unique filename for index.json
//   const uniqueFileName = `${Date.now()}-index.json`;

//   // Save the index.json file to the desired directory
//   const indexJsonPath = path.join(uploadDirectory, uniqueFileName);
//   fs.writeFileSync(indexJsonPath, indexJsonEntry.getData());

//   const jsondata = JSON.parse(fs.readFileSync(indexJsonPath));

//   // Create a folder for the content ID
//   const contentFolder = path.join(uploadDirectory, contentId.toString());

//   // Create the folder if it doesn't exist
//   if (!fs.existsSync(contentFolder)) {
//     fs.mkdirSync(contentFolder, { recursive: true });
//   }

//   // Process and update file paths in index.json
//   const processFilePaths = (obj, basePath = "") => {
//     if (typeof obj !== "object" || obj === null) {
//       return;
//     }
//     for (let key in obj) {
//       if (key === "Source" && typeof obj[key] === "string") {
//         const filePath = obj[key];
//         const fileName = path.basename(filePath);
//         const folderPath = path.join(
//           "controllers",
//           "Content",
//           "uploads",
//           contentId.toString()
//         );
//         const newFilePath = path.join(basePath, folderPath, fileName);
//         obj[key] = newFilePath;
//         const fileEntry = folderEntries.find((entry) =>
//           entry.entryName.endsWith(fileName)
//         );
//         if (fileEntry) {
//           const filePath = path.join(folderPath, fileName);
//           fs.writeFileSync(filePath, fileEntry.getData());
//         }
//       } else {
//         processFilePaths(obj[key], basePath);
//       }
//     }
//   };

//   processFilePaths(jsondata, "");

//   // Update the contentData field in the content object
//   await Content.findByIdAndUpdate(
//     content._id,
//     { contentData: jsondata },
//     { new: true, useFindAndModify: false }
//   );
// });

export const addContent = catchAsyncErrors(async (req, res, next) => {
  const {
    title,
    zip,
    tags,
    ageRating,
    language,
    thumbnail,
    livelink,
    creatorId,
    description,
    story,
    visual,
    audio,
    completeProject,
    allocated,
  } = req.body;

  // Ensure both files are provided
  if (!zip || !thumbnail) {
    return res
      .status(400)
      .json({ error: "Both zipfile and imagefile are required" });
  }

  // Create a new content object
  const content = new Content({
    title,
    zip,
    tags,
    ageRating,
    language,
    thumbnail,
    livelink,
    creatorId: req.user._id,
    description,
    story,
    visual,
    audio,
    completeProject,
    allocated, // Assuming you have user authentication and req.user contains the user ID
  });

  // Save the content object to the database
  const savedContent = await content.save();

  const contentId = savedContent._id;

  // Update the user's contentId field
  await User.findByIdAndUpdate(req.user._id, {
    $push: { contentId: savedContent._id },
  });

  // Extract files from the zip and update ContentData
  const zipFile = new AdmZip(fs.readFileSync(zip));
  const zipEntries = zipFile.getEntries();

  const folderName = path.basename(zip, path.extname(zip));
  const folderEntries = zipEntries.filter((entry) =>
    entry.entryName.startsWith(folderName)
  );

  // Check if the zip file contains the expected folder
  if (folderEntries.length === 0) {
    return res.status(400).json({ error: "Invalid zip file structure" });
  }
  res.status(200).json("Content Uploaded Successfully");
  // Get the current file path
  const currentFilePath = fileURLToPath(import.meta.url);

  // Determine the directory path
  const uploadDirectory = path.join(dirname(currentFilePath), "uploads");

  // Create the directory if it doesn't exist
  if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
  }

  // Find the index.json entry
  const indexJsonEntry = folderEntries.find(
    (entry) => entry.name === "index.json"
  );

  if (!indexJsonEntry) {
    return res.status(400).json({ error: "index.json file not found" });
  }

  // Create a folder for the content ID
  const contentFolder = path.join(uploadDirectory, contentId.toString());

  // Create the folder if it doesn't exist
  if (!fs.existsSync(contentFolder)) {
    fs.mkdirSync(contentFolder, { recursive: true });
  }

  // Save the index.json file to the content folder
  const contentIndexPath = path.join(contentFolder, "index.json");
  fs.writeFileSync(contentIndexPath, indexJsonEntry.getData());

  // Read the original index.json file
  const originalIndexJson = JSON.parse(indexJsonEntry.getData().toString());
  const intactIndexJson = JSON.parse(indexJsonEntry.getData().toString());

  // Process and update file paths in index.json
  const processFilePaths = (obj, basePath = "") => {
    if (typeof obj !== "object" || obj === null) {
      return;
    }
    for (let key in obj) {
      if (key === "Source" && typeof obj[key] === "string") {
        const filePath = obj[key];
        const fileName = path.basename(filePath);
        const folderPath = path.join(contentFolder, fileName);
        const newFilePath = path.join(basePath, folderPath);
        obj[key] = newFilePath;
        const fileEntry = folderEntries.find((entry) =>
          entry.entryName.endsWith(fileName)
        );
        if (fileEntry) {
          const filePath = path.join(contentFolder, fileName);
          fs.writeFileSync(filePath, fileEntry.getData());
        }
      } else {
        processFilePaths(obj[key], basePath);
      }
    }
  };

  processFilePaths(originalIndexJson, "");

  // Update the contentData field in the content object
  await Content.findByIdAndUpdate(
    content._id,
    { contentData: JSON.stringify(intactIndexJson), thumbnail: thumbnail },
    { new: true, useFindAndModify: false }
  );

  res.status(200).json("Content Uploaded Successfully");
});

export const uploadFiles = catchAsyncErrors(async (req, res, next) => {
  // console.log(req.files);
  const zipFile = req.files["zipFile"][0]; // Assuming a single zip file is uploaded
  const imageFile = req.files["imageFile"][0]; // Assuming a single image file is uploaded
  // console.log(zipFile);
  // console.log(imageFile);
  const zipFilePath = zipFile.path;
  const imageFilePath = imageFile.path;

  // Return the file paths as a response
  res.json({ zipFilePath, imageFilePath });
});

export const getAllContent = catchAsyncErrors(async (req, res, next) => {
  const apiFeature = new ApiFeatures(
    Content.find()
      .populate({
        path: "creatorId",
        select: "name _id email",
      })
      .populate({
        path: "allocated.allocatedBy",
        select: "name _id email",
      })
      .populate({
        path: "allocated.allocatedTo",
        select: "name _id email",
      })
      .populate({
        path: "verifiedBy",
        select: "name _id email",
      })
      .populate({
        path: "tags",
        // select: "name _id email",
      })
      .populate({
        path: "language",
        // select: "name _id email",
      }),
    req.query
  ).search();
  const contents = await apiFeature.query;

  res.status(200).json(contents);
});

export const getContentByCreatorId = catchAsyncErrors(
  async (req, res, next) => {
    const currentUser = req.user;
    const apiFeature = new ApiFeatures(
      Content.find({ creatorId: currentUser._id })
        .select("-contentData")
        .populate({
          path: "creatorId",
          select: "name _id email",
        })
        .populate({
          path: "allocated.allocatedBy",
          select: "name _id email",
        })
        .populate({
          path: "allocated.allocatedTo",
          select: "name _id email",
        })
        .populate({
          path: "verifiedBy",
          select: "name _id email",
        })
        .populate({
          path: "language",
          select: "name",
        })
        .populate({
          path: "tags",
          select: "name",
        }),
      req.query
    ).search();
    const content = await apiFeature.query;
    if (!content) {
      return res.status(404).json({ error: "Content not found" });
    }

    res.status(200).json(content);
  }
);

export const updateContentVerifyStatus = catchAsyncErrors(
  async (req, res, next) => {
    const { contentIds } = req.body;

    try {
      // Get the current logged-in user
      const currentUser = req.user;

      // Update the content status for the specified IDs and set verifiedBy to the current user ID
      const updateResult = await Content.updateMany(
        { _id: { $in: contentIds } },
        { $set: { verifiedStatus: true, verifiedBy: currentUser._id } }
      );

      if (updateResult.nModified === 0) {
        return next(
          new Errorhandler("No content found with provided IDs", 500)
        );
      }

      res.status(200).json({
        message: "Content status updated successfully",
      });
    } catch (error) {
      return next(new Errorhandler("Failed to update content status", 500));
    }
  }
);

export const updateContentLiveStatus = catchAsyncErrors(
  async (req, res, next) => {
    const { status, date, contentIds } = req.body;

    try {
      // Filter the contentIds based on verifiedStatus = true
      const verifiedContentIds = await Content.find({
        _id: { $in: contentIds },
        verifiedStatus: true,
      }).distinct("_id");

      if (verifiedContentIds.length === 0) {
        return res.status(400).json({ error: "No verified content found" });
      }

      if (status === "Scheduled" && date) {
        const scheduledDate = new Date(date);

        if (isNaN(scheduledDate.getTime())) {
          return res.status(400).json({ error: "Invalid date format" });
        }

        const currentDate = new Date();

        if (scheduledDate <= currentDate) {
          return res.status(400).json({
            error: "Scheduled date should be greater than the current date",
          });
        }

        await Content.updateMany(
          { _id: { $in: verifiedContentIds } },
          {
            $set: {
              liveStatus: "Scheduled",
              scheduledDate: scheduledDate,
              disabledDate: null,
            },
          }
        );

        // Schedule a job to update the content status on the scheduled date
        schedule.scheduleJob(scheduledDate, async () => {
          await Content.updateMany(
            { _id: { $in: verifiedContentIds } },
            {
              $set: {
                liveStatus: "Live",
                liveDate: scheduledDate,
                scheduledDate: null,
              },
            }
          );
        });

        return res.status(200).json({
          message: "Content status will be updated on the scheduled date",
        });
      }

      let updateQuery;

      if (status === "Live") {
        updateQuery = {
          liveStatus: "Live",
          liveDate: Date.now(),
          disabledDate: null,
        };
      } else if (status === "Not Live") {
        updateQuery = {
          liveStatus: "Not Live",
          liveDate: null,
          disabledDate: Date.now(),
        };
      } else {
        return res.status(400).json({
          error: "Invalid status or missing date parameter",
        });
      }

      // Update the content status of the verifiedContentIds
      await Content.updateMany(
        { _id: { $in: verifiedContentIds } },
        { $set: updateQuery }
      );

      res.status(200).json({
        message: "Content status updated successfully",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Failed to update content status" });
    }
  }
);

export const myContentsToVerify = catchAsyncErrors(async (req, res, next) => {
  const contents = await Content.find({
    "allocated.allocatedTo": req.user._id,
  })
    .populate({
      path: "creatorId",
      select: "name _id email",
    })
    .populate({
      path: "allocated.allocatedBy",
      select: "name _id email",
    })
    .populate({
      path: "allocated.allocatedTo",
      select: "name _id email",
    })
    .populate({
      path: "verifiedBy",
      select: "name _id email",
    })
    .populate({
      path: "tags",
      // select: "name _id email",
    })
    .populate({
      path: "language",
      // select: "name _id email",
    })
    .sort({ _id: -1 });
  if (!contents) {
    return next(new Errorhandler("No Contents To Verify", 500));
  }
  res.status(200).json(contents);
});

export const allocateUserToVerify = catchAsyncErrors(async (req, res, next) => {
  const { contentId } = req.params;
  const { allocatedBy, allocatedTo } = req.body;
  const updatedContent = await Content.findByIdAndUpdate(
    contentId,
    {
      $set: {
        "allocated.0.allocatedBy": new mongoose.Types.ObjectId(allocatedBy),
        "allocated.0.allocatedTo": new mongoose.Types.ObjectId(allocatedTo),
      },
    },
    { new: true, runValidators: true, useFindAndModify: false }
  );
  res.json(updatedContent);
});

export const getContentByTags = catchAsyncErrors(async (req, res, next) => {
  const tagIds = req.body.tagIds; // Assuming tag IDs are provided as "tagIds" in the request body
  // console.log(tagIds);

  const content = await Content.find({
    tags: { $in: tagIds },
    liveStatus: "Live",
  })
    .populate({
      path: "creatorId",
      select: "name _id email",
    })
    .populate({
      path: "allocated.allocatedBy",
      select: "name _id email",
    })
    .populate({
      path: "allocated.allocatedTo",
      select: "name _id email",
    })
    .populate({
      path: "verifiedBy",
      select: "name _id email",
    })
    .populate({
      path: "tags",
      // select: "name _id email",
    })
    .populate({
      path: "language",
      // select: "name _id email",
    })
    .sort({ _id: -1 });
  if (!content || content.length === 0) {
    return next(new Errorhandler("No content with these tag IDs found", 400));
  }

  res.status(200).json(content);
});

export const getContentByTopic = catchAsyncErrors(async (req, res, next) => {
  const { topicId } = req.params;
  const topic = await Topic.findById(topicId);

  // Retrieve all contents matching the IDs in topic.contentId
  const content = await Content.find({ _id: { $in: topic.contentId } })
    .populate({
      path: "creatorId",
      select: "name _id email",
    })
    .populate({
      path: "allocated.allocatedBy",
      select: "name _id email",
    })
    .populate({
      path: "allocated.allocatedTo",
      select: "name _id email",
    })
    .populate({
      path: "verifiedBy",
      select: "name _id email",
    })
    .populate({
      path: "tags",
      // select: "name _id email",
    })
    .populate({
      path: "language",
      // select: "name _id email",
    })
    .sort({ _id: -1 });

  res.status(200).json(content);
});

export const getCreditsName = catchAsyncErrors(async (req, res, next) => {
  const credits = await Credits.find();
  return res.status(200).json(credits);
});

export const addCredits = catchAsyncErrors(async (req, res, next) => {
  const { names } = req.body;

  const savedCredits = [];

  for (let i = 0; i < names.length; i++) {
    const existingCredit = await Credits.findOne({ name: names[i] });
    if (existingCredit) {
      // Skip adding duplicate name
      // console.log(`Name "${names[i]}" already exists. Skipping...`);
      continue;
    }

    const credits = new Credits({ name: names[i] });
    const savedCredit = await credits.save();
    savedCredits.push(savedCredit);
  }

  res.status(200).json(savedCredits);
});

export const getContentById = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const content = await Content.findById(id).populate(
    "creatorId",
    "name thumbnail"
  );
  res.status(200).json(content);
});

export const getContentByCity = catchAsyncErrors(async (req, res, next) => {
  const { city } = req.params;
  const logs = await Log.find({ city: city })
    .select("contentId watchDuration")
    .populate({
      path: "contentId",
      populate: [
        { path: "creatorId", select: "name thumbnail" },
        { path: "tags", select: "name" },
      ],
      select:
        "_id title zip tags ageRating language thumbnail createdDate creatorId description story visual audio completeProject allocated liveStatus verifiedStatus merchandise __v contentData verifiedBy disabledDate liveDate",
    })
    .sort({ watchDuration: -1 });

  // Group logs by contentId and track the maximum watch duration for each contentId
  const contentIdMap = new Map();
  logs.forEach((log) => {
    const { contentId, watchDuration } = log;
    if (
      !contentIdMap.has(contentId) ||
      watchDuration > contentIdMap.get(contentId).watchDuration
    ) {
      contentIdMap.set(contentId, log);
    }
  });

  // Extract the data of unique contentIds with the highest watch duration
  const uniqueContentData = Array.from(contentIdMap.values()).map((log) => ({
    ...log.contentId._doc,
    watchDuration: log.watchDuration,
  }));
  const allContent = await Content.find().populate([
    { path: "creatorId", select: "name thumbnail" },
    { path: "tags", select: "name" }
  ]);

  const data = [...uniqueContentData, ...allContent];
  res.send(data);
});
