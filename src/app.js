const express = require('express');
const db = require('../firebase_config');
const app = express();

app.get("/", async (req, res) => {
    const data = {
        name: 'Los Angeles',
        state: 'CA',
        country: 'USA'
    };
    const respuesta = await db.collection('user').doc('LA').set(data);
    res.send(respuesta)
})

const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    
});