import catchAsyncErrors from "../../middlewares/catchAsyncErrors.js";
import User from "../../models/User.js";
import Errorhandler from "../../utils/errorHandler.js";
import sendtoken from "../../utils/jwtToken.js";
import sendEmail from "../../utils/sendEmail.js";
import crypto from "crypto";

function generateRandomPassword(length) {
    const charset =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[{]};:<>,.?";

    let password = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset.charAt(randomIndex);
    }

    return password;
}

export const registerUser = catchAsyncErrors(async (req, res) => {
    const randomPassword = generateRandomPassword(10);
    const {
        name,
        email,
        role,
        status,
        contentId,
        createdDate,
        thumbnail,
        masthead,
    } = req.body;
    const newUser = new User({
        name,
        email,
        password: randomPassword,
        role,
        status,
        thumbnail,
        masthead,
        contentId,
        createdDate,
    });
    const savedUser = await newUser.save();
    const message = `Your Email:${email} \n\n Use this password to sign in to your account : ${randomPassword} \n\n  Sign In Page : http://localhost:3000/user/login`;

    try {
        await sendEmail({
            email: email,
            subject: "Welcome To Aideo",
            message,
        });
        res.status(201).json({
            message: `${name} Created for role ${role}`,
            data: savedUser,
        });
    } catch (error) {
        return next(new Errorhandler(error.message, 500));
    }
});

export const loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new Errorhandler("Please enter valid credentials", 400));
    }
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        return next(new Errorhandler("Please enter valid credentials", 400));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new Errorhandler("Please enter valid credentials", 400));
    }
    if (user.status == false) {
        return next(new Errorhandler("You are blocked by admin", 400));
    }
    sendtoken(user, 200, res);
});

export const logoutUser = catchAsyncErrors(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });

    res.status(200).json({
        success: true,
        message: "Logged Out Successfully",
    });
});

export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new Errorhandler("User Not Found", 404));
    }

    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });
    const resetPasswordUrl = `${req.protocol}://${req.get(
        "host"
    )}/api/v1/users/password/reset/${resetToken}`;
    console.log(resetPasswordUrl);
    const message = `Click on the link to reset your password \n\n ${resetPasswordUrl}`;

    try {
        await sendEmail({
            email: user.email,
            subject: "Aedio Account Password Recovery",
            message,
        });

        res.status(200).json({
            success: true,
            message: `Password Reset Mail Sent To ${user.email}`,
        });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new Errorhandler(error.message, 500));
    }
});

export const resetPassword = catchAsyncErrors(async (req, res, next) => {
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        return next(new Errorhandler("Token is invalid or expired", 400));
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(
            new Errorhandler(
                "Entered Password and ConfirmPassword is not same",
                400
            )
        );
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    sendtoken(user, 200, res);
});

