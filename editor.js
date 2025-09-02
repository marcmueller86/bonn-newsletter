/**
 * Newsletter Editor for Stadt Bonn
 * WYSIWYG Editor with validation and template management
 */

class NewsletterEditor {
    constructor() {
        this.templates = new NewsletterTemplates();
        this.currentNewsletter = null;
        this.validationIssues = [];
        this.tags = {
            roles: [],
            departments: [],
            topics: []
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupContentEditable();
        this.loadDefaultTags();
        this.runInitialValidation();
    }

    setupEventListeners() {
        // File loading
        document.getElementById('newsletter-file').addEventListener('change', (e) => {
            this.loadNewsletterFile(e.target.files[0]);
        });

        // Template buttons
        document.querySelectorAll('.template-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const templateId = e.currentTarget.dataset.template;
                this.showTemplateModal(templateId);
            });
        });

        // Format buttons
        document.querySelectorAll('.format-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const command = e.currentTarget.dataset.command;
                this.executeFormatCommand(command);
            });
        });

        // Validation
        document.getElementById('validation-btn').addEventListener('click', () => {
            this.toggleValidationPanel();
        });

        // Preview
        document.getElementById('preview-btn').addEventListener('click', () => {
            this.showPreview();
        });

        // Export
        document.getElementById('export-btn').addEventListener('click', () => {
            this.exportHTML();
        });

        // Section selector
        document.getElementById('section-selector').addEventListener('change', (e) => {
            const section = e.target.value;
            if (section) {
                this.scrollToSection(section);
            }
        });

        // Add article button
        document.getElementById('add-article-btn').addEventListener('click', () => {
            this.addArticleToCurrentSection();
        });

        // Modal close buttons
        document.querySelectorAll('[data-close]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modalId = e.currentTarget.dataset.close;
                this.closeModal(modalId);
            });
        });

        // Template insertion
        document.getElementById('insert-template').addEventListener('click', () => {
            this.insertTemplate();
        });

        // Tag inputs
        this.setupTagInputs();

        // Source inputs
        this.setupSourceInputs();

        // Verification checkboxes
        this.setupVerificationListeners();

        // Content change detection
        document.getElementById('newsletter-editor').addEventListener('input', () => {
            this.onContentChange();
        });

        // Add item buttons (dynamic)
        document.addEventListener('click', (e) => {
            if (e.target.closest('.add-item-btn')) {
                const section = e.target.closest('.add-item-btn').dataset.section;
                this.addItemToSection(section);
            }
        });

        // Ampel selector changes
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('ampel-select')) {
                this.updateItemClassification(e.target);
            }
        });

        // Validation panel close
        document.getElementById('close-validation').addEventListener('click', () => {
            this.closeValidationPanel();
        });

        // Print preview
        document.getElementById('print-preview').addEventListener('click', () => {
            this.printPreview();
        });
    }

    setupContentEditable() {
        const editor = document.getElementById('newsletter-editor');
        
        // Enable rich text editing
        editor.addEventListener('keydown', (e) => {
            // Handle shortcuts
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'b':
                        e.preventDefault();
                        document.execCommand('bold');
                        break;
                    case 'i':
                        e.preventDefault();
                        document.execCommand('italic');
                        break;
                    case 'u':
                        e.preventDefault();
                        document.execCommand('underline');
                        break;
                    case 's':
                        e.preventDefault();
                        this.saveNewsletter();
                        break;
                }
            }
        });

        // Paste handling
        editor.addEventListener('paste', (e) => {
            e.preventDefault();
            const text = e.clipboardData.getData('text/plain');
            document.execCommand('insertText', false, text);
        });
    }

    setupTagInputs() {
        ['roles', 'departments', 'topics'].forEach(tagType => {
            const input = document.getElementById(`${tagType}-input`);
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.addTag(tagType, input.value.trim());
                    input.value = '';
                }
            });
        });
    }

    setupSourceInputs() {
        const sourceInputs = document.querySelectorAll('.source-input');
        sourceInputs.forEach(input => {
            input.addEventListener('change', () => {
                this.updateSourceData();
                this.runValidation();
            });
        });
    }

    setupVerificationListeners() {
        const checkboxes = document.querySelectorAll('.verification-checklist input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateVerificationStatus();
            });
        });

        document.getElementById('verification-comments').addEventListener('input', () => {
            this.updateVerificationStatus();
        });
    }

    // Tag Management
    addTag(type, value) {
        if (!value || this.tags[type].includes(value)) return;
        
        this.tags[type].push(value);
        this.renderTags(type);
        this.runValidation();
    }

    removeTag(type, value) {
        this.tags[type] = this.tags[type].filter(tag => tag !== value);
        this.renderTags(type);
    }

    renderTags(type) {
        const container = document.getElementById(`${type}-tags`);
        container.innerHTML = '';
        
        this.tags[type].forEach(tag => {
            const tagElement = document.createElement('div');
            tagElement.className = `tag-item ${type.slice(0, -1)}-tag`;
            tagElement.innerHTML = `
                ${tag}
                <span class="tag-remove" onclick="editor.removeTag('${type}', '${tag}')">×</span>
            `;
            container.appendChild(tagElement);
        });
    }

    loadDefaultTags() {
        this.tags.roles = ['Steuerberater', 'Kämmerer', 'Sachbearbeiter', 'Abteilungsleitung'];
        this.tags.departments = ['Steueramt', 'Finanzamt', 'Rechtsamt', 'Kämmerei'];
        this.tags.topics = ['Gewerbesteuer', 'Grundsteuer', 'Rechtsprechung', 'BMF-Schreiben'];
        
        Object.keys(this.tags).forEach(type => {
            this.renderTags(type);
        });
    }

    // File Operations
    loadNewsletterFile(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                if (file.name.endsWith('.json')) {
                    const data = JSON.parse(e.target.result);
                    this.loadNewsletterData(data);
                } else if (file.name.endsWith('.html')) {
                    this.loadHTMLContent(e.target.result);
                }
                this.runValidation();
            } catch (error) {
                this.showError('Fehler beim Laden der Datei: ' + error.message);
            }
        };
        reader.readAsText(file);
    }

    loadNewsletterData(data) {
        this.currentNewsletter = data;
        
        // Update editor content
        const editor = document.getElementById('newsletter-editor');
        
        // Load header information
        if (data.newsletter && data.newsletter.meta) {
            const meta = data.newsletter.meta;
            const headerTitle = editor.querySelector('.newsletter-header-placeholder h1');
            const headerSubtitle = editor.querySelector('.newsletter-header-placeholder p:first-of-type');
            const headerDate = editor.querySelector('.newsletter-header-placeholder p:last-of-type');
            
            if (headerTitle) headerTitle.textContent = meta.titel || '[NEWSLETTER TITEL]';
            if (headerSubtitle) headerSubtitle.textContent = '[NEWSLETTER UNTERTITEL]';
            if (headerDate) headerDate.textContent = meta.datum || '[DATUM]';
        }
        
        // Load sections
        if (data.newsletter && data.newsletter.aktuelle_entwicklungen) {
            this.loadSectionData('aktuelle_entwicklungen', data.newsletter.aktuelle_entwicklungen);
        }

        this.showSuccess('Newsletter erfolgreich geladen');
    }

    loadHTMLContent(html) {
        const editor = document.getElementById('newsletter-editor');
        
        // Parse HTML and extract content
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // Extract and set content
        const content = tempDiv.querySelector('.newsletter-content') || tempDiv;
        editor.innerHTML = content.innerHTML;
        
        this.showSuccess('HTML-Inhalt erfolgreich geladen');
    }

    // Template Management
    showTemplateModal(templateId) {
        const template = this.templates.getTemplate(templateId);
        if (!template) return;

        const modal = document.getElementById('template-modal');
        const previewContent = document.getElementById('template-preview-content');
        const formFields = document.getElementById('template-form-fields');

        // Set preview
        previewContent.innerHTML = `
            <h4>${template.name}</h4>
            <p><i class="${template.icon}"></i> ${template.description}</p>
        `;

        // Generate form
        formFields.innerHTML = this.templates.generateFormFields(templateId);
        
        // Store current template
        modal.dataset.templateId = templateId;
        
        this.showModal('template-modal');
    }

    insertTemplate() {
        const modal = document.getElementById('template-modal');
        const templateId = modal.dataset.templateId;
        
        if (!templateId) return;

        // Collect form data
        const formData = {};
        const form = document.getElementById('template-form-fields');
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            formData[input.name] = input.value;
        });

        // Add classification text
        if (formData.classification) {
            formData.classification_text = this.templates.getClassificationText(formData.classification);
        }

        // Validate data
        const validation = this.templates.validateTemplateData(templateId, formData);
        if (!validation.valid) {
            this.showError('Bitte füllen Sie alle Pflichtfelder aus:\n' + validation.errors.join('\n'));
            return;
        }

        try {
            // Render template
            const html = this.templates.renderTemplate(templateId, formData);
            
            // Insert into current section or at cursor
            this.insertHTMLAtCursor(html);
            
            this.closeModal('template-modal');
            this.showSuccess('Template erfolgreich eingefügt');
            this.runValidation();
        } catch (error) {
            this.showError('Fehler beim Einfügen des Templates: ' + error.message);
        }
    }

    insertHTMLAtCursor(html) {
        const selection = window.getSelection();
        const editor = document.getElementById('newsletter-editor');
        
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const container = range.commonAncestorContainer;
            
            // Find the appropriate section to insert into
            let targetSection = container.nodeType === 1 ? container : container.parentElement;
            while (targetSection && !targetSection.classList.contains('section-content')) {
                targetSection = targetSection.parentElement;
            }
            
            if (targetSection) {
                targetSection.insertAdjacentHTML('beforeend', html);
            } else {
                editor.insertAdjacentHTML('beforeend', html);
            }
        } else {
            editor.insertAdjacentHTML('beforeend', html);
        }
    }

    // Formatting Commands
    executeFormatCommand(command) {
        const editor = document.getElementById('newsletter-editor');
        editor.focus();
        
        switch(command) {
            case 'createLink':
                const url = prompt('URL eingeben:');
                if (url) {
                    document.execCommand(command, false, url);
                }
                break;
            default:
                document.execCommand(command, false, null);
        }
        
        this.updateFormatButtons();
    }

    updateFormatButtons() {
        document.querySelectorAll('.format-btn').forEach(btn => {
            const command = btn.dataset.command;
            const isActive = document.queryCommandState(command);
            btn.classList.toggle('active', isActive);
        });
    }

    // Section Management
    addItemToSection(sectionId) {
        const section = document.querySelector(`[data-section="${sectionId}"] .section-content`);
        if (!section) return;

        const template = this.getEmptyItemTemplate(sectionId);
        section.insertAdjacentHTML('beforeend', template);
        this.runValidation();
    }

    addArticleToCurrentSection() {
        const sectionSelector = document.getElementById('section-selector');
        const selectedSection = sectionSelector.value;
        
        if (!selectedSection) {
            this.showError('Bitte wählen Sie zuerst einen Bereich aus');
            return;
        }
        
        this.addItemToSection(selectedSection);
    }

    getEmptyItemTemplate(sectionId) {
        return `
            <div class="newsletter-item placeholder-item">
                <div class="item-header">
                    <h3 contenteditable="true" placeholder="Artikeltitel...">[DATEN ERFORDERLICH: Titel]</h3>
                    <div class="ampel-selector">
                        <select class="ampel-select">
                            <option value="pflicht" data-color="#dc3545">🔴 Pflicht</option>
                            <option value="bald" data-color="#ffc107">🟡 Bald</option>
                            <option value="radar" data-color="#28a745">🟢 Radar</option>
                        </select>
                    </div>
                </div>
                <div class="item-content" contenteditable="true" placeholder="Inhalt des Artikels...">
                    [DATEN ERFORDERLICH: Beschreibung]
                </div>
                <div class="item-metadata">
                    <div class="source-info">
                        <label>Quelle:</label>
                        <input type="text" placeholder="Quellenangabe..." class="source-field">
                    </div>
                    <div class="item-tags">
                        <div class="selected-tags"></div>
                    </div>
                </div>
            </div>
        `;
    }

    scrollToSection(sectionId) {
        const section = document.querySelector(`[data-section="${sectionId}"]`);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    updateItemClassification(selectElement) {
        const item = selectElement.closest('.newsletter-item');
        if (!item) return;

        const classification = selectElement.value;
        const color = selectElement.selectedOptions[0].dataset.color;
        
        // Update item class
        item.className = `newsletter-item ${classification}`;
        
        // Update border color
        item.style.borderLeftColor = color;
        
        this.runValidation();
    }

    // Validation
    runValidation() {
        this.validationIssues = [];
        
        this.validateRequiredData();
        this.validateSources();
        this.validateVerification();
        this.validateContent();
        
        this.updateValidationDisplay();
    }

    runInitialValidation() {
        // Run validation after a short delay to allow for DOM to be ready
        setTimeout(() => {
            this.runValidation();
        }, 500);
    }

    validateRequiredData() {
        const editor = document.getElementById('newsletter-editor');
        const placeholders = editor.querySelectorAll('*');
        
        placeholders.forEach(element => {
            const text = element.textContent || '';
            if (text.includes('[DATEN ERFORDERLICH')) {
                // Mark as requiring data
                if (!element.classList.contains('data-required')) {
                    element.classList.add('data-required');
                }
                
                this.validationIssues.push({
                    type: 'error',
                    message: `Fehlende Daten: ${text.substring(0, 100)}...`,
                    element: element
                });
            } else {
                element.classList.remove('data-required');
            }
        });
    }

    validateSources() {
        const sourceInputs = document.querySelectorAll('.source-field');
        sourceInputs.forEach(input => {
            if (!input.value.trim()) {
                this.validationIssues.push({
                    type: 'warning',
                    message: 'Quellenangabe fehlt',
                    element: input
                });
            }
        });
        
        // Check sidebar sources
        const primarySource = document.getElementById('primary-source').value;
        const secondarySource = document.getElementById('secondary-source').value;
        
        if (!primarySource) {
            this.validationIssues.push({
                type: 'error',
                message: 'Primärquelle erforderlich',
                element: document.getElementById('primary-source')
            });
        }
        
        if (!secondarySource) {
            this.validationIssues.push({
                type: 'warning',
                message: 'Sekundärquelle zur Bestätigung empfohlen',
                element: document.getElementById('secondary-source')
            });
        }
    }

    validateVerification() {
        const checkboxes = document.querySelectorAll('.verification-checklist input[type="checkbox"]');
        const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
        
        if (checkedCount === 0) {
            this.validationIssues.push({
                type: 'error',
                message: 'Keine Verifikationsschritte durchgeführt',
                element: document.querySelector('.verification-checklist')
            });
        } else if (checkedCount < checkboxes.length) {
            this.validationIssues.push({
                type: 'warning',
                message: `${checkboxes.length - checkedCount} Verifikationsschritte ausstehend`,
                element: document.querySelector('.verification-checklist')
            });
        }
    }

    validateContent() {
        const editor = document.getElementById('newsletter-editor');
        const content = editor.textContent.trim();
        
        if (content.length < 100) {
            this.validationIssues.push({
                type: 'warning',
                message: 'Newsletter-Inhalt sehr kurz',
                element: editor
            });
        }
        
        // Check for empty sections
        const sections = editor.querySelectorAll('.newsletter-section');
        sections.forEach(section => {
            const items = section.querySelectorAll('.newsletter-item');
            if (items.length === 0) {
                const sectionTitle = section.querySelector('h2').textContent;
                this.validationIssues.push({
                    type: 'info',
                    message: `Bereich "${sectionTitle}" ist leer`,
                    element: section
                });
            }
        });
    }

    updateValidationDisplay() {
        const validationBtn = document.getElementById('validation-btn');
        const validationCount = document.querySelector('.validation-count');
        
        const errorCount = this.validationIssues.filter(issue => issue.type === 'error').length;
        const warningCount = this.validationIssues.filter(issue => issue.type === 'warning').length;
        const totalIssues = errorCount + warningCount;
        
        validationCount.textContent = totalIssues;
        
        // Update button style based on issues
        validationBtn.className = 'btn';
        if (errorCount > 0) {
            validationBtn.classList.add('btn-warning');
        } else if (warningCount > 0) {
            validationBtn.classList.add('btn-secondary');
        } else {
            validationBtn.classList.add('btn-success');
        }
        
        // Update validation results
        this.updateValidationResults();
    }

    updateValidationResults() {
        const resultsContainer = document.getElementById('validation-results');
        
        if (this.validationIssues.length === 0) {
            resultsContainer.innerHTML = `
                <div class="validation-item info">
                    <i class="fas fa-check-circle"></i>
                    <span>Alle Validierungen bestanden!</span>
                </div>
            `;
            return;
        }
        
        resultsContainer.innerHTML = '';
        this.validationIssues.forEach(issue => {
            const issueElement = document.createElement('div');
            issueElement.className = `validation-item ${issue.type}`;
            
            let icon = 'fas fa-info-circle';
            if (issue.type === 'error') icon = 'fas fa-exclamation-circle';
            if (issue.type === 'warning') icon = 'fas fa-exclamation-triangle';
            
            issueElement.innerHTML = `
                <i class="${icon}"></i>
                <span>${issue.message}</span>
            `;
            
            // Add click handler to scroll to element
            if (issue.element) {
                issueElement.style.cursor = 'pointer';
                issueElement.addEventListener('click', () => {
                    issue.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    issue.element.focus();
                });
            }
            
            resultsContainer.appendChild(issueElement);
        });
    }

    toggleValidationPanel() {
        const panel = document.getElementById('validation-panel');
        panel.classList.toggle('active');
    }

    closeValidationPanel() {
        document.getElementById('validation-panel').classList.remove('active');
    }

    // Source Data Management
    updateSourceData() {
        // This would typically save to the newsletter data structure
        // For now, just trigger validation
        this.runValidation();
    }

    // Verification Status
    updateVerificationStatus() {
        const checkboxes = document.querySelectorAll('.verification-checklist input[type="checkbox"]');
        const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
        const totalCount = checkboxes.length;
        
        const statusIndicator = document.querySelector('.status-indicator');
        const statusContainer = document.getElementById('verification-status');
        
        // Remove existing classes
        statusContainer.className = 'verification-status';
        statusIndicator.className = 'status-indicator';
        
        if (checkedCount === 0) {
            statusContainer.classList.add('status-unverified');
            statusIndicator.classList.add('status-unverified');
            statusIndicator.innerHTML = '<i class="fas fa-exclamation-circle"></i> Nicht verifiziert';
        } else if (checkedCount < totalCount) {
            statusContainer.classList.add('status-partial');
            statusIndicator.classList.add('status-partial');
            statusIndicator.innerHTML = `<i class="fas fa-clock"></i> Teilweise verifiziert (${checkedCount}/${totalCount})`;
        } else {
            statusContainer.classList.add('status-verified');
            statusIndicator.classList.add('status-verified');
            statusIndicator.innerHTML = '<i class="fas fa-check-circle"></i> Vollständig verifiziert';
        }
        
        this.runValidation();
    }

    // Content Change Handler
    onContentChange() {
        // Debounce validation
        if (this.validationTimeout) {
            clearTimeout(this.validationTimeout);
        }
        this.validationTimeout = setTimeout(() => {
            this.runValidation();
        }, 1000);
    }

    // Modal Management
    showModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }

    // Preview Functionality
    showPreview() {
        const editor = document.getElementById('newsletter-editor');
        const content = editor.innerHTML;
        
        // Create full HTML document for preview
        const previewHTML = this.generatePreviewHTML(content);
        
        const iframe = document.getElementById('preview-frame');
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        
        iframeDoc.open();
        iframeDoc.write(previewHTML);
        iframeDoc.close();
        
        this.showModal('preview-modal');
    }

    generatePreviewHTML(content) {
        return `
            <!DOCTYPE html>
            <html lang="de">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Newsletter Vorschau</title>
                <link href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@300;400;600;700&display=swap" rel="stylesheet">
                <link rel="stylesheet" href="../styles/bonn-design-system.css">
                <style>
                    body { font-family: var(--font-primary); line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
                    .data-required { background: linear-gradient(120deg, #fef3c7 0%, #fde68a 100%); padding: 2px 4px; border-radius: 2px; color: #92400e; }
                </style>
            </head>
            <body>
                ${content}
            </body>
            </html>
        `;
    }

    printPreview() {
        const iframe = document.getElementById('preview-frame');
        iframe.contentWindow.print();
    }

    // Export Functionality
    exportHTML() {
        const editor = document.getElementById('newsletter-editor');
        const content = editor.innerHTML;
        
        // Generate complete newsletter HTML
        const fullHTML = this.generateFullHTML(content);
        
        // Create and download file
        const blob = new Blob([fullHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `newsletter-${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showSuccess('Newsletter erfolgreich exportiert');
    }

    generateFullHTML(content) {
        // This would integrate with the existing newsletter template
        // For now, return a simplified version
        return `
            <!DOCTYPE html>
            <html lang="de">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Newsletter - Stadt Bonn</title>
                <link href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@300;400;600;700&display=swap" rel="stylesheet">
                <style>
                    /* Include Bonn design system styles */
                    ${this.getBonnStyles()}
                </style>
            </head>
            <body>
                <div class="email-container">
                    ${content}
                </div>
            </body>
            </html>
        `;
    }

    getBonnStyles() {
        // This would fetch the actual Bonn styles
        // For now, return basic styles
        return `
            :root {
                --bonn-primary: #003366;
                --bonn-secondary: #0066CC;
                --font-primary: 'Source Sans Pro', Arial, sans-serif;
            }
            body { 
                font-family: var(--font-primary); 
                line-height: 1.6; 
                color: #333; 
                margin: 0; 
                padding: 20px; 
                background: #f8f9fa; 
            }
            .email-container { 
                max-width: 800px; 
                margin: 0 auto; 
                background: white; 
                border-radius: 8px; 
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .newsletter-item {
                background: #f8f9fa;
                border-radius: 4px;
                padding: 16px;
                margin-bottom: 12px;
                border-left: 4px solid #0066cc;
            }
            .newsletter-item.pflicht { border-left-color: #dc3545; }
            .newsletter-item.bald { border-left-color: #ffc107; }
            .newsletter-item.radar { border-left-color: #28a745; }
        `;
    }

    // Utility Methods
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        // Create a simple notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#d4edda' : '#f8d7da'};
            color: ${type === 'success' ? '#155724' : '#721c24'};
            padding: 12px 20px;
            border-radius: 4px;
            border: 1px solid ${type === 'success' ? '#c3e6cb' : '#f1b0b7'};
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 8px;
            max-width: 400px;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    saveNewsletter() {
        // This would implement saving functionality
        this.showSuccess('Newsletter gespeichert (Funktion in Entwicklung)');
    }
}

// Initialize editor when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.editor = new NewsletterEditor();
});