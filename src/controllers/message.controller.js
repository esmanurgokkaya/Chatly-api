import mongoose from "mongoose";
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

    // Validate if partnerId is a valid ObjectId
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

    // Check text length
    if (text && text.length > 1000) {
      return res
        .status(400)
        .json({ message: "Message text should be less than 1000 characters" });
    }

    // Check image size (assuming base64)
    if (image) {
      const sizeInMB = (image.length * 3) / 4 / 1024 / 1024; // Approximate size in MB
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

    // Normalize image input: Cloudinary accepts data URIs (e.g. "data:image/png;base64,...")
    // If client sent raw base64 (starts with iVBORw0K... for PNG), prefix a reasonable data URI so
    // the Cloudinary SDK doesn't try to treat the long string as a local filename (which causes ENAMETOOLONG).
    if (image) {
      try {
        let uploadSource = image;

        // Remove whitespace/newlines for detection
        const compact = String(uploadSource).replace(/\s+/g, "");

        // If it already looks like a data URI, use as-is
        if (!/^data:/i.test(compact)) {
          // Heuristic: long base64 string (typical PNG/JPEG base64) - prefix with data URI
          // PNG base64 typically starts with iVBOR, JPEG with /9j/ - cover both
          const looksLikeBase64 = /^(?:iVBOR|\/9j\/)/.test(compact) || /^[A-Za-z0-9+/=]+$/.test(compact);
          if (looksLikeBase64) {
            // Default to PNG; if you know the mime type from client, prefer that.
            uploadSource = `data:image/png;base64,${compact}`;
          }
        }

        const uploadResponse = await cloudinary.uploader.upload(uploadSource, {
          folder: "chatly_messages",
        });
        imageUrl = uploadResponse.secure_url;
      } catch (uploadErr) {
        console.error("Cloudinary upload error:", uploadErr);
        // Return a helpful error rather than a generic ENAMETOOLONG stack
        return res.status(400).json({ message: "Invalid image data or upload failed", details: uploadErr.message });
      }
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
