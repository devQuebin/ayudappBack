import express from 'express';
import db from './firebase_config.js';
import { collection, doc, getDoc, setDoc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


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
    const body = req.body;

    try {
        const userRef = doc(db, 'user', newId);
        await setDoc(userRef, body);
        console.log("Document created with ID:", userRef.id);
        res.status(201).send({ message: "User created successfully", id: userRef.id });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).send({ message: "Error creating user", error: error.message });
    }
});


app.put("/user/:id", async (req, res) => {
    try {
        const userId = req.params["id"];
        const upRef = doc(db, "user", userId);
        const body = req.body;

        const docSnap = await getDoc(upRef);
        if (!docSnap.exists()) {
            return res.status(404).send(`<img src="https://http.cat/404" alt="404 Not Pawnd">`);
        }

        await updateDoc(upRef, body);
        console.log("Document updated with ID:", userId);
        res.status(200).send({ message: "User updated successfully", id: userId });
    } catch (error) {
        console.error("Error updating user:", error.message);
        res.status(500).send(`<img src="https://http.cat/500" alt="500 Internal Server Mewrror">`);
    }
});


app.delete("/user/:id", async (req, res) => {
    try {
        const userId = req.params["id"];
        const docRef = doc(db, "user", userId);

        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            return res.status(404).send(`<img src="https://http.cat/404" alt="404 Not Pawnd">`);
        }

        await deleteDoc(docRef);
        console.log("Document deleted with ID:", userId);
        res.status(200).send({ message: "User deleted successfully", id: userId });
    } catch (error) {
        console.error("Error deleting user:", error.message);
        res.status(500).send(`<img src="https://http.cat/500" alt="500 Internal Server Mewrror">`);
    }
});

app.get("/user/campaign/:campaign_record", async (req, res) => {
    try {
        const campaignId = req.params["campaign_record"];
        const usersRef = collection(db, "user");
        const querySnapshot = await getDocs(usersRef);
        const users = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.campaign_record === campaignId) {
                users.push({ id: doc.id, ...data });
            }
        });

        if (users.length === 0) {
            return res.status(404).send(`<img src="https://http.cat/404" alt="404 Not Pawnd">`);
        }

        res.status(200).send(users);
    } catch (error) {
        console.error("Error fetching users by campaign:", error.message);
        res.status(500).send(`<img src="https://http.cat/500" alt="500 Internal Server Mewrror">`);
    }
});



const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
    console.log(`Server is Prrrunning on port ${PORT}`);
});