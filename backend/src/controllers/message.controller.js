import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import cloudinary from '../lib/cloudinary.js';
import { getReceiverSocketId ,io} from "../lib/socket.js";

export const getUsersForSidebar=async(req,res)=>{
    try{
        const loggedInUserId=req.user._id;
        const filteresUsers=await User.find({_id: {$ne: loggedInUserId}}).select('-password');
        res.status(200).send(filteresUsers);
    }
    catch(err){
        console.log('Error in get users for sidebar controller',err);
        res.status(500).send({message: 'Internal Server error'});
    }
}

export const getMessages=async(req,res)=>{
    try{
        const {id:userToChatId}=req.params;
        const myId=req.user._id;

        const messages=await Message.find({
            $or:[
                {senderId:myId,receiverId:userToChatId},
                {senderId:userToChatId,receiverId:myId}
            ]
        })
        res.status(200).json(messages);
    }
    catch(err){
        console.log('Error in get messages controller',err);
        res.status(500).send({message: 'Internal Server error'});
    }
}

export const sendMessage=async(req,res)=>{
    try{
    const {text,image}=req.body;
    const receiverId=req.params.id;
    const senderId=req.user._id;

    let imageUrl;
    if(image){
        //upload image to cloudinary
        const uploadResponse=await cloudinary.uploader.upload(image);
        imageUrl=uploadResponse.secure_url;
    }
    const newMessage=new Message({
        senderId,
        receiverId,
        text,
        image:imageUrl
    })
    await newMessage.save();

    //todo: realtime functionality with socket.io
    const receiverSocketId=getReceiverSocketId(receiverId);
    if(receiverSocketId){
        io.to(receiverSocketId).emit('newMessage',newMessage);
    }

    res.status(200).send(newMessage);
    }
    catch(err){
        console.log('Error in send message controller',err);
        res.status(500).send({message: 'Internal Server error'});
    }
    
}