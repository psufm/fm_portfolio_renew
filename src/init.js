import dotenv from "dotenv";
import app from "./app";
dotenv.config();
const PORT = process.env.PORT || 80;

const handleListening = () =>
  console.log(`✅ Listening on: http://localhost:${PORT}`);

app.listen(PORT, handleListening);
