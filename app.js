import express from "express";
import cors from "cors";

import userRoutes from "./src/routes/user.routes.js";
import donationRoutes from "./src/routes/donation.routes.js";
import campaignRoutes from "./src/routes/campaign.routes.js";

const app = express();
//Mystics from the Conurban
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/user", userRoutes);
app.use("/donation", donationRoutes);
app.use("/campaign", campaignRoutes);

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  const htmlResponse = `
      <html>
        <head>
          <title>NodeJs y Express en Vercel</title>
        </head>
        <body>
          <h1>Soy un proyecto Back end en vercel</h1>
        </body>
      </html>
    `;
  res.send(htmlResponse);
});

app.use((req, res, next) => {
  res.status(404).json({
    error: "Not Found",
    message: "La ruta solicitada no existe.",
  });
});

app.listen(PORT, () => {
  console.log(`Server is Prrrunning on port ${PORT}`);
});
