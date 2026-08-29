// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    // The default Lovable config blocks `**/server/**` from going to the
    // client bundle. That breaks TanStack Start's createServerFn pattern,
    // which expects server fns to live under `src/server/**` and be safely
    // RPC-stubbed in the client. We override with an empty blocked-files
    // list to disable the rule; we keep the `server-only` specifier
    // protection (catches accidentally-leaked `import 'server-only'`).
    importProtection: {
      behavior: "error",
      client: {
        files: [],
        specifiers: ["server-only"],
      },
    },
  },
});
