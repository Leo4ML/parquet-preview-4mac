import * as vscode from 'vscode';
import { ParquetEditorProvider } from './parquetEditor';

export function activate(context: vscode.ExtensionContext) {
    const outputChannel = vscode.window.createOutputChannel("Parquet Viewer");
    outputChannel.appendLine("Parquet Viewer Extension Activated");
	context.subscriptions.push(ParquetEditorProvider.register(context, outputChannel));
}

