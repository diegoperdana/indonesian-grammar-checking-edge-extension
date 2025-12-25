// Popup script for Indonesian Grammar Checker Extension

document.addEventListener('DOMContentLoaded', () => {
    const toggleEnabled = document.getElementById('toggleEnabled');
    const scanBtn = document.getElementById('scanBtn');
    const clearBtn = document.getElementById('clearBtn');
    const reportBtn = document.getElementById('reportBtn');
    const status = document.getElementById('status');
    const reportModal = document.getElementById('reportModal');
    const closeModal = document.getElementById('closeModal');
    const modalBody = document.getElementById('modalBody');

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

    // Report button
    reportBtn.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (!tabs || tabs.length === 0) {
                modalBody.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #dc3545;">
                        <p>Tidak dapat mengakses tab saat ini.</p>
                    </div>
                `;
                reportModal.style.display = 'block';
                return;
            }

            const tab = tabs[0];
            
            // Check if it's a valid web page (not chrome:// or chrome-extension://)
            if (tab.url && (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('edge://'))) {
                modalBody.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #dc3545;">
                        <p>Laporan tidak tersedia untuk halaman ini.</p>
                        <p style="font-size: 12px; margin-top: 10px;">Buka halaman web biasa untuk menggunakan fitur ini.</p>
                    </div>
                `;
                reportModal.style.display = 'block';
                return;
            }

            modalBody.innerHTML = '<div class="loading">Memuat laporan...</div>';
            reportModal.style.display = 'block';
            
            // Send message to content script
            chrome.tabs.sendMessage(tab.id, {
                action: 'getReport'
            }, (response) => {
                if (chrome.runtime.lastError) {
                    const errorMsg = chrome.runtime.lastError.message;
                    console.error('Error getting report:', errorMsg);
                    
                    // Check if content script is not available
                    if (errorMsg.includes('port closed') || errorMsg.includes('Could not establish connection')) {
                        modalBody.innerHTML = `
                            <div style="text-align: center; padding: 40px; color: #dc3545;">
                                <p><strong>Content script belum tersedia</strong></p>
                                <p style="font-size: 12px; margin-top: 10px;">Silakan:</p>
                                <ol style="text-align: left; font-size: 12px; margin-top: 10px; padding-left: 20px;">
                                    <li>Refresh halaman ini</li>
                                    <li>Klik tombol "Pindai Halaman" terlebih dahulu</li>
                                    <li>Kemudian coba buka laporan lagi</li>
                                </ol>
                            </div>
                        `;
                    } else {
                        modalBody.innerHTML = `
                            <div style="text-align: center; padding: 40px; color: #dc3545;">
                                <p>Error: ${errorMsg}</p>
                                <p style="font-size: 12px; margin-top: 10px;">Pastikan halaman sudah di-scan terlebih dahulu.</p>
                            </div>
                        `;
                    }
                } else if (response && response.success && response.report) {
                    displayReport(response.report);
                } else if (response && response.success === false) {
                    modalBody.innerHTML = `
                        <div style="text-align: center; padding: 40px; color: #dc3545;">
                            <p>Error: ${response.error || 'Gagal memuat laporan'}</p>
                        </div>
                    `;
                } else {
                    modalBody.innerHTML = `
                        <div class="no-errors">
                            <p>Belum ada data laporan.</p>
                            <p style="font-size: 14px; margin-top: 10px;">Silakan lakukan scan terlebih dahulu dengan klik tombol "Pindai Halaman".</p>
                        </div>
                    `;
                }
            });
        });
    });

    // Close modal
    closeModal.addEventListener('click', () => {
        reportModal.style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === reportModal) {
            reportModal.style.display = 'none';
        }
    });

    function displayReport(report) {
        let html = '';

        // Summary cards
        html += '<div class="report-summary">';
        html += `<div class="summary-card ${report.totalErrors === 0 ? 'success' : ''}">
            <div class="number">${report.totalErrors}</div>
            <div class="label">Total Masalah</div>
        </div>`;
        html += `<div class="summary-card error">
            <div class="number">${report.errorCount}</div>
            <div class="label">Kesalahan</div>
        </div>`;
        html += `<div class="summary-card warning">
            <div class="number">${report.warningCount}</div>
            <div class="label">Peringatan</div>
        </div>`;
        html += '</div>';

        if (report.totalErrors === 0) {
            html += '<div class="no-errors">✓ Tidak ada kesalahan tata bahasa ditemukan!</div>';
        } else {
            // Errors section
            if (report.errors.length > 0) {
                html += '<div class="error-section">';
                html += '<div class="error-section-title">❌ Kesalahan (Errors)</div>';
                report.errors.forEach((error, index) => {
                    html += createErrorItem(error, 'error', index + 1);
                });
                html += '</div>';
            }

            // Warnings section
            if (report.warnings.length > 0) {
                html += '<div class="error-section">';
                html += '<div class="error-section-title">⚠️ Peringatan (Warnings)</div>';
                report.warnings.forEach((warning, index) => {
                    html += createErrorItem(warning, 'warning', index + 1);
                });
                html += '</div>';
            }

            // Grouped by category
            if (Object.keys(report.byCategory).length > 0) {
                html += '<div class="error-section">';
                html += '<div class="error-section-title">📁 Dikelompokkan berdasarkan Kategori</div>';
                Object.keys(report.byCategory).forEach(category => {
                    const categoryData = report.byCategory[category];
                    html += `<h3 style="margin-top: 20px; margin-bottom: 10px; color: #667eea;">${category.charAt(0).toUpperCase() + category.slice(1)}</h3>`;
                    if (categoryData.errors.length > 0) {
                        categoryData.errors.forEach((error, index) => {
                            html += createErrorItem(error, 'error', index + 1);
                        });
                    }
                    if (categoryData.warnings.length > 0) {
                        categoryData.warnings.forEach((warning, index) => {
                            html += createErrorItem(warning, 'warning', index + 1);
                        });
                    }
                });
                html += '</div>';
            }
        }

        modalBody.innerHTML = html;
    }

    function createErrorItem(error, type, number) {
        let html = `<div class="error-item ${type}">`;
        html += `<div class="error-text">"${escapeHtml(error.text)}"</div>`;
        html += `<div class="error-message">${escapeHtml(error.message)}</div>`;
        
        if (error.rule) {
            html += `<div class="error-rule">Aturan: ${escapeHtml(error.rule)}</div>`;
        }
        
        if (error.explanation) {
            html += `<div class="error-explanation">${escapeHtml(error.explanation)}</div>`;
        }
        
        if (error.suggestion) {
            html += `<div class="error-suggestion">
                <strong>💡 Saran perbaikan:</strong>
                ${escapeHtml(error.suggestion)}
            </div>`;
        }
        
        if (error.context && (error.context.before || error.context.after)) {
            let contextText = '';
            if (error.context.before) {
                contextText += `...${escapeHtml(error.context.before)}`;
            }
            contextText += `<strong>${escapeHtml(error.text)}</strong>`;
            if (error.context.after) {
                contextText += `${escapeHtml(error.context.after)}...`;
            }
            html += `<div class="error-context">Konteks: ${contextText}</div>`;
        }
        
        if (error.elementContext) {
            html += `<div class="error-context" style="margin-top: 5px;">Ditemukan di: ${escapeHtml(error.elementContext)}</div>`;
        }
        
        html += '</div>';
        return html;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

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


