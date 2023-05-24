import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";
import crypto from "crypto";
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Enter Name"],
        min: 2,
        max: 50,
    },
    email: {
        type: String,
        required: true,
        max: 50,
        unique: true,
        validate: [validator.isEmail, "Please Enter A Valid Email"],
    },
    password: {
        type: String,
        required: [true, "Enter Password"],
        min: 5,
        select: false,
    },
    role: {
        type: String,
        enum: ["admin", "manager", "creator"],
        required: [true, "Enter Role of user"],
    },
    status: {
        type: Boolean,
        default: true,
    },
    contentId: {
        type: Array,
        default: [],
    },
    thumbnail: {
        type: String,
        default: "",
    },
    masthead: {
        type: String,
        default: "",
    },
    createdDate: {
        type: Date,
        default: Date.now(),
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
});

//Password Encryption
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }

    this.password = await bcrypt.hash(this.password, 10);
});

//JWT Token
UserSchema.methods.getJWTTOKEN = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES,
    });
};

//Password Matching
UserSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

//Password Reset Token
UserSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString("hex");

    this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    return resetToken;
};

const User = mongoose.model("User", UserSchema);
export default User;
