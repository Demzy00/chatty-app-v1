import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "../emails/emailHandlers.js";
import { ENV } from "../lib/env.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    // Basic validation
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Here you would typically check if the user already exists and then create a new user in the database.
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Hash password and save user to database (omitted for brevity)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      passwordHash,
    });

    if (newUser) {
      // before code review
      // generateToken(newUser._id, res); // Generate token for the new user (implementation not shown)
      // await newUser.save();

      // after code review
      // Persist user first, then issue with cookie
      const savedUser = await newUser.save();
      generateToken(savedUser._id, res); // Generate token for the saved user

      res.status(201).json({
        message: "User registered successfully",
        user: {
          _id: newUser._id,
          fullName: newUser.fullName,
          email: newUser.email,
          profilePic: newUser.profilePic,
        },
      });

      // send a welcome email to the user

      try {
        await sendWelcomeEmail(
          savedUser.email,
          savedUser.fullName,
          ENV.CLIENT_URL,
        );
      } catch (error) {
        console.error("Failed to send welcome email:", error);
        // Don't fail the signup process if email sending fails, but log the error
      }
    } else {
      return res.status(500).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Server error during signup" });
  }
};

export const login = async (req, res) => {
  // Implement login logic here
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    generateToken(user._id, res); // Generate token for the logged-in user

    res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
      },
    });

    // Basic validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error during login" });
  }
};

export const logout = async (_, res) => {
  res.clearCookie("jwt", "", { maxAge: 0 });
  res.status(200).json({ message: "Logged out successfully" });
};

export const updateProfile = async (req, res) => {
  // Implement profile update logic here
  try {
    const { profilePic } = req.body;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile picture is required" });
    }

    const userId = req.user._id;

    const uploadedResponse = await cloudinary.uploader.upload(profilePic, {
      folder: "chatty_app/profile_pics",
      public_id: `profile_${userId}`,
      overwrite: true,
    });

    const updateUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadedResponse.secure_url },
      { new: true },
    );

    res.status(200).json(updateUser);

    // const user = await User.findById(req.user._id);

    // if (!user) {
    //   return res.status(404).json({ message: "User not found" });
    // }

    // user.profilePic = profilePic;
    // await user.save();

    // res.status(200).json({
    //   message: "Profile updated successfully",
    //   user: {
    //     _id: user._id,
    //     fullName: user.fullName,
    //     email: user.email,
    //     profilePic: user.profilePic,
    //   },
    // });
  } catch (error) {
    console.log("Error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
