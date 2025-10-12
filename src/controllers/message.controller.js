import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
export const getAllContacts = async (req, res) => {
  try {
    const logginedUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: logginedUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getMessagesByUserId = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: partnerId } = req.params;
    console.log("My ID:", myId);
    console.log("Partner ID:", partnerId);
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: partnerId },
        { senderId: partnerId, receiverId: myId },
      ],
    });
    console.log(messages);
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: error.message });
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
        .json({ message: "Message text or image is required" });
    }
    if (senderId.equals(receiverId)) {
      return res
        .status(400)
        .json({ message: "You cannot send a message to yourself" });
    }
    const reciverEsists = await User.findById(receiverId);
    if (!reciverEsists) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    let imageUrl;

    
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getChatPartners = async (req, res) => {
  try {
    const logginedUserId = req.user._id;

    const messages = await Message.find({
      $or: [{ senderId: logginedUserId }, { receiverId: logginedUserId }],
    });
    const chatPartnersIds = [
      ...new Set(
        messages.map((msg) =>
          msg.senderId.toString() === logginedUserId.toString()
            ? msg.receiverId.toString()
            : msg.senderId.toString()
        )
      ),
    ];

    const chatPartners = await User.find({
      _id: { $in: chatPartnersIds },
    }).select("-password");

    res.status(200).json(chatPartners);
  } catch (error) {
    console.error("Error fetching chat partners:", error);
    res.status(500).json({ error: error.message });
  }
};
