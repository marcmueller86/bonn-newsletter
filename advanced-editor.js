/**
 * Advanced Newsletter & Document Editor
 * Stadt Bonn TCMS - Extended Template Editor with Markdown Support
 */

class TCMSAdvancedEditor {
    constructor() {
        this.currentTemplate = 'newsletter';
        this.currentData = {};
        this.markdownEditor = null;
        this.jsonEditor = null;
        this.previewVisible = true;
        
        // Template configurations
        this.templates = {
            newsletter: {
                name: 'Newsletter',
                description: 'Standard Newsletter mit neuer Struktur',
                endpoint: '/api/newsletter/generate',
                sampleData: this.getNewsletterSampleData()
            },
            internal: {
                name: 'Internes Dokument',
                description: 'Fokuspunkte & Handlungsempfehlungen',
                endpoint: '/api/internal/generate',
                sampleData: this.getInternalSampleData()
            },
            markdown: {
                name: 'Markdown Editor',
                description: 'Freie Markdown-Bearbeitung',
                endpoint: null,
                sampleData: this.getMarkdownSampleData()
            }
        };

        this.init();
    }

    init() {
        this.initializeEditors();
        this.bindEvents();
        this.updateStatus('Bereit', 'success');
    }

    initializeEditors() {
        // Initialize Markdown Editor
        this.markdownEditor = CodeMirror.fromTextArea(document.getElementById('markdownEditor'), {
            mode: 'markdown',
            theme: 'eclipse',
            lineNumbers: true,
            lineWrapping: true,
            autoCloseBrackets: true,
            matchBrackets: true,
            styleActiveLine: true,
            placeholder: 'Markdown-Inhalt hier eingeben...'
        });

        // Initialize JSON Editor
        this.jsonEditor = CodeMirror.fromTextArea(document.getElementById('jsonEditor'), {
            mode: 'application/json',
            theme: 'eclipse',
            lineNumbers: true,
            autoCloseBrackets: true,
            matchBrackets: true,
            styleActiveLine: true,
            foldGutter: true,
            gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter']
        });

        // Editor change handlers
        this.markdownEditor.on('change', () => this.onEditorChange());
        this.jsonEditor.on('change', () => this.onJSONChange());
    }

