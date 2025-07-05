import app from "./app";
import dotenv from "dotenv";
import "../src/workers/pdfProcessorWorker";

dotenv.config();

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});