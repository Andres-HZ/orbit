import "dotenv/config";
import { createApp } from "./app.js";

const port = Number(process.env.API_PORT ?? 3000);

createApp().listen(port, () => {
  console.log(`Orbit API listening on http://localhost:${port}`);
});
