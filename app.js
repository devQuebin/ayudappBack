import express from 'express';
import db from './firebase_config.js';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';


const app = express();


app.get("/user/:id", async (req, res) => {
    try {
        const userId = req.params["id"];
        const docRef = doc(db, "user", userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            console.log("Document data:", docSnap.data());
            res.send(docSnap.data());
        } else {

            res.status(404).send(`<img src="https://http.cat/404" alt="404 Not Pawnd">`);
        }
    } catch (error) {
        console.error("Error fetching document:", error.message);

        res.status(500).send(`<img src="https://http.cat/500" alt="500 Internal Server Mewrror">`);
    }
});


app.post("/user", async (req, res) => {
    const newId = crypto.randomUUID()
    try {
        const userRef = doc(db, 'user', newId);
        await setDoc(userRef, {
            password: '',
            name: '',
            last_name: '',
            campaign_record: '',
            donation_record: '',
            email: ''
        });
        console.log("Document created with ID:", userRef.id);
        res.status(201).send({ message: "User created successfully", id: userRef.id });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).send({ message: "Error creating user", error: error.message });
    }
});


app.update("/user", async (req, res) => {

})



const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
    console.log(`Server is Prrrunning on port ${PORT}`);
});