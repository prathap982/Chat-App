import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { connectDB } from './lib/db.js';
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import cors from 'cors';
import { server,app} from './lib/socket.js';

import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));


dotenv.config();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))

app.use('/auth', authRoutes);
app.use('/messages', messageRoutes);

if(process.env.NODE_ENV==='production'){
    app.use(express.static(path.join(__dirname,'../frontend/dist')))

    app.get('*',(req,res)=>{
        res.sendFile(path.join(__dirname,'../frontend','dist','index.html'))
    })
}

const PORT = process.env.PORT 
server.listen(PORT, () => {
    console.log('Server is running on port :'+PORT);
    connectDB();
})