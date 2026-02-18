# Publishing and Installing the Extension

## Packaging
You can create a `.vsix` file (installation package) by running:
```bash
npx vsce package
```
This will generate `vscode-parquet-viewer-0.0.1.vsix` in the project root.

## Installation

### In VS Code
1.  Open the Extensions view (`Cmd+Shift+X`).
2.  Click the `...` (Views and More Actions) menu at the top right of the Extensions view.
3.  Select **"Install from VSIX..."**.
4.  Navigate to `/Users/leo/Projects/antigravity-parquet-preview/vscode-parquet-viewer-0.0.1.vsix` and select it.

### In Antigravity (or Cursro/Other IDEs)
The process is usually similar to VS Code, as they are based on the same core. Look for "Install from VSIX" in the Extensions menu.

## Publishing to Marketplace

### 1. Create a Publisher
1.  Go to the [Visual Studio Marketplace management page](https://marketplace.visualstudio.com/manage).
2.  Log in with your Microsoft account.
3.  Click **"Create publisher"** and fill in the details (ID, Name, etc.).
4.  Update the `"publisher"` field in `package.json` to match your new Publisher ID.

### 2. Generate a Personal Access Token (PAT)
1.  Follow the instructions [here](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#get-a-personal-access-token) to generate a PAT in Azure DevOps.
2.  Ensure the token has **"Marketplace (manage)"** scope.

### 3. Login and Publish
Run the following commands in your terminal:

```bash
# Login (you will be prompted for your PAT)
npx vsce login <publisher id>

# Publish
npx vsce publish
```

Alternatively, you can upload the `.vsix` file directly on the [Marketplace management page](https://marketplace.visualstudio.com/manage).
