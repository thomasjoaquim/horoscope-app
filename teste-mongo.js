import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Conectado ao MongoDB com sucesso!"))
  .catch(err => console.error("❌ Erro de conexão:", err.message));
