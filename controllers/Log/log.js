import catchAsyncErrors from "../../middlewares/catchAsyncErrors.js";
import Log from "../../models/Logs.js";
import Errorhandler from "../../utils/errorHandler.js";

export const addLog = catchAsyncErrors(async (req, res, next) => {
  const { contentId, city, tagIds, watchDuration } = req.body;
  if (!contentId) {
    next(new Errorhandler("Please provide contentId", 400));
  }
  const log_data = {
    contentId,
    city,
    tagIds,
    watchDuration,
  };
  const log = new Log(log_data);
  const savedLog = await log.save();
  res.status(200).json(savedLog);
});
