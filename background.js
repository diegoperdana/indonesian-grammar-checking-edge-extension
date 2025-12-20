// Background service worker for Indonesian Grammar Checker Extension

chrome.runtime.onInstalled.addListener(() => {
    // Set default settings
    chrome.storage.sync.set({
        grammarCheckerEnabled: true
    });
});

// Handle extension icon click (if needed)
chrome.action.onClicked.addListener((tab) => {
    // This is handled by popup, but can be used for other actions
});


