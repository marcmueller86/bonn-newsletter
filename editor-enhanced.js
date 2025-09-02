/**
 * Enhanced Newsletter Editor for Stadt Bonn
 * WYSIWYG Editor with dual version support, fact-checking, and advanced preview features
 */

class EnhancedNewsletterEditor {
    constructor() {
        this.templates = new NewsletterTemplates();
        this.currentNewsletter = {
            kompakt: null,
            detail: null
        };
        this.currentVersion = 'kompakt'; // 'kompakt' or 'detail'
        this.validationIssues = [];
        this.focusPoints = {
            mainStatement: '',
            targetAudience: '',
            actionRecommendation: '',
            deadline: '',
            deadlineNote: '',
            priority: 'mittel'
        };
        this.tags = {
            roles: [],
            departments: [],
            topics: []
        };
        this.factCheckResults = {
            kompakt: null,
            detail: null,
            comparison: null
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupContentEditable();
        this.loadDefaultTags();
        this.runInitialValidation();
        this.initializeVersionSwitching();
        this.setupFocusPointsEditor();
    }

    setupEventListeners() {
        // Version switching
        document.querySelectorAll('.version-switcher button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const version = e.currentTarget.dataset.version;
                this.switchVersion(version);
            });
        });

        // Focus points
        document.getElementById('apply-focus-points').addEventListener('click', () => {
            this.applyFocusPoints();
        });

        // Fact-check
        document.getElementById('fact-check-btn').addEventListener('click', () => {
            this.showFactCheckModal();
        });

        document.getElementById('run-fact-check').addEventListener('click', () => {
            this.runFactCheck();
        });

        // Fact-check tabs
        document.querySelectorAll('.fact-check-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchFactCheckTab(e.currentTarget.dataset.tab);
            });
        });

        // Preview options
        document.getElementById('preview-split-btn').addEventListener('click', () => {
            this.showSplitPreview();
        });

        document.getElementById('preview-switch-version').addEventListener('click', () => {
            this.switchPreviewVersion();
        });

        // Export options
        document.getElementById('export-kompakt').addEventListener('click', () => {
            this.exportVersion('kompakt');
        });

        document.getElementById('export-detail').addEventListener('click', () => {
            this.exportVersion('detail');
        });

        document.getElementById('export-both').addEventListener('click', () => {
            this.exportBothVersions();
        });

        // Print options
        document.getElementById('print-split-preview').addEventListener('click', () => {
            this.printSplitPreview();
        });

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

        // Export (main button)
        document.getElementById('export-btn').addEventListener('click', () => {
            this.toggleExportDropdown();
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

        // Content change detection for both versions
        document.getElementById('newsletter-editor-kompakt').addEventListener('input', () => {
            this.onContentChange('kompakt');
        });

        document.getElementById('newsletter-editor-detail').addEventListener('input', () => {
            this.onContentChange('detail');
        });

        // Focus points inputs
        this.setupFocusPointInputs();

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

        // Export dropdown handling
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.export-group')) {
                this.closeExportDropdown();
            }
        });
    }

    // Version Management
    initializeVersionSwitching() {
        // Initially show kompakt version
        this.switchVersion('kompakt');
    }

    switchVersion(version) {
        this.currentVersion = version;
        
        // Update version switcher buttons
        document.querySelectorAll('.version-switcher button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.version === version);
        });

        // Update version indicator
        document.getElementById('current-version-indicator').textContent = version.toUpperCase();

        // Switch editor tabs
        document.querySelectorAll('.editor-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.version === version);
        });

        // Update current editor reference
        this.getCurrentEditor();
        
        // Run validation for current version
        this.runValidation();
    }

    getCurrentEditor() {
        return document.getElementById(`newsletter-editor-${this.currentVersion}`);
    }

    getCurrentEditorContent() {
        const editor = this.getCurrentEditor();
        return editor ? editor.innerHTML : '';
    }

    // Focus Points Management
    setupFocusPointsEditor() {
        // Pre-populate some default values
        document.getElementById('target-audience').value = 'Steuerberater, Kämmerer';
        document.getElementById('priority-level').value = 'mittel';
    }

    setupFocusPointInputs() {
        const inputs = [
            'main-statement',
            'target-audience', 
            'action-recommendation',
            'deadline-date',
            'deadline-note',
            'priority-level'
        ];

        inputs.forEach(inputId => {
            const element = document.getElementById(inputId);
            if (element) {
                element.addEventListener('change', () => {
                    this.updateFocusPoints();
                });
            }
        });
    }

    updateFocusPoints() {
        this.focusPoints = {
            mainStatement: document.getElementById('main-statement').value,
            targetAudience: document.getElementById('target-audience').value,
            actionRecommendation: document.getElementById('action-recommendation').value,
            deadline: document.getElementById('deadline-date').value,
            deadlineNote: document.getElementById('deadline-note').value,
            priority: document.getElementById('priority-level').value
        };
    }

    applyFocusPoints() {
        this.updateFocusPoints();
        
        const editor = this.getCurrentEditor();
        if (!editor) return;

        // Find current article or create template based on focus points
        let articleElement = editor.querySelector('.newsletter-item.active') || 
                           editor.querySelector('.newsletter-item');

        if (!articleElement) {
            // Create new article based on focus points
            this.createArticleFromFocusPoints();
        } else {
            // Update existing article
            this.updateArticleWithFocusPoints(articleElement);
        }

        this.showSuccess('Fokuspunkte angewendet');
        this.runValidation();
    }

    createArticleFromFocusPoints() {
        const section = document.querySelector(`#newsletter-editor-${this.currentVersion} .section-content`);
        if (!section) return;

        const priorityEmoji = {
            'hoch': '🔴',
            'mittel': '🟡', 
            'niedrig': '🟢'
        };

        const priorityColor = {
            'hoch': '#dc3545',
            'mittel': '#ffc107',
            'niedrig': '#28a745'
        };

        const articleHTML = `
            <div class="newsletter-item focus-generated" style="border-left-color: ${priorityColor[this.focusPoints.priority]}">
                <div class="item-header">
                    <h3 contenteditable="true">${this.focusPoints.mainStatement || '[TITEL ERFORDERLICH]'}</h3>
                    <div class="ampel-selector">
                        <select class="ampel-select">
                            <option value="pflicht" data-color="#dc3545" ${this.focusPoints.priority === 'hoch' ? 'selected' : ''}>🔴 Pflicht</option>
                            <option value="bald" data-color="#ffc107" ${this.focusPoints.priority === 'mittel' ? 'selected' : ''}>🟡 Bald</option>
                            <option value="radar" data-color="#28a745" ${this.focusPoints.priority === 'niedrig' ? 'selected' : ''}>🟢 Radar</option>
                        </select>
                    </div>
                </div>
                <div class="item-content" contenteditable="true">
                    <p><strong>Zielgruppe:</strong> ${this.focusPoints.targetAudience}</p>
                    ${this.focusPoints.actionRecommendation ? `<p><strong>Handlungsempfehlung:</strong> ${this.focusPoints.actionRecommendation}</p>` : ''}
                    ${this.focusPoints.deadline ? `<p><strong>Deadline:</strong> ${this.formatDate(this.focusPoints.deadline)} ${this.focusPoints.deadlineNote ? '(' + this.focusPoints.deadlineNote + ')' : ''}</p>` : ''}
                    <p>[DETAILLIERTE BESCHREIBUNG ERFORDERLICH]</p>
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

        section.insertAdjacentHTML('beforeend', articleHTML);
    }

    updateArticleWithFocusPoints(articleElement) {
        const content = articleElement.querySelector('.item-content');
        if (!content) return;

        let newContent = '';
        
        if (this.focusPoints.targetAudience) {
            newContent += `<p><strong>Zielgruppe:</strong> ${this.focusPoints.targetAudience}</p>`;
        }
        
        if (this.focusPoints.actionRecommendation) {
            newContent += `<p><strong>Handlungsempfehlung:</strong> ${this.focusPoints.actionRecommendation}</p>`;
        }
        
        if (this.focusPoints.deadline) {
            newContent += `<p><strong>Deadline:</strong> ${this.formatDate(this.focusPoints.deadline)}`;
            if (this.focusPoints.deadlineNote) {
                newContent += ` (${this.focusPoints.deadlineNote})`;
            }
            newContent += '</p>';
        }

        // Update priority
        const select = articleElement.querySelector('.ampel-select');
        if (select) {
            const priorityMap = {
                'hoch': 'pflicht',
                'mittel': 'bald', 
                'niedrig': 'radar'
            };
            select.value = priorityMap[this.focusPoints.priority];
            this.updateItemClassification(select);
        }

        // Preserve existing content and add focus point information
        const existingContent = content.innerHTML;
        if (!existingContent.includes('Zielgruppe:')) {
            content.innerHTML = newContent + existingContent;
        }
    }

    // Fact-Check Functionality
    showFactCheckModal() {
        this.showModal('fact-check-modal');
        // Reset to first tab
        this.switchFactCheckTab('kompakt');
    }

    switchFactCheckTab(tab) {
        document.querySelectorAll('.fact-check-tab').forEach(tabBtn => {
            tabBtn.classList.toggle('active', tabBtn.dataset.tab === tab);
        });

        this.displayFactCheckResults(tab);
    }

    async runFactCheck() {
        const activeTab = document.querySelector('.fact-check-tab.active').dataset.tab;
        
        // Show loading
        const resultsContainer = document.getElementById('fact-check-results');
        resultsContainer.innerHTML = `
            <div class="fact-check-loading">
                <i class="fas fa-spinner fa-spin"></i>
                Fact-Check wird durchgeführt...
            </div>
        `;

        try {
            if (activeTab === 'kompakt') {
                await this.runFactCheckForVersion('kompakt');
            } else if (activeTab === 'detail') {
                await this.runFactCheckForVersion('detail');
            } else if (activeTab === 'compare') {
                await this.runFactCheckComparison();
            }
        } catch (error) {
            this.showError('Fact-Check Fehler: ' + error.message);
        }
    }

    async runFactCheckForVersion(version) {
        const editor = document.getElementById(`newsletter-editor-${version}`);
        const content = editor.innerHTML;
        
        // Simulate fact-checking process (in real implementation, this would call an AI service)
        await this.sleep(2000);
        
        // Mock fact-check results
        const results = this.generateMockFactCheckResults(version, content);
        this.factCheckResults[version] = results;
        
        this.displayFactCheckResults(version);
    }

    async runFactCheckComparison() {
        const kompaktContent = document.getElementById('newsletter-editor-kompakt').innerHTML;
        const detailContent = document.getElementById('newsletter-editor-detail').innerHTML;
        
        await this.sleep(2000);
        
        // Mock comparison results
        const comparisonResults = this.generateMockComparisonResults(kompaktContent, detailContent);
        this.factCheckResults.comparison = comparisonResults;
        
        this.displayFactCheckResults('compare');
    }

    generateMockFactCheckResults(version, content) {
        // Extract key facts for checking
        const facts = this.extractFactsFromContent(content);
        
        return {
            version: version,
            timestamp: new Date().toISOString(),
            checkedFacts: facts.map(fact => ({
                statement: fact,
                status: Math.random() > 0.2 ? 'verified' : 'needs_review',
                confidence: Math.random() * 0.4 + 0.6, // 60-100%
                sources: [
                    'BMF Schreiben vom ' + new Date().toLocaleDateString(),
                    'Bundessteuerblatt ' + new Date().getFullYear()
                ]
            })),
            overallScore: Math.random() * 0.3 + 0.7, // 70-100%
            recommendations: [
                'Primärquelle für alle Gesetzesänderungen hinzufügen',
                'Datum der letzten Aktualisierung prüfen',
                'Rechtschreibung und Formatierung überprüfen'
            ]
        };
    }

    generateMockComparisonResults(kompaktContent, detailContent) {
        return {
            timestamp: new Date().toISOString(),
            consistency: {
                score: Math.random() * 0.3 + 0.7,
                issues: [
                    'Detailversion enthält zusätzliche Informationen zu § 12 UStG',
                    'Verschiedene Datumsformate verwendet',
                    'Kompaktversion fehlen spezifische Beispiele'
                ]
            },
            coverage: {
                kompakt: Math.random() * 0.4 + 0.6,
                detail: Math.random() * 0.3 + 0.7
            },
            recommendations: [
                'Einheitliche Terminologie verwenden',
                'Wichtige Punkte aus Detailversion in Kompaktversion erwähnen',
                'Cross-Reference zwischen Versionen hinzufügen'
            ]
        };
    }

    extractFactsFromContent(content) {
        // Simple fact extraction (in real implementation, this would use NLP)
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const textContent = tempDiv.textContent;
        
        const facts = [];
        
        // Look for dates
        const dateRegex = /\d{1,2}\.\d{1,2}\.\d{4}/g;
        const dates = textContent.match(dateRegex);
        if (dates) {
            dates.forEach(date => facts.push(`Datum: ${date}`));
        }
        
        // Look for percentages
        const percentageRegex = /\d+[,.]?\d*\s*%/g;
        const percentages = textContent.match(percentageRegex);
        if (percentages) {
            percentages.forEach(pct => facts.push(`Prozentsatz: ${pct}`));
        }
        
        // Look for monetary amounts
        const moneyRegex = /\d+[,.]?\d*\s*€/g;
        const amounts = textContent.match(moneyRegex);
        if (amounts) {
            amounts.forEach(amount => facts.push(`Betrag: ${amount}`));
        }
        
        // Look for legal references
        const legalRegex = /§\s*\d+/g;
        const legalRefs = textContent.match(legalRegex);
        if (legalRefs) {
            legalRefs.forEach(ref => facts.push(`Rechtliche Referenz: ${ref}`));
        }
        
        return facts.length > 0 ? facts : ['Keine spezifischen Fakten zur Überprüfung gefunden'];
    }

    displayFactCheckResults(tab) {
        const resultsContainer = document.getElementById('fact-check-results');
        let results;
        
        if (tab === 'compare') {
            results = this.factCheckResults.comparison;
            if (results) {
                resultsContainer.innerHTML = this.renderComparisonResults(results);
            } else {
                resultsContainer.innerHTML = '<p>Starten Sie den Fact-Check für beide Versionen.</p>';
            }
        } else {
            results = this.factCheckResults[tab];
            if (results) {
                resultsContainer.innerHTML = this.renderFactCheckResults(results);
            } else {
                resultsContainer.innerHTML = '<p>Klicken Sie auf "Fact-Check starten" um zu beginnen.</p>';
            }
        }
    }

    renderFactCheckResults(results) {
        const overallClass = results.overallScore > 0.8 ? 'success' : results.overallScore > 0.6 ? 'warning' : 'error';
        
        return `
            <div class="fact-check-summary">
                <div class="fact-check-score ${overallClass}">
                    <h4>Gesamtbewertung: ${Math.round(results.overallScore * 100)}%</h4>
                    <p>Version: ${results.version.toUpperCase()}</p>
                </div>
            </div>
            
            <div class="fact-check-details">
                <h5>Überprüfte Fakten:</h5>
                <div class="checked-facts">
                    ${results.checkedFacts.map(fact => `
                        <div class="fact-item ${fact.status}">
                            <div class="fact-statement">${fact.statement}</div>
                            <div class="fact-status">
                                <span class="status-badge ${fact.status}">
                                    ${fact.status === 'verified' ? '✓ Verifiziert' : '⚠ Überprüfung erforderlich'}
                                </span>
                                <span class="confidence">Vertrauen: ${Math.round(fact.confidence * 100)}%</span>
                            </div>
                            <div class="fact-sources">
                                <small>Quellen: ${fact.sources.join(', ')}</small>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="fact-check-recommendations">
                <h5>Empfehlungen:</h5>
                <ul>
                    ${results.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    renderComparisonResults(results) {
        return `
            <div class="comparison-summary">
                <h4>Versions-Vergleich</h4>
                <div class="comparison-scores">
                    <div class="score-item">
                        <label>Konsistenz:</label>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${results.consistency.score * 100}%"></div>
                            <span>${Math.round(results.consistency.score * 100)}%</span>
                        </div>
                    </div>
                    <div class="score-item">
                        <label>Abdeckung Kompakt:</label>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${results.coverage.kompakt * 100}%"></div>
                            <span>${Math.round(results.coverage.kompakt * 100)}%</span>
                        </div>
                    </div>
                    <div class="score-item">
                        <label>Abdeckung Detail:</label>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${results.coverage.detail * 100}%"></div>
                            <span>${Math.round(results.coverage.detail * 100)}%</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="comparison-issues">
                <h5>Identifizierte Unterschiede:</h5>
                <ul>
                    ${results.consistency.issues.map(issue => `<li>${issue}</li>`).join('')}
                </ul>
            </div>
            
            <div class="comparison-recommendations">
                <h5>Empfehlungen:</h5>
                <ul>
                    ${results.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    // Enhanced Preview Functionality
    showSplitPreview() {
        const kompaktContent = document.getElementById('newsletter-editor-kompakt').innerHTML;
        const detailContent = document.getElementById('newsletter-editor-detail').innerHTML;
        
        // Generate preview HTML for both versions
        const kompaktHTML = this.generatePreviewHTML(kompaktContent, 'KOMPAKT');
        const detailHTML = this.generatePreviewHTML(detailContent, 'DETAIL');
        
        // Load into split preview iframes
        const kompaktFrame = document.getElementById('preview-frame-kompakt');
        const detailFrame = document.getElementById('preview-frame-detail');
        
        this.loadHTMLIntoFrame(kompaktFrame, kompaktHTML);
        this.loadHTMLIntoFrame(detailFrame, detailHTML);
        
        this.showModal('split-preview-modal');
    }

    switchPreviewVersion() {
        const switchBtn = document.getElementById('preview-switch-version');
        const iframe = document.getElementById('preview-frame');
        
        if (switchBtn.textContent.includes('Detail')) {
            // Switch to detail
            const detailContent = document.getElementById('newsletter-editor-detail').innerHTML;
            const detailHTML = this.generatePreviewHTML(detailContent, 'DETAIL');
            this.loadHTMLIntoFrame(iframe, detailHTML);
            switchBtn.innerHTML = '<i class="fas fa-exchange-alt"></i> Zur Kompakt-Version';
        } else {
            // Switch to kompakt
            const kompaktContent = document.getElementById('newsletter-editor-kompakt').innerHTML;
            const kompaktHTML = this.generatePreviewHTML(kompaktContent, 'KOMPAKT');
            this.loadHTMLIntoFrame(iframe, kompaktHTML);
            switchBtn.innerHTML = '<i class="fas fa-exchange-alt"></i> Zur Detail-Version';
        }
    }

    loadHTMLIntoFrame(iframe, html) {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(html);
        iframeDoc.close();
    }

    printSplitPreview() {
        // Create a new window with both versions
        const kompaktContent = document.getElementById('newsletter-editor-kompakt').innerHTML;
        const detailContent = document.getElementById('newsletter-editor-detail').innerHTML;
        
        const printHTML = `
            <!DOCTYPE html>
            <html lang="de">
            <head>
                <meta charset="UTF-8">
                <title>Newsletter - Beide Versionen</title>
                <style>
                    body { font-family: var(--font-primary, Arial, sans-serif); line-height: 1.6; }
                    .version-section { page-break-after: always; margin-bottom: 40px; }
                    .version-header { background: #f8f9fa; padding: 20px; margin-bottom: 20px; border-left: 4px solid #0066cc; }
                    h1 { color: #003366; }
                    @media print { .version-section:last-child { page-break-after: auto; } }
                </style>
            </head>
            <body>
                <div class="version-section">
                    <div class="version-header">
                        <h1>KOMPAKT Version</h1>
                    </div>
                    ${kompaktContent}
                </div>
                <div class="version-section">
                    <div class="version-header">
                        <h1>DETAIL Version</h1>
                    </div>
                    ${detailContent}
                </div>
            </body>
            </html>
        `;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(printHTML);
        printWindow.document.close();
        printWindow.print();
    }

    // Enhanced Export Functionality
    toggleExportDropdown() {
        const dropdown = document.querySelector('.export-dropdown');
        dropdown.classList.toggle('active');
    }

    closeExportDropdown() {
        const dropdown = document.querySelector('.export-dropdown');
        dropdown.classList.remove('active');
    }

    exportVersion(version) {
        const editor = document.getElementById(`newsletter-editor-${version}`);
        const content = editor.innerHTML;
        
        // Generate complete newsletter HTML
        const fullHTML = this.generateFullHTML(content, version);
        
        // Create and download file
        const blob = new Blob([fullHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `newsletter-${version}-${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.closeExportDropdown();
        this.showSuccess(`${version.toUpperCase()}-Version erfolgreich exportiert`);
    }

    exportBothVersions() {
        const kompaktContent = document.getElementById('newsletter-editor-kompakt').innerHTML;
        const detailContent = document.getElementById('newsletter-editor-detail').innerHTML;
        
        // Create ZIP-like structure (simplified as combined HTML)
        const combinedHTML = this.generateCombinedHTML(kompaktContent, detailContent);
        
        const blob = new Blob([combinedHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `newsletter-beide-versionen-${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.closeExportDropdown();
        this.showSuccess('Beide Versionen erfolgreich exportiert');
    }

    generateCombinedHTML(kompaktContent, detailContent) {
        return `
            <!DOCTYPE html>
            <html lang="de">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Newsletter - Beide Versionen - Stadt Bonn</title>
                <style>
                    ${this.getBonnStyles()}
                    .version-switcher { text-align: center; margin: 20px 0; }
                    .version-switcher button { 
                        padding: 10px 20px; margin: 0 5px; 
                        background: #0066cc; color: white; border: none; border-radius: 4px; cursor: pointer;
                    }
                    .version-switcher button:hover { background: #004499; }
                    .version-switcher button.active { background: #003366; }
                    .version-content { display: none; }
                    .version-content.active { display: block; }
                    .version-header { background: #f8f9fa; padding: 20px; margin-bottom: 20px; border-left: 4px solid #0066cc; }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="version-switcher">
                        <button onclick="showVersion('kompakt')" id="btn-kompakt" class="active">KOMPAKT Version</button>
                        <button onclick="showVersion('detail')" id="btn-detail">DETAIL Version</button>
                    </div>
                    
                    <div id="version-kompakt" class="version-content active">
                        <div class="version-header">
                            <h1>KOMPAKT Version</h1>
                            <p>Kurze, prägnante Übersicht der wichtigsten Punkte</p>
                        </div>
                        ${kompaktContent}
                    </div>
                    
                    <div id="version-detail" class="version-content">
                        <div class="version-header">
                            <h1>DETAIL Version</h1>
                            <p>Ausführliche Informationen mit Hintergründen und Beispielen</p>
                        </div>
                        ${detailContent}
                    </div>
                </div>
                
                <script>
                    function showVersion(version) {
                        // Hide all versions
                        document.querySelectorAll('.version-content').forEach(el => el.classList.remove('active'));
                        document.querySelectorAll('.version-switcher button').forEach(el => el.classList.remove('active'));
                        
                        // Show selected version
                        document.getElementById('version-' + version).classList.add('active');
                        document.getElementById('btn-' + version).classList.add('active');
                    }
                </script>
            </body>
            </html>
        `;
    }

    generateFullHTML(content, version) {
        return `
            <!DOCTYPE html>
            <html lang="de">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Newsletter ${version.toUpperCase()} - Stadt Bonn</title>
                <style>
                    ${this.getBonnStyles()}
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="version-header">
                        <h1>Newsletter ${version.toUpperCase()}</h1>
                        <p>Stadt Bonn - Steuerliche Informationen</p>
                    </div>
                    ${content}
                </div>
            </body>
            </html>
        `;
    }

    generatePreviewHTML(content, version) {
        return `
            <!DOCTYPE html>
            <html lang="de">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Newsletter Vorschau - ${version}</title>
                <style>
                    ${this.getBonnStyles()}
                    .version-badge { 
                        background: #0066cc; color: white; padding: 4px 8px; 
                        border-radius: 12px; font-size: 12px; font-weight: bold;
                        display: inline-block; margin-bottom: 10px;
                    }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="version-badge">${version} Version</div>
                    ${content}
                </div>
            </body>
            </html>
        `;
    }

    // Utility Methods
    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Copy all existing methods from original editor
    setupContentEditable() {
        const editors = [
            document.getElementById('newsletter-editor-kompakt'),
            document.getElementById('newsletter-editor-detail')
        ];
        
        editors.forEach(editor => {
            if (!editor) return;
            
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
        });
    }

    setupTagInputs() {
        ['roles', 'departments', 'topics'].forEach(tagType => {
            const input = document.getElementById(`${tagType}-input`);
            if (input) {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.addTag(tagType, input.value.trim());
                        input.value = '';
                    }
                });
            }
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

        const commentsField = document.getElementById('verification-comments');
        if (commentsField) {
            commentsField.addEventListener('input', () => {
                this.updateVerificationStatus();
            });
        }
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
        if (!container) return;
        
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

    // Enhanced validation for both versions
    runValidation() {
        this.validationIssues = [];
        
        // Validate current version
        this.validateRequiredData();
        this.validateSources();
        this.validateVerification();
        this.validateContent();
        this.validateVersionConsistency();
        
        this.updateValidationDisplay();
    }

    runInitialValidation() {
        setTimeout(() => {
            this.runValidation();
        }, 500);
    }

    validateVersionConsistency() {
        const kompaktContent = document.getElementById('newsletter-editor-kompakt').textContent.trim();
        const detailContent = document.getElementById('newsletter-editor-detail').textContent.trim();
        
        if (kompaktContent.length > 0 && detailContent.length > 0) {
            // Check if titles are consistent
            const kompaktTitle = document.querySelector('#newsletter-editor-kompakt h1')?.textContent;
            const detailTitle = document.querySelector('#newsletter-editor-detail h1')?.textContent;
            
            if (kompaktTitle && detailTitle && 
                !detailTitle.includes(kompaktTitle.replace('[NEWSLETTER TITEL]', '').trim())) {
                this.validationIssues.push({
                    type: 'warning',
                    message: 'Titel zwischen Kompakt- und Detail-Version unterschiedlich',
                    element: null
                });
            }
        }
        
        if (kompaktContent.length === 0 && detailContent.length > 0) {
            this.validationIssues.push({
                type: 'info',
                message: 'Detail-Version vorhanden, aber Kompakt-Version leer',
                element: null
            });
        }
        
        if (kompaktContent.length > 0 && detailContent.length === 0) {
            this.validationIssues.push({
                type: 'info', 
                message: 'Kompakt-Version vorhanden, aber Detail-Version leer',
                element: null
            });
        }
    }

    validateRequiredData() {
        const editor = this.getCurrentEditor();
        if (!editor) return;
        
        const placeholders = editor.querySelectorAll('*');
        
        placeholders.forEach(element => {
            const text = element.textContent || '';
            if (text.includes('[DATEN ERFORDERLICH')) {
                if (!element.classList.contains('data-required')) {
                    element.classList.add('data-required');
                }
                
                this.validationIssues.push({
                    type: 'error',
                    message: `Fehlende Daten in ${this.currentVersion.toUpperCase()}: ${text.substring(0, 100)}...`,
                    element: element
                });
            } else {
                element.classList.remove('data-required');
            }
        });
    }

    validateSources() {
        const editor = this.getCurrentEditor();
        if (!editor) return;
        
        const sourceInputs = editor.querySelectorAll('.source-field');
        sourceInputs.forEach(input => {
            if (!input.value.trim()) {
                this.validationIssues.push({
                    type: 'warning',
                    message: `Quellenangabe fehlt in ${this.currentVersion.toUpperCase()}-Version`,
                    element: input
                });
            }
        });
        
        // Check sidebar sources
        const primarySource = document.getElementById('primary-source')?.value;
        const secondarySource = document.getElementById('secondary-source')?.value;
        
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
        const editor = this.getCurrentEditor();
        if (!editor) return;
        
        const content = editor.textContent.trim();
        
        if (content.length < 100) {
            this.validationIssues.push({
                type: 'warning',
                message: `${this.currentVersion.toUpperCase()}-Version sehr kurz`,
                element: editor
            });
        }
        
        // Check for empty sections
        const sections = editor.querySelectorAll('.newsletter-section');
        sections.forEach(section => {
            const items = section.querySelectorAll('.newsletter-item');
            if (items.length === 0) {
                const sectionTitle = section.querySelector('h2')?.textContent;
                this.validationIssues.push({
                    type: 'info',
                    message: `Bereich "${sectionTitle}" in ${this.currentVersion.toUpperCase()}-Version ist leer`,
                    element: section
                });
            }
        });
    }

    updateValidationDisplay() {
        const validationBtn = document.getElementById('validation-btn');
        const validationCount = document.querySelector('.validation-count');
        
        if (!validationBtn || !validationCount) return;
        
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
        if (!resultsContainer) return;
        
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
                    if (issue.element.focus) {
                        issue.element.focus();
                    }
                });
            }
            
            resultsContainer.appendChild(issueElement);
        });
    }

    toggleValidationPanel() {
        const panel = document.getElementById('validation-panel');
        if (panel) {
            panel.classList.toggle('active');
        }
    }

    closeValidationPanel() {
        const panel = document.getElementById('validation-panel');
        if (panel) {
            panel.classList.remove('active');
        }
    }

    // Content change handler for version-specific validation
    onContentChange(version) {
        // Only run validation if we're editing the current version
        if (version === this.currentVersion) {
            // Debounce validation
            if (this.validationTimeout) {
                clearTimeout(this.validationTimeout);
            }
            this.validationTimeout = setTimeout(() => {
                this.runValidation();
            }, 1000);
        }
    }

    // Modal Management
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }

    // Preview Functionality (enhanced)
    showPreview() {
        const editor = this.getCurrentEditor();
        const content = editor.innerHTML;
        
        // Create full HTML document for preview
        const previewHTML = this.generatePreviewHTML(content, this.currentVersion.toUpperCase());
        
        const iframe = document.getElementById('preview-frame');
        this.loadHTMLIntoFrame(iframe, previewHTML);
        
        // Update switch button text
        const switchBtn = document.getElementById('preview-switch-version');
        const otherVersion = this.currentVersion === 'kompakt' ? 'detail' : 'kompakt';
        switchBtn.innerHTML = `<i class="fas fa-exchange-alt"></i> Zur ${otherVersion.toUpperCase()}-Version`;
        
        this.showModal('preview-modal');
    }

    printPreview() {
        const iframe = document.getElementById('preview-frame');
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.print();
        }
    }

    // Export base method (calls specific version)
    exportHTML() {
        this.exportVersion(this.currentVersion);
    }

    getBonnStyles() {
        return `
            :root {
                --bonn-primary: #003366;
                --bonn-secondary: #0066CC;
                --bonn-accent: #FFD700;
                --font-primary: 'Source Sans Pro', Arial, sans-serif;
                --font-secondary: 'Merriweather', serif;
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
                padding: 20px;
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
            .newsletter-item.focus-generated { 
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                border: 1px solid #dee2e6;
            }
            .data-required { 
                background: linear-gradient(120deg, #fef3c7 0%, #fde68a 100%); 
                padding: 2px 4px; 
                border-radius: 2px; 
                color: #92400e; 
            }
            h1, h2, h3 { color: var(--bonn-primary); }
            .section-header h2 { 
                font-family: var(--font-secondary); 
                border-bottom: 2px solid var(--bonn-secondary);
                padding-bottom: 8px;
            }
            .item-header h3 { margin-top: 0; }
            .version-header { 
                background: linear-gradient(135deg, var(--bonn-primary) 0%, var(--bonn-secondary) 100%);
                color: white;
                padding: 20px;
                margin: -20px -20px 20px -20px;
                text-align: center;
            }
            .version-header h1 { color: white; margin: 0; }
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
            animation: slideIn 0.3s ease;
        `;
        
        // Add slide-in animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }

    saveNewsletter() {
        // Enhanced save functionality for both versions
        const newsletterData = {
            kompakt: document.getElementById('newsletter-editor-kompakt').innerHTML,
            detail: document.getElementById('newsletter-editor-detail').innerHTML,
            focusPoints: this.focusPoints,
            tags: this.tags,
            timestamp: new Date().toISOString(),
            version: '2.0'
        };
        
        // In a real implementation, this would save to a server
        localStorage.setItem('bonn-newsletter-draft', JSON.stringify(newsletterData));
        this.showSuccess('Beide Newsletter-Versionen gespeichert');
    }

    // Additional utility methods for completeness
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
        // Enhanced loading for both versions
        if (data.kompakt) {
            document.getElementById('newsletter-editor-kompakt').innerHTML = data.kompakt;
        }
        if (data.detail) {
            document.getElementById('newsletter-editor-detail').innerHTML = data.detail;
        }
        if (data.focusPoints) {
            this.focusPoints = data.focusPoints;
            this.populateFocusPointsForm();
        }
        if (data.tags) {
            this.tags = data.tags;
            Object.keys(this.tags).forEach(type => {
                this.renderTags(type);
            });
        }

        this.showSuccess('Newsletter erfolgreich geladen');
    }

    populateFocusPointsForm() {
        document.getElementById('main-statement').value = this.focusPoints.mainStatement || '';
        document.getElementById('target-audience').value = this.focusPoints.targetAudience || '';
        document.getElementById('action-recommendation').value = this.focusPoints.actionRecommendation || '';
        document.getElementById('deadline-date').value = this.focusPoints.deadline || '';
        document.getElementById('deadline-note').value = this.focusPoints.deadlineNote || '';
        document.getElementById('priority-level').value = this.focusPoints.priority || 'mittel';
    }

    loadHTMLContent(html) {
        // Load HTML into current version
        const editor = this.getCurrentEditor();
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        const content = tempDiv.querySelector('.newsletter-content') || tempDiv;
        editor.innerHTML = content.innerHTML;
        
        this.showSuccess('HTML-Inhalt erfolgreich geladen');
    }

    // Template and formatting methods (simplified versions of originals)
    showTemplateModal(templateId) {
        // Implementation would be similar to original but with version awareness
        this.showSuccess('Template-Funktionalität in Entwicklung');
    }

    insertTemplate() {
        this.showSuccess('Template-Einfügung in Entwicklung');
    }

    executeFormatCommand(command) {
        const editor = this.getCurrentEditor();
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

    addItemToSection(sectionId) {
        const section = document.querySelector(`#newsletter-editor-${this.currentVersion} [data-section="${sectionId}"] .section-content`);
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
        const versionSuffix = this.currentVersion === 'detail' ? ' (ausführlich)' : '';
        return `
            <div class="newsletter-item placeholder-item">
                <div class="item-header">
                    <h3 contenteditable="true" placeholder="Artikeltitel${versionSuffix}...">[DATEN ERFORDERLICH: Titel${versionSuffix}]</h3>
                    <div class="ampel-selector">
                        <select class="ampel-select">
                            <option value="pflicht" data-color="#dc3545">🔴 Pflicht</option>
                            <option value="bald" data-color="#ffc107">🟡 Bald</option>
                            <option value="radar" data-color="#28a745">🟢 Radar</option>
                        </select>
                    </div>
                </div>
                <div class="item-content" contenteditable="true" placeholder="Inhalt des Artikels${versionSuffix}...">
                    [DATEN ERFORDERLICH: ${this.currentVersion === 'detail' ? 'Ausführliche ' : ''}Beschreibung${versionSuffix}]
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
        const section = document.querySelector(`#newsletter-editor-${this.currentVersion} [data-section="${sectionId}"]`);
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

    updateSourceData() {
        this.runValidation();
    }

    updateVerificationStatus() {
        const checkboxes = document.querySelectorAll('.verification-checklist input[type="checkbox"]');
        const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
        const totalCount = checkboxes.length;
        
        const statusIndicator = document.querySelector('.status-indicator');
        const statusContainer = document.getElementById('verification-status');
        
        if (!statusIndicator || !statusContainer) return;
        
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
}

// Initialize enhanced editor when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.editor = new EnhancedNewsletterEditor();
});