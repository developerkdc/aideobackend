import catchAsyncErrors from "../../middlewares/catchAsyncErrors.js";
import User from "../../models/User.js";
import Errorhandler from "../../utils/errorHandler.js";
import sendtoken from "../../utils/jwtToken.js";

export const getAllUsers = catchAsyncErrors(async (req, res, next) => {
    const user = await User.find({ role: ["creator", "manager"] }).sort({ createdDate: -1 ,_id: -1 });;
    res.status(200).json(user);
});

export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    res.status(200).json(user);
});

export const updatePassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password");
    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if (!isPasswordMatched) {
        return next(new Errorhandler("Old Password is incorrect", 400));
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(
            new Errorhandler("Password and Confirm Password doesnt match", 400)
        );
    }

    user.password = req.body.password;

    await user.save();

    sendtoken(user, 200, res);
});

export const updateDetails = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
    };

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    return res.status(200).json({
        success: true,
    });
});

export const updateRole = catchAsyncErrors(async (req, res, next) => {
    const userId = req.body.id;
    const newUserRole = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
    };
    if (!req.body.role || !req.body.id) {
        return next(new Errorhandler("Provide role & id"));
    }
    const user = await User.findByIdAndUpdate(userId, newUserRole, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    if (!user) {
        return next(new Errorhandler("UserId does not exist", 404));
    }

    return res.status(200).json({
        success: true,
    });
});

export const updateStatus = catchAsyncErrors(async (req, res, next) => {
    const userId = req.body.id;
    const newUserRole = {
        status: req.body.status,
    };
    if (!req.body.id) {
        return next(new Errorhandler("Provide id & status", 500));
    }
    const user = await User.findByIdAndUpdate(userId, newUserRole, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    if (!user) {
        return next(new Errorhandler("UserId does not exist", 404));
    }

    return res.status(200).json({
        success: true,
    });
});

export const deleteUser = catchAsyncErrors(async (req, res, next) => {
    const { userId } = req.params;
    if (!userId) {
        return next(new Errorhandler("Provide userid to delete", 500));
    }
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
        return next(new Errorhandler("UserId does not exist", 404));
    }

    return res.status(200).json({
        success: true,
    });
});
