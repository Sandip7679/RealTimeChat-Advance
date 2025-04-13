import express from "express";
import { createChats, findUsersToAdd, getUserChats, sendMessage, updateUnseenCount } from "../controllers/chat.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/users", protectRoute, findUsersToAdd);
router.get("/:id", protectRoute, getUserChats);
router.post("/create", protectRoute, createChats);
router.post("/update/unseen", protectRoute, updateUnseenCount);
router.post("/message/send", protectRoute, sendMessage);

export default router;