import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    passwordHash: { type: String, required: true, minlength: 6 },
    profilePic: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }, // creates createdAt and updatedAt fields automatically);
);

const User = mongoose.model("User", userSchema);

export default User;
