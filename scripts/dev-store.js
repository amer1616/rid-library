import { createServer } from "vite";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, "..");

async function startServer() {
  const server = await createServer({
    root: resolve(root, "examples/store"),
    base: "",
    server: {
      port: 5173,
      open: true,
    },
    resolve: {
      alias: {
        "@rid": resolve(root, "src/core"),
      },
    },
  });

  await server.listen();
  console.log("Store example running at http://localhost:5173");
}

startServer().catch(console.error);
