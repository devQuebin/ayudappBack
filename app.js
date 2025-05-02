import express from "express";
import cors from "cors";

import userRoutes from "./src/routes/user.routes.js";
import donationRoutes from "./src/routes/donation.routes.js";
import campaignRoutes from "./src/routes/campaign.routes.js";

const app = express();

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

// Helper para obtener rutas de un router
function getRoutesFromRouter(prefix, router) {
  const routes = [];
  router.stack.forEach((layer) => {
    if (layer.route) {
      const path = prefix + layer.route.path;
      const methods = Object.keys(layer.route.methods)
        .map((m) => m.toUpperCase())
        .join(", ");
      routes.push({ methods, path });
    }
  });
  return routes;
}

app.get("/", (req, res) => {
  // Junta todas las rutas de los routers
  const allRoutes = [
    ...getRoutesFromRouter("/user", userRoutes),
    ...getRoutesFromRouter("/donation", donationRoutes),
    ...getRoutesFromRouter("/campaign", campaignRoutes),
  ];

  const tableRows = allRoutes
    .map(
      (r) =>
        `<tr><td>${r.methods}</td><td>${r.path}</td></tr>`
    )
    .join("");

  const htmlResponse = `
      <html>
        <head>
          <title>NodeJs y Express en Vercel</title>
          <style>
            table { border-collapse: collapse; width: 60%; margin: 20px 0;}
            th, td { border: 1px solid #888; padding: 8px; text-align: left;}
            th { background: #eee; }
          </style>
        </head>
        <body>
          <h1>Soy un proyecto Back end en vercel</h1>
          <p>Actualizado a Mayo 2025</p>
          <h2>Rutas principales</h2>
          <table>
            <tr><th>Método(s)</th><th>Ruta</th></tr>
            ${tableRows}
          </table>
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
