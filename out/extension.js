"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
const vscode = require("vscode");
const parquetEditor_1 = require("./parquetEditor");
console.log('Parquet Viewer extension is loading...');
function activate(context) {
    const outputChannel = vscode.window.createOutputChannel("Parquet Viewer");
    outputChannel.appendLine("Parquet Viewer Extension Activated");
    context.subscriptions.push(parquetEditor_1.ParquetEditorProvider.register(context, outputChannel));
}
//# sourceMappingURL=extension.js.map