import catchAsyncErrors from "../../middlewares/catchAsyncErrors.js";
import Language from "../../models/Language.js";
import Errorhandler from "../../utils/errorHandler.js";

export const addLanguage = catchAsyncErrors(async (req, res, next) => {
    const language = req.body.language;
    if (!language) {
        return next(new Errorhandler("Add language", 500));
    }
    const updated_language = new Language({ name: language });

    const saved_language = await updated_language.save();

    return res.status(200).json(`${language} added`);
});

export const getLanguage = catchAsyncErrors(async (req, res, next) => {
    const language = await Language.find().sort({ createdDate: -1, _id: -1 });

    res.status(200).json(language);
});

export const editLanguage = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    const edited_language = { name: req.body.name };
    console.log(edited_language);
    const language = await Language.findByIdAndUpdate(id, edited_language, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });
    const updated_language = await language.save();
    return res.status(200).json(updated_language);
});

export const deleteLanguage = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;

    // Delete the tag by ID
    await Language.findByIdAndRemove(id);

    return res.status(200).json({ message: "Language deleted successfully" });
});

