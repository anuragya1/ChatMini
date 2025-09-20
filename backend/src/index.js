import http from "http";

import app from "./app.js";
import { connectDB } from "./config/db.js";
import { config } from "./config/env.js";


const server = http.createServer(app);




connectDB().then(() =>
  server.listen(config.port, () =>
    console.log(` Server running on port ${config.port}`)
  )
);
