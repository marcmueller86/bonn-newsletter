/**
 * Updated Newsletter Editor for Stadt Bonn
 * Angepasst an die neue Struktur: Öffentlicher Newsletter und Internes Dokument
 */

class UpdatedNewsletterEditor {
    constructor() {
        this.currentDocument = null;
        this.documentType = null; // 'public' oder 'internal'
        this.validationIssues = [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupContentEditable();
    }

    setupEventListeners() {
        // File loading
        document.getElementById('newsletter-file').addEventListener('change', (e) => {
            this.loadFile(e.target.files[0]);
        });

        // Format buttons
        document.querySelectorAll('.format-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const command = e.currentTarget.dataset.command;
                this.executeCommand(command);
            });
        });

        // Preview
        document.getElementById('preview-btn').addEventListener('click', () => {
            this.showPreview();
        });

        // Export
        document.getElementById('export-btn').addEventListener('click', () => {
            this.exportDocument();
        });

        // Print
        document.getElementById('print-preview').addEventListener('click', () => {
            this.printPreview();
        });

        // Fact-check
        document.getElementById('fact-check-btn').addEventListener('click', () => {
            this.showFactCheckModal();
        });

        document.getElementById('run-fact-check').addEventListener('click', () => {
            this.runFactCheck();
        });

        // Validation
        document.getElementById('validation-btn').addEventListener('click', () => {
            this.toggleValidationPanel();
        });

        document.getElementById('close-validation').addEventListener('click', () => {
            this.closeValidationPanel();
        });

        // Modal close buttons
        document.querySelectorAll('[data-close]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modalId = e.currentTarget.dataset.close;
                this.closeModal(modalId);
            });
        });
    }

    setupContentEditable() {
        const editor = document.getElementById('newsletter-editor');
        
        // Auto-save on change
        let saveTimeout;
        editor.addEventListener('input', () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                this.autoSave();
                this.runValidation();
            }, 1000);
        });

        // Handle paste to strip formatting
        editor.addEventListener('paste', (e) => {
            e.preventDefault();
            const text = (e.clipboardData || window.clipboardData).getData('text/plain');
            document.execCommand('insertText', false, text);
        });
    }

    async loadFile(file) {
        if (!file) return;

        const content = await file.text();
        const editor = document.getElementById('newsletter-editor');
        
        // Detect document type
        this.detectDocumentType(content, file.name);
        
        // Load content
        editor.innerHTML = content;
        this.currentDocument = content;
        
        // Update UI
        this.updateDocumentInfo();
        this.runValidation();
        
        // Show/hide sidebar based on document type
        const sidebar = document.getElementById('editor-sidebar');
        if (this.documentType === 'internal') {
            sidebar.style.display = 'block';
        } else {
            sidebar.style.display = 'none';
        }
    }

    detectDocumentType(content, filename) {
        // Check filename
        if (filename.toLowerCase().includes('intern')) {
            this.documentType = 'internal';
        } else if (content.includes('INTERNES DOKUMENT')) {
            this.documentType = 'internal';
        } else {
            this.documentType = 'public';
        }
    }

    updateDocumentInfo() {
        const typeIndicator = document.getElementById('current-document-type');
        const infoText = document.getElementById('document-info-text');
        const contentStatus = document.getElementById('content-status');
        
        if (this.documentType === 'public') {
            typeIndicator.innerHTML = '<i class="fas fa-globe"></i> Öffentlicher Newsletter';
            typeIndicator.className = 'document-type-badge public';
            infoText.textContent = 'Öffentlicher Newsletter - Nur Gesetzesänderungen und Quellenverzeichnis';
            contentStatus.textContent = 'Öffentlicher Newsletter geladen';
        } else {
            typeIndicator.innerHTML = '<i class="fas fa-lock"></i> Internes Dokument';
            typeIndicator.className = 'document-type-badge internal';
            infoText.textContent = 'Internes Dokument - Fokuspunkte, TCMS-Daten und Handlungsempfehlungen';
            contentStatus.textContent = 'Internes Dokument geladen';
        }
    }

    executeCommand(command) {
        if (command === 'createLink') {
            const url = prompt('URL eingeben:');
            if (url) {
                document.execCommand(command, false, url);
            }
        } else {
            document.execCommand(command, false, null);
        }
    }

    showPreview() {
        const modal = document.getElementById('preview-modal');
        const frame = document.getElementById('preview-frame');
        const editor = document.getElementById('newsletter-editor');
        
        // Create preview HTML
        const previewHtml = this.createPreviewHtml(editor.innerHTML);
        
        // Load into iframe
        frame.srcdoc = previewHtml;
        
        // Show modal
        modal.classList.add('active');
    }

    createPreviewHtml(content) {
        return `
            <!DOCTYPE html>
            <html lang="de">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Vorschau</title>
                <style>
                    body { 
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                        line-height: 1.6;
                        color: #333;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    @media print {
                        body { max-width: 100%; }
                    }
                </style>
            </head>
            <body>
                ${content}
            </body>
            </html>
        `;
    }

    exportDocument() {
        const editor = document.getElementById('newsletter-editor');
        const content = editor.innerHTML;
        
        // Clean up content
        const cleanContent = this.cleanHtmlForExport(content);
        
        // Create full HTML document
        const fullHtml = this.createFullHtmlDocument(cleanContent);
        
        // Download
        const filename = this.documentType === 'public' 
            ? `Newsletter-${this.getCurrentMonth()}-${new Date().getFullYear()}.html`
            : `INTERNES-${this.getCurrentMonth()}-${new Date().getFullYear()}.html`;
            
        this.downloadHtml(fullHtml, filename);
    }

    cleanHtmlForExport(html) {
        // Remove contenteditable attributes
        const cleaned = html.replace(/\scontenteditable="[^"]*"/g, '');
        
        // Remove empty placeholder elements
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = cleaned;
        
        // Remove placeholder content
        tempDiv.querySelectorAll('.placeholder-content').forEach(el => el.remove());
        
        return tempDiv.innerHTML;
    }

    createFullHtmlDocument(content) {
        const isPublic = this.documentType === 'public';
        const title = isPublic ? 'Steuer-Update Bonn' : 'INTERNES DOKUMENT - Steuer-Update';
        
        return `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        ${this.getExportStyles()}
    </style>
</head>
<body>
    ${content}
</body>
</html>`;
    }

    getExportStyles() {
        // Return the appropriate styles based on document type
        if (this.documentType === 'public') {
            return this.getPublicNewsletterStyles();
        } else {
            return this.getInternalDocumentStyles();
        }
    }

    getPublicNewsletterStyles() {
        return `
        :root {
            --bonn-blue: #003366;
            --bonn-light-blue: #0066CC;
            --text-primary: #333333;
            --text-secondary: #666666;
            --background: #FAFAFA;
            --white: #FFFFFF;
            --border: #E0E0E0;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: var(--background);
            color: var(--text-primary);
            line-height: 1.6;
        }

        .newsletter-container {
            max-width: 800px;
            margin: 0 auto;
            background: var(--white);
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .header {
            background: linear-gradient(135deg, var(--bonn-blue), var(--bonn-light-blue));
            color: var(--white);
            padding: 40px;
            text-align: center;
        }

        .content {
            padding: 40px;
        }

        .section {
            margin-bottom: 50px;
        }

        .section-title {
            color: var(--bonn-blue);
            font-size: 1.8em;
            margin-bottom: 25px;
            padding-bottom: 10px;
            border-bottom: 2px solid var(--bonn-light-blue);
        }

        .item {
            margin-bottom: 30px;
            padding: 20px;
            background: #F8F9FA;
            border-radius: 8px;
            border-left: 4px solid var(--bonn-light-blue);
        }

        @media print {
            .newsletter-container {
                box-shadow: none;
            }
        }`;
    }

    getInternalDocumentStyles() {
        return `
        :root {
            --bonn-blue: #003366;
            --bonn-light-blue: #0066CC;
            --bonn-gold: #FFD700;
            --text-primary: #333333;
            --text-secondary: #666666;
            --background: #FAFAFA;
            --white: #FFFFFF;
            --success: #28A745;
            --warning: #FFC107;
            --danger: #DC3545;
            --border: #E0E0E0;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: var(--background);
            color: var(--text-primary);
            line-height: 1.6;
        }

        .internal-header {
            background: var(--danger);
            color: var(--white);
            padding: 20px;
            text-align: center;
            font-weight: bold;
            font-size: 1.2em;
        }

        .document-container {
            max-width: 900px;
            margin: 0 auto;
            background: var(--white);
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        @media print {
            .internal-header {
                background: var(--danger) !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
        }`;
    }

    downloadHtml(content, filename) {
        const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    getCurrentMonth() {
        const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 
                       'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
        return months[new Date().getMonth()];
    }

    printPreview() {
        const frame = document.getElementById('preview-frame');
        frame.contentWindow.print();
    }

    runValidation() {
        this.validationIssues = [];
        const editor = document.getElementById('newsletter-editor');
        const content = editor.textContent;
        
        // Check for placeholder text
        if (content.includes('[') && content.includes(']')) {
            this.validationIssues.push({
                type: 'warning',
                message: 'Dokument enthält noch Platzhalter-Text'
            });
        }
        
        // Check for VERIFY markers
        if (content.includes('VERIFY')) {
            this.validationIssues.push({
                type: 'error',
                message: 'Dokument enthält ungeprüfte Daten (VERIFY-Markierungen)'
            });
        }
        
        // Update validation button
        const validationBtn = document.getElementById('validation-btn');
        const validationCount = validationBtn.querySelector('.validation-count');
        validationCount.textContent = this.validationIssues.length;
        
        if (this.validationIssues.length > 0) {
            validationBtn.classList.add('has-issues');
        } else {
            validationBtn.classList.remove('has-issues');
        }
    }

    toggleValidationPanel() {
        const panel = document.getElementById('validation-panel');
        const results = document.getElementById('validation-results');
        
        if (panel.classList.contains('active')) {
            this.closeValidationPanel();
        } else {
            // Show validation results
            results.innerHTML = this.validationIssues.map(issue => `
                <div class="validation-issue ${issue.type}">
                    <i class="fas fa-${issue.type === 'error' ? 'times-circle' : 'exclamation-triangle'}"></i>
                    ${issue.message}
                </div>
            `).join('');
            
            panel.classList.add('active');
        }
    }

    closeValidationPanel() {
        const panel = document.getElementById('validation-panel');
        panel.classList.remove('active');
    }

    showFactCheckModal() {
        const modal = document.getElementById('fact-check-modal');
        modal.classList.add('active');
    }

    async runFactCheck() {
        const results = document.getElementById('fact-check-results');
        const editor = document.getElementById('newsletter-editor');
        
        results.innerHTML = '<div class="fact-check-loading"><i class="fas fa-spinner fa-spin"></i> Fact-Check läuft...</div>';
        
        // Simulate fact check
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Analyze content
        const content = editor.textContent;
        const issues = [];
        
        // Check for numbers without sources
        const numberMatches = content.match(/\d+(?:\.\d+)?(?:\s*%|\s*EUR|\s*€|\s*Mio\.|Million)/g);
        if (numberMatches) {
            issues.push({
                type: 'warning',
                title: 'Zahlen gefunden',
                description: `${numberMatches.length} Zahlenangaben gefunden. Bitte Quellen prüfen.`,
                details: numberMatches.slice(0, 5).join(', ') + (numberMatches.length > 5 ? '...' : '')
            });
        }
        
        // Check for VERIFY markers
        if (content.includes('VERIFY')) {
            issues.push({
                type: 'error',
                title: 'Ungeprüfte Daten',
                description: 'Dokument enthält VERIFY-Markierungen für ungeprüfte Daten.'
            });
        }
        
        // Check for missing sources
        if (!content.includes('Quelle:')) {
            issues.push({
                type: 'error',
                title: 'Keine Quellenangaben',
                description: 'Dokument enthält keine Quellenangaben.'
            });
        }
        
        // Display results
        if (issues.length === 0) {
            results.innerHTML = `
                <div class="fact-check-success">
                    <i class="fas fa-check-circle"></i>
                    <h4>Fact-Check bestanden</h4>
                    <p>Keine Probleme gefunden.</p>
                </div>
            `;
        } else {
            results.innerHTML = `
                <div class="fact-check-issues">
                    <h4>Fact-Check Ergebnisse</h4>
                    ${issues.map(issue => `
                        <div class="fact-check-issue ${issue.type}">
                            <div class="issue-header">
                                <i class="fas fa-${issue.type === 'error' ? 'times-circle' : 'exclamation-triangle'}"></i>
                                <strong>${issue.title}</strong>
                            </div>
                            <p>${issue.description}</p>
                            ${issue.details ? `<div class="issue-details">${issue.details}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('active');
    }

    autoSave() {
        // Store current content in localStorage
        const editor = document.getElementById('newsletter-editor');
        localStorage.setItem('newsletter-editor-content', editor.innerHTML);
        localStorage.setItem('newsletter-editor-type', this.documentType);
    }
}

// Initialize editor when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.newsletterEditor = new UpdatedNewsletterEditor();
});