import User from "../models/user.model.js";
import { generateToken } from "../lib/utils.js";
import bcrypt from "bcryptjs";


export const signup = async  (req,res) =>{
    const { fullName, email, password } = req.body;

    try {
        if(!fullName || !email || !password) {
            return res.status(400).json({ message:  "All fiels are required"})

        }
           if(password.length < 6) {
            return res.status(400).json({ message:  "Password must be at least 6 characters long"})

        }

        // check if email valid regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)) {
            return res.status(400).json({ message:  "Please enter a valid email address"})
        }

        const user = await User.findOne({ email });
        if(user) {
            return res.status(400).json({ message: "Email already in use"})
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword
        })

        if(newUser){
            const savedUser = await newUser.save();
            generateToken(savedUser._id, res);
            res.status(201).json({
                _id: savedUser._id,
                fullName: savedUser.fullName,
                email: savedUser.email,
                profilePic: savedUser.profilePic,
                createdAt: savedUser.createdAt,
                updatedAt: savedUser.updatedAt,
            });

        }
        else {
            res.status(400).json({ message: "invalid user data"})
        }
        
    }
    catch (error) {
        console.log("Error in signup controller:", error);
        res.status(500).json({ message: "Server error" })
    }
}