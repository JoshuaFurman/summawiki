# SummaWiki

## Overview

SummaWiki enables Wikipedia Page Preview functionality for the whole web! When you hover your mouse over a Wikipedia link, this extension will display an in-page popup that mimics what would be displayed if you had done that on a Wikipedia page.

**Features:**
- Works with Wikipedia links in all languages (en, de, fr, es, etc.)
- Shows article title, thumbnail image, and summary
- Intelligent popup positioning that stays within viewport
- Caches results for better performance

## Installation

### From Chrome Web Store

1. Visit the [SummaWiki Chrome Web Store page](#) (link coming soon)
2. Click "Add to Chrome"
3. Confirm the installation

### Manual Installation (Developer Mode)

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the folder containing these files
5. The extension should now be loaded and visible in your extensions list

## Usage

Simply hover over any Wikipedia link on any website. A popup will appear after a brief delay showing:
- The article title
- A thumbnail image (if available)
- A summary of the article
- A link to read more on Wikipedia

The popup will disappear when you move your mouse away.

## Privacy

This extension:
- Only activates when you hover over Wikipedia links
- Makes requests directly to the official Wikipedia API
- Does not collect or transmit any personal data
- Does not track your browsing history

## Permissions

- **Host permissions for Wikipedia**: Required to fetch article summaries from the Wikipedia API

## Version History

### 1.1
- Added support for all Wikipedia languages (not just English)
- Fixed thumbnail display issues
- Improved popup positioning to stay within viewport
- Added debouncing to reduce unnecessary API calls
- Added caching for better performance
- Improved popup show/hide behavior
- Better error handling

### 1.0
- Initial release
- English Wikipedia support
