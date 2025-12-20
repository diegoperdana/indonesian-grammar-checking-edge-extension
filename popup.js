// Popup script for Indonesian Grammar Checker Extension

document.addEventListener('DOMContentLoaded', () => {
    const toggleEnabled = document.getElementById('toggleEnabled');
    const scanBtn = document.getElementById('scanBtn');
    const clearBtn = document.getElementById('clearBtn');
    const status = document.getElementById('status');

    // Load saved state
    chrome.storage.sync.get(['grammarCheckerEnabled'], (result) => {
        const enabled = result.grammarCheckerEnabled !== false; // Default to enabled
        toggleEnabled.checked = enabled;
        updateStatus(enabled);
    });

    // Toggle enabled/disabled
    toggleEnabled.addEventListener('change', (e) => {
        const enabled = e.target.checked;
        chrome.storage.sync.set({ grammarCheckerEnabled: enabled }, () => {
            updateStatus(enabled);
            
            // Send message to content script
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'toggle',
                    enabled: enabled
                });
            });
        });
    });

    // Scan button
    scanBtn.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'scan'
            }, (response) => {
                if (chrome.runtime.lastError) {
                    status.textContent = 'Status: Error - Muat ulang halaman';
                    status.style.background = '#f8d7da';
                    status.style.color = '#721c24';
                } else {
                    status.textContent = 'Status: Memindai...';
                    setTimeout(() => {
                        status.textContent = 'Status: Selesai memindai';
                    }, 1000);
                }
            });
        });
    });

    // Clear button
    clearBtn.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'toggle',
                enabled: false
            }, () => {
                toggleEnabled.checked = false;
                chrome.storage.sync.set({ grammarCheckerEnabled: false });
                updateStatus(false);
                
                // Then enable again to clear
                setTimeout(() => {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: 'toggle',
                        enabled: true
                    });
                    toggleEnabled.checked = true;
                    chrome.storage.sync.set({ grammarCheckerEnabled: true });
                    updateStatus(true);
                }, 100);
            });
        });
    });

    function updateStatus(enabled) {
        if (enabled) {
            status.textContent = 'Status: Aktif';
            status.className = 'status active';
        } else {
            status.textContent = 'Status: Nonaktif';
            status.className = 'status';
        }
    }
});


