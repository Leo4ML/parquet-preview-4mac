# Parquet Preview 4 Mac

A VS Code extension to preview Apache Parquet files directly in your editor. Optimized for macOS.

## Features

- **Data Grid View**: Displays Parquet file content in a clean, readable table.
- **Pagination**: Handle large files efficiently with built-in pagination (50 rows per page).
- **Smart Formatting**: 
    - Automatically detects nanosecond timestamps and formats them to readable date strings (e.g., `2026/2/13`).
    - Handles BigInts correctly to prevent extension crashes.
- **Pure JavaScript**: Built with `parquetjs-lite`, requiring no external dependencies like Python or Java.

## Requirements

- VS Code 1.80.0 or higher.
- macOS (Recommended, but works on other platforms too).

## Usage

1.  Simply open any `.parquet` file in VS Code.
2.  The extension will automatically activate and show the table view.
3.  Use the "Prev/Next" buttons at the bottom to navigate through records.

## Installation

### From Marketplace
(Coming Soon)

### Manual Installation
1.  Download the `.vsix` file.
2.  In VS Code, go to **Extensions** > **...** > **Install from VSIX**.
3.  Select the file and install.

## Support

For issues and feature requests, please visit: [https://github.com/Leo4ML/parquet-preview-4mac](https://github.com/Leo4ML/parquet-preview-4mac)
