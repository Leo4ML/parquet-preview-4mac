# Parquet Preview 4 Mac

A VS Code extension to preview Apache Parquet files directly in your editor. 
**Specially optimized for macOS and Antigravity IDE.**

## Features

- **Data Grid View**: Displays Parquet file content in a clean, readable table.
- **Pagination**: 
    - Handle large files efficiently with built-in pagination (50 rows per page).
    - **Jump to Page**: Quickly navigate to any page using the new input control.
- **Smart Formatting**: 
    - Automatically detects nanosecond timestamps and formats them to readable date strings (e.g., `2026/2/13`).
    - Handles BigInts correctly to prevent extension crashes (ES2019 compatible).
- **Pure JavaScript**: Built with `parquetjs-lite`, requiring no external dependencies like Python or Java.
- **Antigravity Ready**: Tested and optimized for Antigravity on macOS.

## Requirements

- VS Code 1.80.0 or higher.
- macOS (Recommended, but works on other platforms too).

## Usage

1.  Simply open any `.parquet` file in VS Code.
2.  The extension will automatically activate and show the table view.
3.  Use the "Prev/Next" buttons at the bottom to navigate through records.

## Installation

### From Marketplace
Search for `parquet-preview-4mac` in the Extensions view, or install directly:
- **VS Code Marketplace**: [Install](https://marketplace.visualstudio.com/items?itemName=TheSuperLeo.parquet-preview-4mac)
- **Open VSX Registry**: [Install](https://open-vsx.org/extension/TheSuperLeo/parquet-preview-4mac)

### Manual Installation
1.  Download the `.vsix` from the [Releases](https://github.com/Leo4ML/parquet-preview-4mac/releases) page.
2.  In VS Code, go to **Extensions** > **...** > **Install from VSIX**.
3.  Select the file and install.

## Support

For issues and feature requests, please visit: [https://github.com/Leo4ML/parquet-preview-4mac](https://github.com/Leo4ML/parquet-preview-4mac)