    bindEvents() {
        // Template selection
        document.querySelectorAll('.template-item').forEach(item => {
            item.addEventListener('click', (e) => this.selectTemplate(e.target.closest('.template-item').dataset.template));
        });

        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Toolbar buttons
        document.getElementById('newDocument').addEventListener('click', () => this.newDocument());
        document.getElementById('loadDocument').addEventListener('click', () => this.loadDocument());
        document.getElementById('saveDocument').addEventListener('click', () => this.saveDocument());
        document.getElementById('previewToggle').addEventListener('click', () => this.togglePreview());
        document.getElementById('generateDocument').addEventListener('click', () => this.generateDocument());

        // Quick actions
        document.getElementById('loadSampleData').addEventListener('click', () => this.loadSampleData());
        document.getElementById('validateData').addEventListener('click', () => this.validateData());

        // Export buttons
        document.getElementById('exportHTML').addEventListener('click', () => this.exportDocument('html'));
        document.getElementById('exportPDF').addEventListener('click', () => this.exportDocument('pdf'));
        document.getElementById('exportMarkdown').addEventListener('click', () => this.exportDocument('markdown'));
        document.getElementById('exportJSON').addEventListener('click', () => this.exportDocument('json'));

        // Classification buttons
        document.querySelectorAll('.classification-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.insertClassification(e.target.dataset.class));
        });
    }

    selectTemplate(templateKey) {
        // Update UI
        document.querySelectorAll('.template-item').forEach(item => item.classList.remove('active'));
        document.querySelector(`[data-template="${templateKey}"]`).classList.add('active');
        
        this.currentTemplate = templateKey;
        this.currentData = {};
        
        // Clear editors
        this.markdownEditor.setValue('');
        this.jsonEditor.setValue('');
        
        this.updateStatus(`Template gewechselt: ${this.templates[templateKey].name}`, 'success');
    }

    switchTab(tabName) {
        // Update tab UI
        document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update panel UI
        document.querySelectorAll('.editor-panel').forEach(panel => panel.classList.remove('active'));
        document.getElementById(`${tabName}Panel`).classList.add('active');

        // Special handling for preview tab
        if (tabName === 'preview') {
            this.updatePreview();
        }
    }

    newDocument() {
        if (confirm('Neues Dokument erstellen? Ungespeicherte Änderungen gehen verloren.')) {
            this.markdownEditor.setValue('');
            this.jsonEditor.setValue('');
            this.currentData = {};
            this.updatePreview();
            this.updateStatus('Neues Dokument erstellt', 'success');
        }
    }

    loadDocument() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,.md,.txt';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const content = e.target.result;
                        
                        if (file.name.endsWith('.json')) {
                            const data = JSON.parse(content);
                            this.currentData = data;
                            this.jsonEditor.setValue(JSON.stringify(data, null, 2));
                            this.generateMarkdownFromData(data);
                        } else {
                            this.markdownEditor.setValue(content);
                        }
                        
                        this.updatePreview();
                        this.updateStatus(`Datei geladen: ${file.name}`, 'success');
                    } catch (error) {
                        this.updateStatus(`Fehler beim Laden: ${error.message}`, 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        
        input.click();
    }

    saveDocument() {
        const content = this.getCurrentContent();
        const filename = `tcms-document-${Date.now()}`;
        
        // Save as JSON
        this.downloadFile(`${filename}.json`, JSON.stringify(content, null, 2), 'application/json');
        
        // Also save as Markdown
        const markdown = this.markdownEditor.getValue();
        if (markdown) {
            this.downloadFile(`${filename}.md`, markdown, 'text/markdown');
        }
        
        this.updateStatus('Dokument gespeichert', 'success');
    }

    loadSampleData() {
        const template = this.templates[this.currentTemplate];
        if (template && template.sampleData) {
            this.currentData = template.sampleData;
            this.jsonEditor.setValue(JSON.stringify(template.sampleData, null, 2));
            this.generateMarkdownFromData(template.sampleData);
            this.updatePreview();
            this.updateStatus('Sample Data geladen', 'success');
        }
    }

    validateData() {
        try {
            const jsonData = this.jsonEditor.getValue();
            const data = JSON.parse(jsonData);
            
            // Template-specific validation
            const validation = this.validateTemplateData(data);
            
            if (validation.isValid) {
                this.updateStatus(`Validation erfolgreich (${validation.itemCount} Items)`, 'success');
            } else {
                this.updateStatus(`Validation fehlgeschlagen: ${validation.errors.join(', ')}`, 'error');
            }
        } catch (error) {
            this.updateStatus(`JSON-Fehler: ${error.message}`, 'error');
        }
    }

    async generateDocument() {
        const template = this.templates[this.currentTemplate];
        if (!template.endpoint) {
            this.updateStatus('Template unterstützt keine Generierung', 'warning');
            return;
        }

        this.showLoading();
        
        try {
            const config = this.getConfiguration();
            const data = this.getCurrentContent();
            
            const response = await fetch(template.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    data: data,
                    config: config,
                    template: this.currentTemplate
                })
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success) {
                this.updatePreviewWithHTML(result.html);
                this.updateStatus('Dokument erfolgreich generiert', 'success');
            } else {
                throw new Error(result.error || 'Generierung fehlgeschlagen');
            }
        } catch (error) {
            this.updateStatus(`Generierung fehlgeschlagen: ${error.message}`, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async exportDocument(format) {
        this.showLoading();
        
        try {
            const data = this.getCurrentContent();
            const config = this.getConfiguration();
            
            let content, filename, mimeType;
            
            switch (format) {
                case 'html':
                    content = await this.generateHTML(data, config);
                    filename = `tcms-document-${Date.now()}.html`;
                    mimeType = 'text/html';
                    break;
                
                case 'pdf':
                    await this.exportPDF(data, config);
                    return;
                
                case 'markdown':
                    content = this.markdownEditor.getValue();
                    filename = `tcms-document-${Date.now()}.md`;
                    mimeType = 'text/markdown';
                    break;
                
                case 'json':
                    content = JSON.stringify(data, null, 2);
                    filename = `tcms-document-${Date.now()}.json`;
                    mimeType = 'application/json';
                    break;
            }
            
            if (content) {
                this.downloadFile(filename, content, mimeType);
                this.updateStatus(`${format.toUpperCase()} exportiert`, 'success');
            }
        } catch (error) {
            this.updateStatus(`Export fehlgeschlagen: ${error.message}`, 'error');
        } finally {
            this.hideLoading();
        }
    }

    togglePreview() {
        this.previewVisible = !this.previewVisible;
        const previewPanel = document.querySelector('.preview-panel');
        previewPanel.style.display = this.previewVisible ? 'block' : 'none';
        
        const toggleBtn = document.getElementById('previewToggle');
        toggleBtn.innerHTML = this.previewVisible ? 
            '<i class="fas fa-eye-slash"></i> Preview aus' : 
            '<i class="fas fa-eye"></i> Preview ein';
    }

    onEditorChange() {
        this.updatePreview();
    }

    onJSONChange() {
        try {
            const jsonData = this.jsonEditor.getValue();
            const data = JSON.parse(jsonData);
            this.currentData = data;
        } catch (error) {
            // Invalid JSON - don't update
        }
    }

    updatePreview() {
        const markdown = this.markdownEditor.getValue();
        if (markdown) {
            const html = marked.parse(markdown);
            document.getElementById('previewContent').innerHTML = html;
        } else if (this.currentData && Object.keys(this.currentData).length > 0) {
            this.renderDataPreview(this.currentData);
        }
    }

    updatePreviewWithHTML(html) {
        const previewFrame = document.getElementById('previewFrame');
        previewFrame.srcdoc = html;
        
        // Also update the preview content
        document.getElementById('previewContent').innerHTML = html;
    }

    renderDataPreview(data) {
        let html = '<div class="data-preview">';
        
        if (this.currentTemplate === 'newsletter') {
            html += this.renderNewsletterPreview(data);
        } else if (this.currentTemplate === 'internal') {
            html += this.renderInternalPreview(data);
        } else {
            html += '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
        }
        
        html += '</div>';
        document.getElementById('previewContent').innerHTML = html;
    }

    renderNewsletterPreview(data) {
        let html = `<h2>${data.newsletter_title || 'Newsletter Titel'}</h2>`;
        html += `<p><em>${data.newsletter_subtitle || 'Newsletter Untertitel'}</em></p>`;
        
        if (data.aktuelle_entwicklungen) {
            html += '<h3>1. Aktuelle Entwicklungen</h3>';
            data.aktuelle_entwicklungen.forEach(item => {
                html += `<div class="preview-item">
                    <h4>${item.title}</h4>
                    <p>${item.content}</p>
                    <span class="classification-${item.classification}">${item.classification?.toUpperCase()}</span>
                </div>`;
            });
        }
        
        if (data.was_bald_kommt) {
            html += '<h3>2. Was bald kommt</h3>';
            data.was_bald_kommt.forEach(item => {
                html += `<div class="preview-item">
                    <h4>${item.title}</h4>
                    <p>${item.content}</p>
                    ${item.deadline ? `<p><strong>Termin:</strong> ${item.deadline}</p>` : ''}
                </div>`;
            });
        }
        
        return html;
    }

    renderInternalPreview(data) {
        let html = `<h2>${data.document_title || 'Internes Dokument'}</h2>`;
        
        if (data.fokuspunkte && data.fokuspunkte.items) {
            html += '<h3>Fokuspunkte</h3>';
            data.fokuspunkte.items.forEach(item => {
                html += `<div class="preview-item priority-${item.priority}">
                    <h4>${item.title}</h4>
                    <p>${item.content}</p>
                    ${item.deadline ? `<p><strong>Deadline:</strong> ${item.deadline}</p>` : ''}
                    ${item.verantwortlich ? `<p><strong>Verantwortlich:</strong> ${item.verantwortlich}</p>` : ''}
                </div>`;
            });
        }
        
        return html;
    }

    generateMarkdownFromData(data) {
        let markdown = '';
        
        if (this.currentTemplate === 'newsletter') {
            markdown = this.generateNewsletterMarkdown(data);
        } else if (this.currentTemplate === 'internal') {
            markdown = this.generateInternalMarkdown(data);
        } else {
            markdown = '# Markdown Editor\n\nBearbeiten Sie hier Ihren Markdown-Inhalt...';
        }
        
        this.markdownEditor.setValue(markdown);
    }

    generateNewsletterMarkdown(data) {
        let md = `# ${data.newsletter_title || 'Newsletter Titel'}\n\n`;
        md += `*${data.newsletter_subtitle || 'Newsletter Untertitel'}*\n\n`;
        
        if (data.aktuelle_entwicklungen) {
            md += '## 1. Aktuelle Entwicklungen bei Steuern, die wir zahlen\n\n';
            data.aktuelle_entwicklungen.forEach(item => {
                md += `### ${item.title}\n\n`;
                md += `${item.content}\n\n`;
                md += `**Klassifikation:** ${item.classification?.toUpperCase() || 'RADAR'}\n\n`;
                if (item.source) {
                    md += `*Quelle: ${item.source}*\n\n`;
                }
                md += '---\n\n';
            });
        }
        
        if (data.was_bald_kommt) {
            md += '## 2. Was bald kommt\n\n';
            data.was_bald_kommt.forEach(item => {
                md += `### ${item.title}\n\n`;
                md += `${item.content}\n\n`;
                if (item.deadline) {
                    md += `**Termin:** ${item.deadline}\n\n`;
                }
                md += '---\n\n';
            });
        }
        
        if (data.tcms_internes) {
            md += '## 3. Internes aus dem TCMS\n\n';
            data.tcms_internes.forEach(item => {
                md += `### ${item.title}\n\n`;
                md += `${item.content}\n\n`;
                if (item.status) {
                    md += `**Status:** ${item.status}\n\n`;
                }
                if (item.verantwortlich) {
                    md += `**Verantwortlich:** ${item.verantwortlich}\n\n`;
                }
                md += '---\n\n';
            });
        }
        
        return md;
    }

    generateInternalMarkdown(data) {
        let md = `# ${data.document_title || 'Internes Dokument'}\n\n`;
        
        if (data.fokuspunkte && data.fokuspunkte.items) {
            md += '## Fokuspunkte & Handlungsempfehlungen\n\n';
            data.fokuspunkte.items.forEach(item => {
                md += `### ${item.title}\n\n`;
                md += `${item.content}\n\n`;
                md += `**Priorität:** ${item.priority?.toUpperCase() || 'MEDIUM'}\n\n`;
                if (item.verantwortlich) {
                    md += `**Verantwortlich:** ${item.verantwortlich}\n\n`;
                }
                if (item.deadline) {
                    md += `**Deadline:** ${item.deadline}\n\n`;
                }
                if (item.budget) {
                    md += `**Budget:** ${item.budget}\n\n`;
                }
                md += '---\n\n';
            });
        }
        
        return md;
    }

    insertClassification(classification) {
        const cursor = this.markdownEditor.getCursor();
        const text = `**Klassifikation:** ${classification.toUpperCase()}`;
        this.markdownEditor.replaceRange(text, cursor);
    }

    getCurrentContent() {
        try {
            return JSON.parse(this.jsonEditor.getValue());
        } catch {
            return this.currentData;
        }
    }

    getConfiguration() {
        return {
            environment: document.getElementById('environment').value,
            department: document.getElementById('department').value,
            newsletterType: document.getElementById('newsletterType').value
        };
    }

    validateTemplateData(data) {
        const errors = [];
        let itemCount = 0;
        
        if (this.currentTemplate === 'newsletter') {
            if (!data.newsletter_title) errors.push('Newsletter-Titel fehlt');
            if (!data.newsletter_subtitle) errors.push('Newsletter-Untertitel fehlt');
            if (data.aktuelle_entwicklungen) itemCount += data.aktuelle_entwicklungen.length;
            if (data.was_bald_kommt) itemCount += data.was_bald_kommt.length;
        } else if (this.currentTemplate === 'internal') {
            if (!data.document_title) errors.push('Dokument-Titel fehlt');
            if (data.fokuspunkte && data.fokuspunkte.items) itemCount += data.fokuspunkte.items.length;
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors,
            itemCount: itemCount
        };
    }

    async generateHTML(data, config) {
        // Simulate API call for HTML generation
        return `<html><body><h1>${data.newsletter_title || data.document_title}</h1></body></html>`;
    }

    async exportPDF(data, config) {
        // Simulate PDF export
        this.updateStatus('PDF-Export würde hier stattfinden', 'warning');
    }

    downloadFile(filename, content, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    showLoading() {
        document.getElementById('loadingModal').style.display = 'block';
        
        // Simulate progress
        let progress = 0;
        const progressFill = document.getElementById('progressFill');
        const interval = setInterval(() => {
            progress += 10;
            progressFill.style.width = progress + '%';
            if (progress >= 100) {
                clearInterval(interval);
            }
        }, 100);
    }

    hideLoading() {
        setTimeout(() => {
            document.getElementById('loadingModal').style.display = 'none';
            document.getElementById('progressFill').style.width = '0%';
        }, 500);
    }

    updateStatus(message, type = 'success') {
        const statusEl = document.getElementById('status');
        statusEl.textContent = message;
        statusEl.className = `status-indicator status-${type}`;
        
        // Auto-clear status after 3 seconds
        setTimeout(() => {
            statusEl.textContent = 'Bereit';
            statusEl.className = 'status-indicator status-success';
        }, 3000);
    }

    // Sample data generators
    getNewsletterSampleData() {
        return {
            newsletter_title: 'Steuer-Newsletter Bonn',
            newsletter_subtitle: 'Steuern die die Stadt Bonn zahlt - Februar 2025',
            newsletter_description: 'Newsletter zu aktuellen Entwicklungen bei Steuern, die die Stadt Bonn als Steuerpflichtiger zahlt',
            
            aktuelle_entwicklungen: [
                {
                    title: 'Neue Körperschaftsteuer-Regelungen ab 2025',
                    content: 'Das BMF hat neue Regelungen zur Körperschaftsteuer veröffentlicht, die auch städtische Betriebe betreffen. Insbesondere die Stadtwerke und andere kommunale Unternehmen müssen ihre Steuererklärungen anpassen.',
                    classification: 'pflicht',
                    steuerart: 'Körperschaftsteuer',
                    source: 'BMF-Schreiben vom 15.01.2025'
                },
                {
                    title: 'EU-Richtlinie zur Umsatzsteuer öffentlicher Einrichtungen',
                    content: 'Die neue EU-Richtlinie 2025/123 erweitert die Umsatzsteuerpflicht für öffentliche Einrichtungen. Die Stadt Bonn muss prüfen, welche Tätigkeiten betroffen sind.',
                    classification: 'bald',
                    steuerart: 'Umsatzsteuer',
                    source: 'EU-Richtlinie 2025/123'
                }
            ],
            
            was_bald_kommt: [
                {
                    title: 'Digitale Lohnsteuerbescheinigung ab Juli 2025',
                    content: 'Alle Arbeitgeber müssen ab 01.07.2025 Lohnsteuerbescheinigungen ausschließlich digital übermitteln. Die Personalverwaltung muss entsprechende Systeme vorbereiten.',
                    classification: 'bald',
                    deadline: '01.07.2025',
                    steuerart: 'Lohnsteuer'
                },
                {
                    title: 'Neue Energiesteuer-Sätze ab 2026',
                    content: 'Die Bundesregierung plant eine Anpassung der Energiesteuer-Sätze. Dies betrifft den städtischen Energieverbrauch in Gebäuden und Fahrzeugen.',
                    classification: 'radar',
                    deadline: '01.01.2026',
                    steuerart: 'Energiesteuer'
                }
            ],
            
            tcms_internes: [
                {
                    title: 'TCMS-Dashboard Update v2.1',
                    content: 'Das neue Dashboard-Update bringt verbesserte Übersichtsfunktionen für Steuerfristen und automatische Benachrichtigungen.',
                    status: 'Abgeschlossen',
                    projekt_typ: 'Software-Update',
                    verantwortlich: 'IT-Abteilung',
                    naechste_schritte: 'Schulung der Anwender für März 2025 geplant'
                },
                {
                    title: 'Neues Compliance-Konzept für kommunale Betriebe',
                    content: 'Entwicklung eines erweiterten Compliance-Frameworks speziell für die steuerlichen Belange städtischer Unternehmen.',
                    status: 'In Bearbeitung',
                    projekt_typ: 'Konzeptentwicklung',
                    verantwortlich: 'Compliance-Team',
                    naechste_schritte: 'Abstimmung mit Stadtwerken und anderen Betrieben'
                }
            ]
        };
    }

    getInternalSampleData() {
        return {
            document_title: 'Steuer-Fokuspunkte Februar 2025',
            department: 'Tax Compliance Management System',
            
            fokuspunkte: {
                items: [
                    {
                        title: 'Körperschaftsteuer-Compliance für Stadtwerke überprüfen',
                        content: 'Aufgrund der neuen BMF-Regelungen müssen alle steuerlichen Prozesse der Stadtwerke Bonn überprüft und angepasst werden. Dies umfasst die Buchführung, Bilanzierung und Steuererklärungen.',
                        priority: 'high',
                        verantwortlich: 'Steueramt + Stadtwerke',
                        deadline: '31.03.2025',
                        budget: '25.000 €',
                        ressourcen: ['Externe Steuerberatung', '3 FTE für 2 Monate', 'Software-Anpassungen']
                    },
                    {
                        title: 'Umsatzsteuer-Prüfung städtische Dienstleistungen',
                        content: 'Systematische Überprüfung aller städtischen Dienstleistungen auf Umsatzsteuerpflicht gemäß neuer EU-Richtlinie.',
                        priority: 'medium',
                        verantwortlich: 'Kämmerei',
                        deadline: '30.04.2025',
                        budget: '15.000 €',
                        ressourcen: ['Juristische Beratung', '2 FTE für 1 Monat']
                    }
                ]
            },
            
            praxis_checkliste: {
                kategorien: [
                    {
                        kategorie_name: 'Sofort umzusetzen (bis 28.02.2025)',
                        tasks: [
                            {
                                task_text: 'Arbeitsgruppe "Körperschaftsteuer 2025" einrichten',
                                completed: false,
                                deadline: '15.02.2025',
                                assigned_to: 'Abteilungsleitung Steuern',
                                priority: 'high'
                            },
                            {
                                task_text: 'Bestandsaufnahme aller steuerpflichtigen städtischen Aktivitäten',
                                completed: false,
                                deadline: '28.02.2025',
                                assigned_to: 'Steueramt',
                                priority: 'high'
                            }
                        ]
                    },
                    {
                        kategorie_name: 'Bis Ende Q1/2025',
                        tasks: [
                            {
                                task_text: 'Externe Beratung für komplexe Steuerfragen beauftragen',
                                completed: false,
                                deadline: '15.03.2025',
                                assigned_to: 'Kämmerei',
                                priority: 'medium'
                            }
                        ]
                    }
                ]
            },
            
            risiko_assessment: {
                risiken: [
                    {
                        risiko_titel: 'Verspätete Anpassung an neue Körperschaftsteuer-Regeln',
                        beschreibung: 'Bei verspäteter Umsetzung der neuen Regelungen drohen Steuernachzahlungen und Zinsen.',
                        risiko_level: 'hoch',
                        impact: 'Potentielle Nachzahlungen bis 100.000 € plus Zinsen',
                        mitigation: 'Sofortige Beauftragung externer Beratung und Priorisierung der Anpassungen'
                    },
                    {
                        risiko_titel: 'Unklarheiten bei EU-Umsatzsteuer-Richtlinie',
                        beschreibung: 'Die Interpretation der neuen EU-Richtlinie ist teilweise unklar und könnte zu Fehleinschätzungen führen.',
                        risiko_level: 'mittel',
                        impact: 'Mögliche Nachforderungen bei Betriebsprüfungen',
                        mitigation: 'Enge Abstimmung mit Berufsverbänden und anderen Kommunen'
                    }
                ]
            },
            
            kontakte: {
                personen: [
                    {
                        name: 'Max Mustermann',
                        rolle: 'Leitung Steueramt',
                        email: 'max.mustermann@bonn.de',
                        telefon: '0228-77-1234',
                        abteilung: 'Steueramt'
                    },
                    {
                        name: 'Dr. Maria Schmidt',
                        rolle: 'TCMS-Koordinatorin',
                        email: 'maria.schmidt@bonn.de',
                        telefon: '0228-77-5678',
                        abteilung: 'Kämmerei'
                    }
                ]
            }
        };
    }

    getMarkdownSampleData() {
        return {
            content: `# Markdown Editor

## Willkommen im TCMS Markdown Editor

Hier können Sie frei Markdown-Inhalte bearbeiten und diese in HTML oder PDF exportieren.

### Features

- **Live-Preview**: Sehen Sie Ihre Änderungen in Echtzeit
- **Export-Optionen**: HTML, PDF, Markdown, JSON
- **Template-Integration**: Nahtlose Integration mit Newsletter- und internen Dokumenten

### Klassifikations-System

Verwenden Sie die Ampel-Klassifikation:

- 🔴 **PFLICHT**: Sofortiger Handlungsbedarf
- 🟡 **BALD**: Mittelfristiger Handlungsbedarf  
- 🟢 **RADAR**: Längerfristiger Handlungsbedarf

### Tipps

1. Nutzen Sie die **Quick Actions** in der Sidebar
2. Laden Sie **Sample Data** für einen schnellen Start
3. **Validieren** Sie Ihre Daten vor der Generierung
4. Nutzen Sie die **Classification Buttons** für konsistente Klassifikation`
        };
    }
}

// Initialize editor when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.tcmsEditor = new TCMSAdvancedEditor();
});