import Message from "../models/Message.js";
import User from "../models/User.js";

export const getAllContacts = async (req, res) => {
  try {
    console.log(req.user);
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-passwordHash");
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getAllContacts:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getMessagesByUserId = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: userToChatId } = req.params;
    const mesesages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });
    res.status(200).json(mesesages);
  } catch (error) {
    console.log("Error in getMessages controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { id: receiverId } = req.params;
    const { text, image } = req.body;

    if (!text && !image) {
      return res
        .status(400)
        .json({ error: "Message text or image is required" });
    }

    if (senderId.equals(receiverId)) {
      return res
        .status(400)
        .json({ error: "You cannot send a message to yourself" });
    }
    const receiverExists = await User.findById({ _id: receiverId });
    if (!receiverExists) {
      return res.status(404).json({ error: "Receiver user not found" });
    }

    let imageUrl;
    if (image) {
      // upload base64 image to cloudinary
      const uploadResult = await cloudinary.uploader.upload(image);
      imageUrl = uploadResult.secure_url;
    }

    console.log(text);

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl, // Store the image URL if an image was uploaded
    });

    await newMessage.save();

    // todo send message in real time if user is onlinne -socket.io

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // find all the messages where the logged-in user is either the sender or receiver
    const mesesages = await Message.find({
      $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
    });
    const chatPartnerIds = [
      ...new Set(
        mesesages.map((msg) => {
          return msg.senderId.toString() === loggedInUserId.toString()
            ? msg.receiverId.toString()
            : msg.senderId.toString();
        }),
      ),
    ];
    console.log(chatPartnerIds);

    const chatPartners = await User.find({
      _id: { $in: chatPartnerIds },
    }).select("-passwordHash");

    res.status(200).json(chatPartners);
  } catch (error) {
    console.log("Error in getChatPartners controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
