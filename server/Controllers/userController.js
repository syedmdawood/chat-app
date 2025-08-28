import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utilis.js";
import User from "../Models/User.js";
import bcrypt from "bcryptjs"

// Signup a new user
export const signup = async (req, res) => {
    const { fullName, email, password, bio } = req.body
    try {
        if (!fullName || !email || !password || !bio) {
            return res.json({ success: false, message: "Missing Details" })
        }
        const user = await User.findOne({ email })
        if (user) {
            return res.json({ success: false, message: "User already exists" })
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        const newUser = await User.create({
            fullName, email, password: hashedPassword, bio
        })
        const token = generateToken(newUser._id)
        res.json({ success: true, userData: newUser, token, message: "Account created successfully" })
    } catch (error) {
        res.json({ success: false, message: error.message })
        console.log(error.message);
    }
}


// Controller to login a user
export const login = async (req, res) => {
    try {
        const { email, password } = req.body
        const userData = await User.findOne({ email })
        const isCorrectPassword = await bcrypt.compare(password, userData.password)
        if (!userData) {
            return res.json({ success: false, message: "User not found" });
        }
        if (!isCorrectPassword) {
            return res.json({ success: false, message: "Incorrect credentials" })
        }
        const token = generateToken(userData._id)
        res.json({ success: true, userData, token, message: "Login successfully" })
    } catch (error) {
        res.json({ success: false, message: error.message })
        console.log(error.message);
    }
}


// Controller to check if the user is authenticated
export const checkAuth = async (req, res) => {
    res.json({ success: true, user: req.user })
}

// Controller to update user profile details
export const updateProfile = async (req, res) => {
    try {
        const { profilePic, bio, fullName } = req.body
        const userId = req.user._id
        let updatedUser;
        if (!profilePic) {
            updatedUser = await User.findByIdAndUpdate(userId, { bio, fullName }, { new: true })
        } else {
            const upload = await cloudinary.uploader.upload(profilePic)
            updatedUser = await User.findByIdAndUpdate(userId, { profilePic: (await upload).secure_url, bio, fullName }, { new: true })
        }
        res.json({ success: true, user: updatedUser })
    } catch (error) {
        res.json({ success: false, message: error.message })
        console.log(error.message);
    }
}