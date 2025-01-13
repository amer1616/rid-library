import { html } from "../../src";
import { renderToString, renderToStream } from "../../src/server";
import { Counter } from "../counter/rid-counter";
import { Todo } from "../todo/rid-todo";

// Example data
const todos = [
  { id: "1", text: "Learn RID.js SSR", completed: true },
  { id: "2", text: "Build server-rendered app", completed: false },
];

// Empty slots record for SSR
const emptySlots: Record<string, HTMLElement[]> = {};

// Template for the full page
const template = (content: string) => `
<!DOCTYPE html>
<html>
  <head>
    <title>RID.js SSR Example</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script type="module" src="/client.js"></script>
  </head>
  <body>
    ${content}
  </body>
</html>
`;

/**
 * Render the full page with SSR
 */
export async function renderPage(): Promise<string> {
  const page = html`
    <div class="container">
      <h1>RID.js SSR Example</h1>

      <h2>Counter Component</h2>
      ${Counter({ count: 5, label: "Counter:" }, emptySlots)}

      <h2>Todo Component</h2>
      ${Todo({ items: todos }, emptySlots)}
    </div>
  `;

  const rendered = await renderToString(page, {
    hydrate: true,
    includeStyles: true,
  });

  return template(rendered);
}

/**
 * Stream the page with SSR
 */
export async function* streamPage(): AsyncGenerator<string> {
  yield "<!DOCTYPE html><html><head><title>RID.js Streaming SSR</title></head><body>";

  const page = html`
    <div class="container">
      <h1>RID.js Streaming SSR</h1>

      <h2>Counter Component</h2>
      ${Counter({ count: 5, label: "Counter:" }, emptySlots)}

      <h2>Todo Component</h2>
      ${Todo({ items: todos }, emptySlots)}
    </div>
  `;

  // Stream the content
  for await (const chunk of renderToStream(page, {
    hydrate: true,
    includeStyles: true,
  })) {
    yield chunk;
  }

  yield "</body></html>";
}

// Example usage with Node.js http server
if (typeof process !== "undefined" && process.versions?.node) {
  import("node:http")
    .then(({ createServer }) => {
      const server = createServer(async (req, res) => {
        if (req.url === "/stream") {
          res.setHeader("Content-Type", "text/html");
          for await (const chunk of streamPage()) {
            res.write(chunk);
          }
          res.end();
        } else {
          res.setHeader("Content-Type", "text/html");
          const html = await renderPage();
          res.end(html);
        }
      });

      server.listen(3000, () => {
        console.log("SSR Example running at http://localhost:3000");
      });
    })
    .catch(console.error);
}
