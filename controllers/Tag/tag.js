import catchAsyncErrors from "../../middlewares/catchAsyncErrors.js";
import Tag from "../../models/Tag.js";
import Errorhandler from "../../utils/errorHandler.js";

export const addTag = catchAsyncErrors(async (req, res, next) => {
    const name = req.body.name;
    if (!name) {
        return next(new Errorhandler("Please Enter tag name", 500));
    }
    const newTag = new Tag({ name: name });
    const savedTag = await newTag.save();
    res.status(200).json(savedTag);
});

export const getAllTags = catchAsyncErrors(async (req, res, next) => {
    const tags = await Tag.find().sort({ createdDate: -1,_id: -1  });
    res.status(200).json(tags);
});

export const editTag = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const { name } = req.body;

    const tag = await Tag.findByIdAndUpdate(
        id,
        { name },
        { new: true, runValidators: true, useFindAndModify: false }
    )
        .select({ name: 1 })
        .lean();

    return res.status(200).json(tag);
});

export const deleteTag = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;

    // Delete the tag by ID
    await Tag.findByIdAndRemove(id);

    return res.status(200).json({ message: "Tag deleted successfully" });
});
