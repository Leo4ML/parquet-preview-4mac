import * as vscode from 'vscode';
import * as parquet from 'parquetjs-lite';
import * as path from 'path';

export class ParquetEditorProvider implements vscode.CustomReadonlyEditorProvider {

    public static register(context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel): vscode.Disposable {
        const provider = new ParquetEditorProvider(context, outputChannel);
        const providerRegistration = vscode.window.registerCustomEditorProvider(ParquetEditorProvider.viewType, provider);
        return providerRegistration;
    }

    private static readonly viewType = 'parquet.viewer';

    constructor(
        private readonly context: vscode.ExtensionContext,
        private readonly outputChannel: vscode.OutputChannel
    ) { }

    async openCustomDocument(
        uri: vscode.Uri,
        openContext: vscode.CustomDocumentOpenContext,
        token: vscode.CancellationToken
    ): Promise<vscode.CustomDocument> {
        this.outputChannel.appendLine(`Opening document: ${uri.toString()}`);
        return { uri, dispose: () => { } };
    }

    async resolveCustomEditor(
        document: vscode.CustomDocument,
        webviewPanel: vscode.WebviewPanel,
        token: vscode.CancellationToken
    ): Promise<void> {
        this.outputChannel.appendLine("Resolving custom editor...");
        webviewPanel.webview.options = {
            enableScripts: true,
        };

        webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

        // Receive message from the webview.
        webviewPanel.webview.onDidReceiveMessage(async e => {
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

    private async updateWebview(uri: vscode.Uri, webview: vscode.Webview, page: number, limit: number) {
        this.outputChannel.appendLine(`Updating webview for page ${page}...`);
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
        } catch (e) {
            const errorMsg = (e as Error).message;
            this.outputChannel.appendLine(`Error reading file: ${errorMsg}`);
            webview.postMessage({
                type: 'error',
                message: errorMsg
            });
        }
    }

    private async readParquetFile(uri: vscode.Uri, page: number, limit: number): Promise<{ rows: any[], total: number }> {
        const reader = await parquet.ParquetReader.openFile(uri.fsPath);
        const cursor = reader.getCursor();
        const rows: any[] = [];
        let record: any = null;
        
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
                const processedRecord: any = {};
                for (const [key, value] of Object.entries(record)) {
                    if (typeof value === 'bigint') {
                        // Check if it looks like a nanosecond timestamp
                        // e.g., 2026 is approx 1.77e18
                        if (value > 1000000000000000000n) {
                             // Nanoseconds -> Milliseconds
                             const ms = Number(value / 1000000n);
                             processedRecord[key] = new Date(ms).toLocaleDateString();
                        } else if (value > 1000000000000n) {
                             // Milliseconds
                             processedRecord[key] = new Date(Number(value)).toLocaleString();
                        } else {
                             processedRecord[key] = value.toString();
                        }
                    } else {
                        processedRecord[key] = value;
                    }
                }
                rows.push(processedRecord);
                
                count++;
                if (count >= limit) break;
            }
        } catch (readError) {
             this.outputChannel.appendLine(`Error during cursor iteration: ${readError}`);
             throw readError;
        } finally {
             await reader.close();
        }
        return { rows, total: rowCount };
    }

    private getHtmlForWebview(webview: vscode.Webview): string {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'src', 'media', 'parquet.js'));
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'src', 'media', 'parquet.css'));
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

function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}
