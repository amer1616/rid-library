import type { TemplateResult } from "../core/template";

// Server-side rendering context
interface SSRContext {
  ids: Set<string>;
  styles: Set<string>;
  scripts: Set<string>;
}

// Create a new SSR context
const createSSRContext = (): SSRContext => ({
  ids: new Set(),
  styles: new Set(),
  scripts: new Set(),
});

// Process template result for SSR
const processTemplate = (
  template: TemplateResult,
  context: SSRContext
): string => {
  let html = template.h;

  // Extract and dedupe styles
  const styleMatches = html.match(/<style>([\s\S]*?)<\/style>/g);
  if (styleMatches) {
    styleMatches.forEach((style) => {
      context.styles.add(style.replace(/<\/?style>/g, ""));
      html = html.replace(style, "");
    });
  }

  // Handle event listeners
  template.hs.forEach(({ id, e }) => {
    context.ids.add(id);
    const dataAttr = `data-rid-h="${e}" data-rid-id="${id}"`;
    html = html.replace(dataAttr, ""); // Remove client-only attributes
  });

  return html;
};

// Generate hydration script
const generateHydrationScript = (context: SSRContext): string => {
  return `
    <script type="module">
      window.__RID_IDS__ = ${JSON.stringify(Array.from(context.ids))};
      window.__RID_HYDRATE__ = true;
    </script>
  `;
};

// Generate style tag
const generateStyles = (context: SSRContext): string => {
  if (context.styles.size === 0) return "";
  return `
    <style>
      ${Array.from(context.styles).join("\n")}
    </style>
  `;
};

/**
 * Render a template to string with SSR support
 * @param template Template result to render
 * @param options SSR options
 * @returns Promise resolving to rendered HTML string
 */
export const renderToString = async (
  template: TemplateResult,
  options: {
    hydrate?: boolean;
    includeStyles?: boolean;
  } = {}
): Promise<string> => {
  const context = createSSRContext();
  const html = processTemplate(template, context);

  const parts = [html];

  if (options.includeStyles !== false) {
    parts.unshift(generateStyles(context));
  }

  if (options.hydrate !== false) {
    parts.push(generateHydrationScript(context));
  }

  return parts.join("\n");
};

/**
 * Create a streaming renderer
 * @param template Template result to render
 * @param options SSR options
 * @returns Async generator yielding HTML chunks
 */
export async function* renderToStream(
  template: TemplateResult,
  options: {
    hydrate?: boolean;
    includeStyles?: boolean;
  } = {}
): AsyncGenerator<string> {
  const context = createSSRContext();

  if (options.includeStyles !== false) {
    yield generateStyles(context);
  }

  // Process and yield template in chunks
  const html = processTemplate(template, context);
  const chunkSize = 8192; // 8KB chunks
  for (let i = 0; i < html.length; i += chunkSize) {
    yield html.slice(i, i + chunkSize);
  }

  if (options.hydrate !== false) {
    yield generateHydrationScript(context);
  }
}

// Export types
export type { SSRContext };
