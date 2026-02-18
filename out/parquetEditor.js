"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParquetEditorProvider = void 0;
const vscode = require("vscode");
const parquet = require("parquetjs-lite");
class ParquetEditorProvider {
    static register(context, outputChannel) {
        const provider = new ParquetEditorProvider(context, outputChannel);
        const providerRegistration = vscode.window.registerCustomEditorProvider(ParquetEditorProvider.viewType, provider);
        return providerRegistration;
    }
    constructor(context, outputChannel) {
        this.context = context;
        this.outputChannel = outputChannel;
    }
    async openCustomDocument(uri, openContext, token) {
        this.outputChannel.appendLine(`Opening document: ${uri.toString()}`);
        return { uri, dispose: () => { } };
    }
    async resolveCustomEditor(document, webviewPanel, token) {
        this.outputChannel.appendLine("Resolving custom editor...");
        webviewPanel.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(this.context.extensionUri, 'media')
            ]
        };
        webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);
        // Receive message from the webview.
        webviewPanel.webview.onDidReceiveMessage(async (e) => {
            this.outputChannel.appendLine(`Received message from webview: ${e.type}`);
            switch (e.type) {
                case 'ready':
                    // Initial load: page 1, 50 rows
                    await this.updateWebview(document.uri, webviewPanel.webview, 1, 50);
                    break;
                case 'loadPage':
                    const page = e.page || 1;
                    const limit = e.limit || 50;
                    await this.updateWebview(document.uri, webviewPanel.webview, page, limit);
                    break;
            }
        });
    }
    async updateWebview(uri, webview, page, limit) {
        this.outputChannel.appendLine(`Updating webview for page ${page}...`);
        this.outputChannel.appendLine(`Document URI: ${uri.toString()} (Scheme: ${uri.scheme})`);
        try {
            this.outputChannel.appendLine("Reading parquet file...");
            const { rows, total } = await this.readParquetFile(uri, page, limit);
            this.outputChannel.appendLine(`Read ${rows.length} rows. Total estimated: ${total}. Sending to webview...`);
            webview.postMessage({
                type: 'update',
                data: rows,
                page: page,
                limit: limit,
                total: total
            });
            this.outputChannel.appendLine("Data sent.");
        }
        catch (e) {
            const errorMsg = e.message;
            this.outputChannel.appendLine(`Error reading file: ${errorMsg}`);
            webview.postMessage({
                type: 'error',
                message: errorMsg
            });
        }
    }
    async readParquetFile(uri, page, limit) {
        const reader = await parquet.ParquetReader.openFile(uri.fsPath);
        const cursor = reader.getCursor();
        const rows = [];
        let record = null;
        // Calculate skip count
        const skip = (page - 1) * limit;
        let skipped = 0;
        let count = 0;
        // Very basic implementation: iterate to skip. 
        // For larger files, we might want to check rowCount metadata first if available/supported by lite lib.
        const rowCount = Number(reader.getRowCount());
        try {
            while (record = await cursor.next()) {
                if (skipped < skip) {
                    skipped++;
                    continue;
                }
                // Process record
                const processedRecord = {};
                for (const [key, value] of Object.entries(record)) {
                    if (typeof value === 'bigint') {
                        // Check if it looks like a nanosecond timestamp
                        // e.g., 2026 is approx 1.77e18
                        if (value > BigInt("1000000000000000000")) {
                            // Nanoseconds -> Milliseconds
                            const ms = Number(value / BigInt(1000000));
                            processedRecord[key] = new Date(ms).toLocaleDateString();
                        }
                        else if (value > BigInt("1000000000000")) {
                            // Milliseconds
                            processedRecord[key] = new Date(Number(value)).toLocaleString();
                        }
                        else {
                            processedRecord[key] = value.toString();
                        }
                    }
                    else {
                        processedRecord[key] = value;
                    }
                }
                rows.push(processedRecord);
                count++;
                if (count >= limit)
                    break;
            }
        }
        catch (readError) {
            this.outputChannel.appendLine(`Error during cursor iteration: ${readError}`);
            throw readError;
        }
        finally {
            await reader.close();
        }
        return { rows, total: rowCount };
    }
    getHtmlForWebview(webview) {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', 'parquet.js'));
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', 'parquet.css'));
        const nonce = getNonce();
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${styleUri}" rel="stylesheet" />
                <title>Parquet Viewer</title>
            </head>
            <body>
                <div id="loader">Loading Parquet file...</div>
                <div id="error" style="color: red; display: none;"></div>
                <div id="table-container"></div>
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>`;
    }
}
exports.ParquetEditorProvider = ParquetEditorProvider;
ParquetEditorProvider.viewType = 'parquet.viewer';
function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
//# sourceMappingURL=parquetEditor.js.map