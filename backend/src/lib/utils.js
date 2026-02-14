import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  res.cookie("jwt", token, {
    httpOnly: true, // prevent XSS attacks by making the cookie inaccessible to JavaScript
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    secure: process.env.NODE_ENV === "development" ? false : true, // use HTTPS in production
    sameSite: "strict", // prevent CSRF attacks
  });

  return token;
};
