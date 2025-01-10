import { define } from "../../src";
import { Counter, counterProps } from "../../src/components/rid-counter";
import { Todo, todoProps } from "../../src/components/rid-todo";

// Register components
define("rid-counter", Counter, { props: counterProps });
define("rid-todo", Todo, { props: todoProps });

// Hydration indicator from server
declare global {
  interface Window {
    __RID_HYDRATE__?: boolean;
    __RID_IDS__?: string[];
  }
}

// Hydrate components if needed
if (window.__RID_HYDRATE__) {
  console.log("Hydrating components...");

  // Re-attach event handlers
  window.__RID_IDS__?.forEach((id) => {
    const el = document.querySelector(`[data-rid-id="${id}"]`);
    if (el) {
      const eventType = el.getAttribute("data-rid-h");
      if (eventType) {
        // Event handlers will be re-attached by the component system
        console.log(`Re-attaching ${eventType} handler for ${id}`);
      }
    }
  });

  // Clean up hydration flags
  delete window.__RID_HYDRATE__;
  delete window.__RID_IDS__;
}

// Add some basic styles
const styles = document.createElement("style");
styles.textContent = `
  body {
    font-family: system-ui, -apple-system, sans-serif;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }

  .container {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    padding: 20px;
  }

  h1 {
    color: #333;
    border-bottom: 2px solid #eee;
    padding-bottom: 10px;
  }

  h2 {
    color: #666;
    margin-top: 30px;
  }
`;
document.head.appendChild(styles);
