// server.js
import "dotenv/config"; 
import express from "express";
import cors from "cors";
import db from "./app/models/index.js";
import authRoutes from "./app/routes/auth.routes.js";
import userRoutes from "./app/routes/user.routes.js";

const app = express();

const Role = db.role;

// Habilitar CORS para desarrollo local y el frontend desplegado en Render
const allowedOrigins = [
  "http://localhost:8080",
  "http://localhost:5173"
];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir peticiones sin origen (como Postman o curl) o desde orígenes permitidos
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".onrender.com")) {
      callback(null, true);
    } else {
      callback(null, true); // O puedes restringirlo a tu URL exacta de Render
    }
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.json({ message: "Welcome to the Node.js JWT Authentication API." });
});

app.use("/api/auth", authRoutes);
app.use("/api/test", userRoutes);

const PORT = process.env.PORT || 3000;

db.sequelize.sync({ force: false }).then(() => {
    console.log("Database synchronized");
    initial(); // <--- Crea los roles en Aiven si no existen

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}.`);
    });
});

// Función para poblar la tabla roles
async function initial() {
  try {
    await Role.findOrCreate({ where: { id: 1 }, defaults: { id: 1, name: "user" } });
    await Role.findOrCreate({ where: { id: 2 }, defaults: { id: 2, name: "moderator" } });
    await Role.findOrCreate({ where: { id: 3 }, defaults: { id: 3, name: "admin" } });
    console.log("Roles initialized successfully.");
  } catch (error) {
    console.error("Error initializing roles:", error);
  }
}
