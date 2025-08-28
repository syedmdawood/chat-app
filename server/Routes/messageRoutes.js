import express from "express"
import { protectRoute } from "../Middleware/auth.js"
import { getMessages, getUserForSidebar, markMessageAsSeen, sendMessage } from "../Controllers/messageController.js"

const messageRouter = express.Router()

messageRouter.get("/user", protectRoute, getUserForSidebar)
messageRouter.get("/:id", protectRoute, getMessages)
messageRouter.put("/mark/:id", protectRoute, markMessageAsSeen)
messageRouter.post("/send/:id", protectRoute, sendMessage)

export default messageRouter