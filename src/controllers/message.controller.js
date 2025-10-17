import mongoose from "mongoose";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import { io, getReciverSocketId } from "../lib/socket.js";

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

    if (!mongoose.Types.ObjectId.isValid(partnerId)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }
    
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: partnerId },
        { senderId: partnerId, receiverId: myId },
      ],
    });
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

    if (text && text.length > 1000) {
      return res
        .status(400)
        .json({ message: "Message text should be less than 1000 characters" });
    }

    if (image) {
      const sizeInMB = (image.length * 3) / 4 / 1024 / 1024; 
      if (sizeInMB > 5) {
        return res
          .status(400)
          .json({ message: "Image size should be less than 5MB" });
      }
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
      try {
        let uploadSource = image;

        const compact = String(uploadSource).replace(/\s+/g, "");

        if (!/^data:/i.test(compact)) {
          const looksLikeBase64 = /^(?:iVBOR|\/9j\/)/.test(compact) || /^[A-Za-z0-9+/=]+$/.test(compact);
          if (looksLikeBase64) {
            uploadSource = `data:image/png;base64,${compact}`;
          }
        }

        const uploadResponse = await cloudinary.uploader.upload(uploadSource, {
          folder: "chatly_messages",
        });
        imageUrl = uploadResponse.secure_url;
      } catch (uploadErr) {
        console.error("Cloudinary upload error:", uploadErr);
        return res.status(400).json({ message: "Invalid image data or upload failed", details: uploadErr.message });
      }
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    const savedMessage = await newMessage.save();
    
    const messageToSend = {
      ...savedMessage.toObject(),
      _id: savedMessage._id.toString(),
      senderId: savedMessage.senderId.toString(),
      receiverId: savedMessage.receiverId.toString(),
      createdAt: savedMessage.createdAt.toISOString(),
      updatedAt: savedMessage.updatedAt.toISOString()
    };
    
    const receiverSocketId = getReciverSocketId(receiverId.toString());
    const senderSocketId = getReciverSocketId(senderId.toString());
    
    [receiverSocketId, senderSocketId].forEach(socketId => {
      if (socketId) {
        io.to(socketId).emit("newMessage", messageToSend);
      }
    });

    res.status(201).json(savedMessage);
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
