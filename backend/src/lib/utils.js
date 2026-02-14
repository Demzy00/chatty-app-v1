import jwt from "jsonwebtoken";
import { ENV } from "./env.js";

export const generateToken = (userId, res) => {
  const JWT_SECRET = ENV.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  const token = jwt.sign({ userId: userId }, JWT_SECRET, {
    expiresIn: "7d",
  });
  res.cookie("jwt", token, {
    httpOnly: true, // prevent XSS attacks by making the cookie inaccessible to JavaScript
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    secure: ENV.NODE_ENV === "development" ? false : true, // use HTTPS in production
    sameSite: "strict", // prevent CSRF attacks
  });

  return token;
};
