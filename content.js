// Content script for Indonesian Grammar Checker Extension
// Scans and highlights grammar errors on web pages

(function() {
    'use strict';

    // Grammar checker instance (will be initialized after class is available)
    let grammarChecker = null;
    
    let isActive = false;
    let highlightedElements = [];
    let errorMarkers = [];
    let summaryDismissed = false; // Track if user dismissed the summary
    let summaryShown = false; // Track if summary has been shown for current scan session
    let isScanning = false; // Track if scan is in progress

    // Initialize grammar checker
    function initGrammarChecker() {
        if (typeof IndonesianGrammarChecker !== 'undefined') {
            grammarChecker = new IndonesianGrammarChecker();
            return true;
        }
        return false;
    }

    // Initialize extension
    function init() {
        // Check if extension is enabled
        chrome.storage.sync.get(['grammarCheckerEnabled'], (result) => {
            isActive = result.grammarCheckerEnabled !== false; // Default to enabled
            if (isActive) {
                // Initial scan - treat as manual scan so popup can appear once
                startScanning(true, true);
            }
        });

        // Listen for messages from popup
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'toggle') {
                isActive = request.enabled;
                if (isActive) {
                    // Reset dismissed state when toggling on - treat as manual scan
                    startScanning(true, true);
                } else {
                    stopScanning();
                }
                sendResponse({ success: true });
                return true; // Indicates we will send a response asynchronously
            } else if (request.action === 'scan') {
                // Manual scan - reset dismissed state
                startScanning(true, true);
                sendResponse({ success: true });
                return true;
            } else if (request.action === 'getReport') {
                // Get full report of all errors
                try {
                    const report = getFullReport();
                    sendResponse({ success: true, report: report });
                } catch (error) {
                    console.error('Error getting report:', error);
                    sendResponse({ success: false, error: error.message });
                }
                return true; // Important: return true to indicate async response
            }
            return false; // Indicates we won't send a response
        });
    }

    // Start scanning the page
    function startScanning(resetDismissed = true, isManualScan = true) {
        if (!grammarChecker) {
            if (!initGrammarChecker()) {
                console.error('Cannot start scanning: Grammar checker not available');
                return;
            }
        }

        // Prevent multiple simultaneous scans
        if (isScanning) {
            return;
        }

        try {
            isScanning = true;
            stopScanning(); // Clear previous scans
            
            // Only reset dismissal state if explicitly requested (manual scan)
            if (resetDismissed) {
                summaryDismissed = false;
                summaryShown = false;
            }
            
            // Find all text elements
            const textElements = findTextElements();
            
            textElements.forEach(element => {
                scanElement(element);
            });

            // Only show summary for manual scans, NEVER for auto-scans from MutationObserver
            // This ensures popup only appears when user explicitly requests a scan
            // Once dismissed, popup will never show again for auto-scans
            if (isManualScan && !summaryDismissed && !summaryShown) {
                showSummary();
            }
            // For auto-scans (isManualScan = false), never show popup, even if flags are reset
            // This prevents popup from appearing during automatic re-scans
            
            isScanning = false;
        } catch (error) {
            console.error('Error during scanning:', error);
            isScanning = false;
        }
    }

    // Stop scanning and clear highlights
    function stopScanning() {
        // Remove all highlights
        highlightedElements.forEach(item => {
            if (item.element && item.originalText !== undefined) {
                item.element.textContent = item.originalText;
                item.element.classList.remove('igc-highlighted');
            }
        });

        // Remove error markers
        errorMarkers.forEach(marker => {
            if (marker.parentNode) {
                marker.parentNode.removeChild(marker);
            }
        });

        highlightedElements = [];
        errorMarkers = [];
        
        // Remove summary
        const summary = document.getElementById('igc-summary');
        if (summary) {
            // Clear auto-hide timeout if exists
            if (summary.autoHideTimeout) {
                clearTimeout(summary.autoHideTimeout);
            }
            summary.remove();
        }
        
        // Don't reset dismissal state here - preserve it so popup won't show again
        // after user closes it, even for auto-scans
    }

    // Find all elements containing text
    function findTextElements() {
        const selectors = [
            'p', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'li', 'td', 'th', 'label', 'article', 'section', 'blockquote'
        ];

        const elements = [];
        selectors.forEach(selector => {
            const nodes = document.querySelectorAll(selector);
            nodes.forEach(node => {
                // Only process elements with text content and no children with text
                if (node.textContent.trim() && 
                    node.children.length === 0 || 
                    !hasTextChildren(node)) {
                    elements.push(node);
                }
            });
        });

        return elements;
    }

    // Check if element has children with text
    function hasTextChildren(element) {
        return Array.from(element.children).some(child => 
            child.textContent.trim().length > 0
        );
    }

    // Scan a single element for grammar errors
    function scanElement(element) {
        if (!grammarChecker) {
            if (!initGrammarChecker()) {
                console.warn('Grammar checker not available yet');
                return;
            }
        }

        const text = element.textContent;
        if (!text || text.trim().length < 3) {
            return;
        }

        try {
            const errors = grammarChecker.checkText(text);
            
            if (errors.length > 0) {
                highlightErrors(element, errors, text);
            }
        } catch (error) {
            console.error('Error scanning element:', error);
        }
    }

    // Highlight errors in an element
    function highlightErrors(element, errors, originalText) {
        // Store original
        highlightedElements.push({
            element: element,
            originalText: originalText,
            errors: errors
        });

        // Create highlighted version
        let highlightedText = originalText;

        // Sort errors by index (descending) to maintain positions when replacing
        const sortedErrors = [...errors].sort((a, b) => b.index - a.index);

        sortedErrors.forEach(error => {
            const start = error.index;
            const end = start + error.length;
            const errorText = originalText.substring(start, end);
            
            // Create highlight span
            const highlightClass = error.severity === 'error' ? 'igc-error' : 'igc-warning';
            const replacement = `<span class="igc-highlight ${highlightClass}" 
                data-error-index="${start}" 
                data-error-message="${escapeHtml(error.message)}"
                title="${escapeHtml(error.message)}">${escapeHtml(errorText)}</span>`;
            
            highlightedText = highlightedText.substring(0, start) + 
                            replacement + 
                            highlightedText.substring(end);
        });

        // Update element
        element.innerHTML = highlightedText;
        element.classList.add('igc-highlighted');

        // Add click handlers to show error details
        element.querySelectorAll('.igc-highlight').forEach(highlight => {
            highlight.addEventListener('click', (e) => {
                e.stopPropagation();
                showErrorTooltip(e.target, highlight.dataset.errorMessage);
            });
        });
    }

    // Show error tooltip
    function showErrorTooltip(element, message) {
        // Remove existing tooltip
        const existing = document.getElementById('igc-tooltip');
        if (existing) {
            existing.remove();
        }

        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.id = 'igc-tooltip';
        tooltip.className = 'igc-tooltip';
        tooltip.textContent = message;
        
        document.body.appendChild(tooltip);

        // Position tooltip
        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + 'px';
        tooltip.style.top = (rect.top - tooltip.offsetHeight - 5) + 'px';

        // Remove tooltip after 3 seconds or on click
        setTimeout(() => {
            if (tooltip.parentNode) {
                tooltip.remove();
            }
        }, 3000);

        document.addEventListener('click', function removeTooltip() {
            if (tooltip.parentNode) {
                tooltip.remove();
            }
            document.removeEventListener('click', removeTooltip);
        }, { once: true });
    }

    // Show summary of errors found
    function showSummary() {
        // Don't show if user already dismissed it or if already shown
        if (summaryDismissed || summaryShown) {
            return;
        }

        // Mark as shown immediately to prevent multiple calls
        summaryShown = true;

        // Remove existing summary if any
        const existingSummary = document.getElementById('igc-summary');
        if (existingSummary) {
            existingSummary.remove();
        }

        const totalErrors = highlightedElements.reduce((sum, item) => 
            sum + (item.errors ? item.errors.length : 0), 0);
        
        const errorCount = highlightedElements.reduce((sum, item) => 
            sum + (item.errors ? item.errors.filter(e => e.severity === 'error').length : 0), 0);
        const warningCount = totalErrors - errorCount;

        const summary = document.createElement('div');
        summary.id = 'igc-summary';
        summary.className = 'igc-summary';
        
        // Build summary content
        let summaryContent = '<strong>Pemeriksa Tata Bahasa</strong><br>';
        summaryContent += '<span class="igc-scan-complete">✓ Scan selesai</span><br>';
        
        if (totalErrors === 0) {
            summaryContent += '<span class="igc-no-errors">Tidak ada kesalahan tata bahasa ditemukan</span>';
        } else {
            summaryContent += `Ditemukan: <strong>${errorCount}</strong> kesalahan, <strong>${warningCount}</strong> peringatan`;
        }
        
        summaryContent += '<button id="igc-close-summary" class="igc-close-btn" title="Tutup">×</button>';
        
        summary.innerHTML = `
            <div class="igc-summary-content">
                ${summaryContent}
            </div>
        `;

        document.body.appendChild(summary);

        // Function to close and dismiss summary
        const closeSummary = () => {
            summaryDismissed = true;
            summaryShown = true; // Also mark as shown to prevent re-showing
            summary.style.opacity = '0';
            setTimeout(() => {
                if (summary.parentNode) {
                    summary.remove();
                }
            }, 300);
        };

        // Close button - mark as dismissed
        summary.querySelector('#igc-close-summary').addEventListener('click', () => {
            // Clear auto-hide timeout if user closes manually
            if (summary.autoHideTimeout) {
                clearTimeout(summary.autoHideTimeout);
            }
            closeSummary();
        });

        // Auto-hide after 10 seconds
        summary.autoHideTimeout = setTimeout(() => {
            closeSummary();
        }, 30000); // 30 seconds
    }

    // Get full report of all errors
    function getFullReport() {
        const report = {
            totalErrors: 0,
            errorCount: 0,
            warningCount: 0,
            errors: [],
            warnings: [],
            byCategory: {}
        };

        // Ensure highlightedElements exists and is an array
        if (!highlightedElements || !Array.isArray(highlightedElements)) {
            return report;
        }

        highlightedElements.forEach((item, elementIndex) => {
            if (!item.errors || item.errors.length === 0) {
                return;
            }

            // Get element context (try to get parent element info)
            let elementContext = '';
            try {
                if (item.element) {
                    const tagName = item.element.tagName?.toLowerCase() || 'unknown';
                    const parent = item.element.parentElement;
                    const parentTag = parent?.tagName?.toLowerCase() || '';
                    elementContext = `${tagName}${parentTag ? ` dalam ${parentTag}` : ''}`;
                }
            } catch (e) {
                elementContext = 'element';
            }

            item.errors.forEach(error => {
                const errorText = item.originalText.substring(error.index, error.index + error.length);
                const contextBefore = item.originalText.substring(Math.max(0, error.index - 30), error.index);
                const contextAfter = item.originalText.substring(error.index + error.length, Math.min(item.originalText.length, error.index + error.length + 30));

                const errorData = {
                    text: errorText,
                    message: error.message,
                    severity: error.severity,
                    category: error.category || 'umum',
                    rule: error.rule || 'Aturan umum',
                    explanation: error.explanation || '',
                    suggestion: error.suggestion || '',
                    context: {
                        before: contextBefore.trim(),
                        after: contextAfter.trim(),
                        fullText: item.originalText.substring(0, 200) + (item.originalText.length > 200 ? '...' : '')
                    },
                    elementContext: elementContext,
                    position: error.index
                };

                if (error.severity === 'error') {
                    report.errors.push(errorData);
                    report.errorCount++;
                } else {
                    report.warnings.push(errorData);
                    report.warningCount++;
                }

                report.totalErrors++;

                // Group by category
                const category = error.category || 'umum';
                if (!report.byCategory[category]) {
                    report.byCategory[category] = {
                        errors: [],
                        warnings: []
                    };
                }
                if (error.severity === 'error') {
                    report.byCategory[category].errors.push(errorData);
                } else {
                    report.byCategory[category].warnings.push(errorData);
                }
            });
        });

        return report;
    }

    // Escape HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Initialize when DOM is ready
    function initializeExtension() {
        // Ensure grammar checker is initialized
        if (!grammarChecker && !initGrammarChecker()) {
            console.warn('Grammar checker not available, retrying...');
            setTimeout(initializeExtension, 200);
            return;
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            // Wait a bit to ensure DOM is fully ready
            setTimeout(init, 100);
        }
    }

    // Start initialization - grammar-checker.js should be loaded first via manifest
    // But we'll check anyway to be safe
    if (typeof IndonesianGrammarChecker !== 'undefined') {
        initializeExtension();
    } else {
        // Wait for grammar-checker.js to load (should be instant since it's in manifest)
        let retries = 0;
        const maxRetries = 10;
        const checkInterval = setInterval(() => {
            if (typeof IndonesianGrammarChecker !== 'undefined') {
                clearInterval(checkInterval);
                initializeExtension();
            } else if (retries >= maxRetries) {
                clearInterval(checkInterval);
                console.error('Failed to load IndonesianGrammarChecker after multiple attempts');
            }
            retries++;
        }, 100);
    }

    // Re-scan when page content changes (for dynamic pages)
    function setupObserver() {
        if (!document.body) {
            // Wait for body to be available
            setTimeout(setupObserver, 100);
            return;
        }

        const observer = new MutationObserver(() => {
            if (isActive && !isScanning) {
                // Debounce scanning
                clearTimeout(window.igcScanTimeout);
                window.igcScanTimeout = setTimeout(() => {
                    // Auto-scan from MutationObserver - don't show popup
                    // Pass false for both resetDismissed and isManualScan
                    startScanning(false, false);
                }, 1000);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }

    // Setup observer when DOM is ready
    if (document.body) {
        setupObserver();
    } else {
        document.addEventListener('DOMContentLoaded', setupObserver);
    }

})();
