# Setup on a new machine (Figma MCP)

The ERD is edited through the **figma-console** MCP server and its **Desktop Bridge** plugin. The plugin
runs inside Figma Desktop and executes the scripts with the Figma Plugin API. The server is declared
for the whole project in [`/.mcp.json`](../../../../.mcp.json), so the server config comes with a clone.

1. **Node.js ≥ 18** (`npx` must work). The server starts with `npx -y figma-console-mcp@latest`.
2. **Approve the project MCP server.** Start Claude Code in the repo. It asks to trust the servers in
   `.mcp.json`; approve `figma-console`. Check with `/mcp`.
3. **Optional: Figma token.** Export `FIGMA_ACCESS_TOKEN` (Figma → Settings → Security → Personal access
   tokens) before starting Claude Code. `.mcp.json` reads it as `${FIGMA_ACCESS_TOKEN:-}`.
   - It is only needed for REST tools such as `figma_take_screenshot`.
   - Everything in this skill works without it through the Desktop Bridge; use `figma_capture_screenshot`
     for screenshots.
   - **Never commit a token** to `.mcp.json`.
4. **Install the Desktop Bridge plugin once.** The MCP server writes the plugin to
   `~/.figma-console-mcp/plugin/` on its first start.
   - In Figma Desktop: **Plugins → Development → Import plugin from manifest…** →
     `~/.figma-console-mcp/plugin/manifest.json`.
   - After a server update, re-import it the same way, because Figma caches the plugin code.
5. **Connect.**
   - Open the ERD file in Figma Desktop: "FigJam Brainstorm OI", key `Z7QhV7NQK6uQKGfWUftk4W`, page
     `ERD — spec <date>`.
   - Run **Plugins → Development → Figma Desktop Bridge** and keep its window open.
   - In Claude: `figma_list_open_files` must list the file with `isActive: true`.

## Not portable through the repo

- The **claude.ai Figma connector** (`mcp__claude_ai_Figma__*`, official Figma MCP) is tied to the
  claude.ai account. Each person enables it in their own claude.ai settings. This skill does not need it.
- Scope precedence in Claude Code is local > project (`.mcp.json`) > user (`~/.claude.json`).
  - A personal user-scope `figma-console` entry is therefore shadowed by the project one.
  - To use a personal token anyway, export `FIGMA_ACCESS_TOKEN` in the shell, or add a local-scope
    override with `claude mcp add -s local …`.
