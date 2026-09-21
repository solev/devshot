# Devshot

Turn screenshots into polished product visuals.

Devshot is a browser-based screenshot editor for product demos, documentation, and social posts. Import an image, customize its presentation, and export a styled PNG without opening a full design tool.

## Features

- **Flexible import:** choose a file, drag and drop an image, or paste from the clipboard.
- **Visual presets:** apply preset styles, then adjust individual settings.
- **Custom backgrounds:** choose colors, gradients, patterns, or procedural SVG gradient waves.
- **Frames and effects:** customize browser bars, frames, borders, corner radius, shadows, scale, and rotation.
- **Live preview:** see changes as you edit, with image fitting that accounts for rotation.
- **High-resolution export:** download a PNG or copy it to the clipboard at 2x scale.

The main editing and export workflow runs in the browser. Devshot styles existing images; it does not capture screenshots from website URLs.

## Getting started

Install [Node.js](https://nodejs.org/) and [Bun](https://bun.sh/). The repository tracks `bun.lock`, so use Bun to keep dependency resolution consistent.

```sh
git clone https://github.com/solev/devshot.git
cd devshot
bun install --frozen-lockfile
bun run dev
```

Open [localhost:3000](http://localhost:3000). Access to the repository is required to clone it.

No API keys or database setup are required for the current editor workflow.

## Using the editor

1. Import a screenshot through the file picker, drag and drop, or `Cmd+V` / `Ctrl+V`.
2. Choose a preset or customize the background, frame, and effects.
3. Adjust the screenshot's scale, rotation, and canvas height.
4. Download the result as a PNG or copy it to the clipboard.

Clipboard export requires a browser that supports image clipboard writes and a secure context such as HTTPS or localhost. Use PNG download if clipboard access is unavailable or denied.

## Development

```sh
# Start the development server.
bun run dev

# Build the production application.
bun run build

# Serve a production build.
bun run start
```

`package.json` also defines `bun run lint`, but the repository does not currently include an ESLint dependency or configuration. Linting needs setup before it can be used as a non-interactive check. There is no automated test script.

The current Next.js configuration skips TypeScript and ESLint errors during production builds. A successful build is not a substitute for those checks.

### Technology

Next.js 14 with the App Router, React 18, TypeScript, Tailwind CSS 4, shadcn/ui and Radix UI, Zustand, and `html2canvas-pro`.

### Project structure

```text
app/
  page.tsx                    Landing page and editor entry point
  api/ai/                     Optional AI route handlers
components/
  image-tool.tsx              Editor preview and PNG/clipboard export
  image-tool/preview/         Background, browser bar, and canvas controls
  image-tool/sidebar/         Styling controls
  ui/                        Shared UI components
hooks/
  use-image-paste.ts          Image import and clipboard handling
lib/
  store.ts                   Editor state
  config/                    Presets, shadows, and constants
  azure-openai.ts             Optional Azure OpenAI integration
public/
  pattern/                   SVG pattern assets
```

### Optional AI integration

The repository includes Azure OpenAI routes and suggestion components, but the suggestion dock and automatic generation are currently disabled in the editor. AI suggestions are not part of the active editing workflow.

For development on that integration, create an untracked `.env.local`:

```dotenv
AZURE_OPENAI_RESOURCE_NAME=your-resource-name
AZURE_OPENAI_API_KEY=your-api-key
```

These are server-side credentials. Do not commit them or expose them through `NEXT_PUBLIC_` variables.

Model deployment names are selected in the route handlers under `app/api/ai/`. Match those names to your Azure deployments before using the integration. Setting environment variables alone does not enable the disabled editor UI.

## Deployment

Deploy as a Next.js application to a compatible host, such as Vercel, or run the production build with `bun run start`.

Use `bun install --frozen-lockfile` for installation and `bun run build` for the build step. Configure any optional Azure credentials through the hosting provider's environment settings.

## License

This repository does not currently include a license file. No open-source license is implied.
