import express from 'express';
import db from './firebase_config.js';
import cors from 'cors';
import { collection, doc, getDoc, setDoc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import userRoutes from './src/routes/user.routes.js';
import donationRoutes from './src/routes/donation.routes.js';
import campaignRoutes from './src/routes/campaign.routes.js';

const app = express();
//Mystics from the Conurban 
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use('/user', userRoutes);
app.use('/donation', donationRoutes);
app.use('/campaign', campaignRoutes);

const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
    console.log(`Server is Prrrunning on port ${PORT}`);
});