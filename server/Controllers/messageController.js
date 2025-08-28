import cloudinary from "../lib/cloudinary.js";
import Message from "../Models/Message.js";
import User from "../Models/User.js";
import { io, userSocketMap } from "../server.js";


// export all user except login user
export const getUserForSidebar = async (req, res) => {
    try {
        const userId = req.user._id
        const filteredUser = await User.find({ _id: { $ne: userId } }).select("-password")
        // count number of messages not seen
        const unseenMessages = {}
        const promises = filteredUser.map(async (user) => {
            const message = await Message.find({ senderId: user._id, recieverId: userId, seen: false })
            if (message.length > 0) {
                unseenMessages[user._id] = message.length
            }
        })
        await Promise.all(promises)
        res.json({ success: true, users: filteredUser, unseenMessages })
    } catch (error) {
        res.json({ success: false, message: error.message })
        console.log(error.message);
    }
}

// Get all messages for selected users
export const getMessages = async (req, res) => {
    try {
        const { id: selectedUserId } = req.params
        const myId = req.user._id
        const messages = await Message.find({
            $or: [
                {
                    senderId: myId, recieverId: selectedUserId
                },
                {
                    senderId: selectedUserId, recieverId: myId
                },
            ]
        })
        await Message.updateMany({ senderId: selectedUserId, recieverId: myId }, { seen: true })
        res.json({ success: true, messages })
    } catch (error) {
        res.json({ success: false, message: error.message })
        console.log(error.message);
    }
}


// Api to mark message as seen using message id
export const markMessageAsSeen = async (req, res) => {
    try {
        const { id } = req.params
        await Message.findByIdAndUpdate(id, { seen: true })
        res.json({ success: true })
    } catch (error) {
        res.json({ success: false, message: error.message })
        console.log(error.message);
    }
}


// Api for send message to selected user
export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body
        const recieverId = req.params.id
        const senderId = req.user._id
        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image)
            imageUrl = uploadResponse.secure_url;
        }
        const newMessage = await Message.create({
            recieverId,
            senderId,
            text,
            image: imageUrl
        })

        // Emit the new message to the reciever socket
        const recieverSocketId = userSocketMap[recieverId]
        if (recieverSocketId) {
            io.to(recieverSocketId).emit("newMessage", newMessage)
        }

        res.json({ success: true, newMessage })
    } catch (error) {
        res.json({ success: false, message: error.message })
        console.log(error.message);
    }
}
