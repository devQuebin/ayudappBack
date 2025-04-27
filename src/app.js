import express from 'express';
import db from '../firebase_config.js';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';


const app = express();


app.get("/", async (req, res) => {

    const docRef = doc(db, "user", "SF");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        console.log("Document data:", docSnap.data());
    } else {
        // docSnap.data() will be undefined in this case
        console.log("No such document!");
    }
    res.send(respuesta)
})

const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    
});