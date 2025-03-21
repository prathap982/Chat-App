import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../lib/util.js';
import cloudinary from '../lib/cloudinary.js';

export const signup = async(req, res) => {
    const { email, fullName, password} = req.body;

    try{
        if (!email || !fullName || !password) {
            return res.status(400).send({message: 'All fields are required'});
        }
        if(password.length < 6){
            return res.status(400).send({message: 'Password must be atleast 6 characters long'});
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).send({message: 'User already exists'});
        }

        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password,salt);
        
        const newUser = new User({
            email,
            fullName,
            password: hashedPassword,
        });
    
        if(newUser){
            generateToken(newUser._id,res);
            await newUser.save();
            res.status(201).json({
                _id: newUser._id,
                email: newUser.email,
                fullName: newUser.fullName,
                profilePic: newUser.profilePic,
            
            })
        }else{
            res.status(400).send({message: 'Invalid user data'});
        }

    }catch(err){
        console.log('Error in signup controller',err);
        res.status(500).send({message: 'Internal Server error'});
    }

    
}

export const login = async (req, res) => {
    const { email, password } = req.body;

    try{
        if (!email || !password) {
            return res.status(400).send({message: 'All fields are required'});
        }

        const user =await  User.findOne({ email});

        if (!user) {
            return res.status(400).send({message: 'Invalid credentials'});
        }

        const isMatch=await bcrypt.compare(password,user.password);

        if(!isMatch){
            return res.status(400).send({message: 'Invalid Password'});
        }
        generateToken(user._id,res);

        res.status(200).json({
            _id: user._id,
            email: user.email,
            fullName: user.fullName,
            profilePic: user.profilePic,
        })

    }catch(err){
        console.log('Error in login controller',err);
        res.status(500).send({message: 'Internal Server error'});
    }
}

export const logout = (req, res) => {
    try{
    res.cookie('jwt','',{maxAge:0});
    res.status(200).send({message: 'Logged out successfully'});
    }catch(err){
        console.log('Error in logout controller',err);
        res.status(500).send({message: 'Internal Server error'});
    }
}

export const updateProfile = async(req, res) => {
    const {profilePic}=req.body;
    const userId=req.user._id;
    if(!profilePic){
        return res.status(400).send({message: 'Profile pic is required'});
    }

    try{
        const uploadResponse=await cloudinary.uploader.upload(profilePic)
        const updatedUser=await User.findByIdAndUpdate(userId,{profilePic: uploadResponse.secure_url},{new: true});

        res.status(200).json(updatedUser)

    }catch(err){
        console.log('Error in update profile controller',err);
        res.status(500).send({message: 'Internal Server error'});
    }
}

export const checkAuth=(req,res)=>{
    try{
        res.status(200).json(req.user);
    }catch(err){
        console.log('Error in checkAuth controller',err);
        res.status(500).send({message: 'Internal Server error'});
    }
}
