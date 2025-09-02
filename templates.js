/**
 * Newsletter Article Templates for Stadt Bonn
 * Templates for different types of tax and legal articles
 */

class NewsletterTemplates {
    constructor() {
        this.templates = {
            'gesetzesaenderung': {
                name: 'Gesetzesänderung',
                icon: 'fas fa-balance-scale',
                description: 'Template für neue Gesetze oder Gesetzesänderungen',
                fields: {
                    gesetz: {
                        label: 'Gesetzesbezeichnung',
                        type: 'text',
                        placeholder: 'z.B. Grundsteuergesetz (GrStG)',
                        required: true
                    },
                    aenderung_typ: {
                        label: 'Art der Änderung',
                        type: 'select',
                        options: ['Neufassung', 'Änderungsgesetz', 'Verordnung', 'Verwaltungsanweisung'],
                        required: true
                    },
                    inkrafttreten: {
                        label: 'Inkrafttreten',
                        type: 'date',
                        required: true
                    },
                    betroffene_bereiche: {
                        label: 'Betroffene Bereiche',
                        type: 'textarea',
                        placeholder: 'Was konkret wird geändert?',
                        required: true
                    },
                    auswirkungen: {
                        label: 'Auswirkungen auf Kommunen',
                        type: 'textarea',
                        placeholder: 'Welche direkten Auswirkungen hat dies auf kommunale Verwaltung?',
                        required: true
                    },
                    handlungsbedarf: {
                        label: 'Handlungsbedarf',
                        type: 'textarea',
                        placeholder: 'Was müssen Kommunen konkret tun?',
                        required: true
                    },
                    uebergangsregelungen: {
                        label: 'Übergangsregelungen',
                        type: 'textarea',
                        placeholder: 'Übergangsfristen und -regelungen'
                    },
                    quelle_bgl: {
                        label: 'Bundesgesetzblatt-Fundstelle',
                        type: 'text',
                        placeholder: 'BGBl. I S. XXX'
                    },
                    classification: {
                        label: 'Dringlichkeit',
                        type: 'select',
                        options: [
                            { value: 'pflicht', text: '🔴 Pflicht - Sofortiger Handlungsbedarf' },
                            { value: 'bald', text: '🟡 Bald - In den nächsten Monaten' },
                            { value: 'radar', text: '🟢 Radar - Langfristige Planung' }
                        ],
                        required: true
                    }
                },
                template: `
                    <div class="newsletter-item {{classification}}">
                        <div class="item-header">
                            <h3>Gesetzesänderung: {{gesetz}}</h3>
                            <div class="ampel-selector">
                                <span class="ampel-indicator ampel-{{classification}}">{{classification_text}}</span>
                            </div>
                        </div>
                        <div class="item-content">
                            <p><strong>Art der Änderung:</strong> {{aenderung_typ}}</p>
                            <p><strong>Inkrafttreten:</strong> {{inkrafttreten}}</p>
                            
                            <div class="law-details">
                                <h4>Betroffene Bereiche</h4>
                                <p>{{betroffene_bereiche}}</p>
                                
                                <h4>Auswirkungen auf Kommunen</h4>
                                <p>{{auswirkungen}}</p>
                                
                                <h4>Handlungsbedarf</h4>
                                <p>{{handlungsbedarf}}</p>
                                
                                {{#uebergangsregelungen}}
                                <h4>Übergangsregelungen</h4>
                                <p>{{uebergangsregelungen}}</p>
                                {{/uebergangsregelungen}}
                            </div>
                        </div>
                        <div class="item-metadata">
                            <div class="source-info">
                                <span class="source-label">📖 Quelle:</span>
                                {{#quelle_bgl}}
                                <span class="source-text">{{quelle_bgl}}</span>
                                {{/quelle_bgl}}
                                {{^quelle_bgl}}
                                <input type="text" placeholder="Bundesgesetzblatt-Fundstelle..." class="source-field">
                                {{/quelle_bgl}}
                            </div>
                            <div class="law-tags">
                                <span class="tag-item department-tag">🏢 Steueramt</span>
                                <span class="tag-item topic-tag">📌 Gesetzesänderung</span>
                            </div>
                        </div>
                    </div>
                `
            },

            'bmf-schreiben': {
                name: 'BMF-Schreiben',
                icon: 'fas fa-file-alt',
                description: 'Template für BMF-Schreiben und ministerielle Verlautbarungen',
                fields: {
                    titel: {
                        label: 'Titel des BMF-Schreibens',
                        type: 'text',
                        placeholder: 'z.B. Anwendung der Grundsteuerreform',
                        required: true
                    },
                    aktenzeichen: {
                        label: 'Aktenzeichen',
                        type: 'text',
                        placeholder: 'z.B. IV A 3 - S 3050/22/10001',
                        required: true
                    },
                    datum: {
                        label: 'Datum des Schreibens',
                        type: 'date',
                        required: true
                    },
                    betreff: {
                        label: 'Betreff/Gegenstand',
                        type: 'textarea',
                        placeholder: 'Worum geht es in dem Schreiben?',
                        required: true
                    },
                    kernaussagen: {
                        label: 'Kernaussagen',
                        type: 'textarea',
                        placeholder: 'Die wichtigsten Punkte des Schreibens',
                        required: true
                    },
                    praxishinweise: {
                        label: 'Praktische Hinweise',
                        type: 'textarea',
                        placeholder: 'Was bedeutet dies für die Praxis?'
                    },
                    anwendung_ab: {
                        label: 'Anwendung ab',
                        type: 'date'
                    },
                    fundstelle: {
                        label: 'Fundstelle',
                        type: 'text',
                        placeholder: 'BStBl., DStR etc.'
                    },
                    classification: {
                        label: 'Dringlichkeit',
                        type: 'select',
                        options: [
                            { value: 'pflicht', text: '🔴 Pflicht - Sofortiger Handlungsbedarf' },
                            { value: 'bald', text: '🟡 Bald - In den nächsten Monaten' },
                            { value: 'radar', text: '🟢 Radar - Langfristige Planung' }
                        ],
                        required: true
                    }
                },
                template: `
                    <div class="newsletter-item {{classification}}">
                        <div class="item-header">
                            <h3>BMF-Schreiben: {{titel}}</h3>
                            <div class="ampel-selector">
                                <span class="ampel-indicator ampel-{{classification}}">{{classification_text}}</span>
                            </div>
                        </div>
                        <div class="item-content">
                            <p><strong>Aktenzeichen:</strong> {{aktenzeichen}}</p>
                            <p><strong>Datum:</strong> {{datum}}</p>
                            {{#anwendung_ab}}
                            <p><strong>Anwendung ab:</strong> {{anwendung_ab}}</p>
                            {{/anwendung_ab}}
                            
                            <div class="bmf-details">
                                <h4>Betreff</h4>
                                <p>{{betreff}}</p>
                                
                                <h4>Kernaussagen</h4>
                                <p>{{kernaussagen}}</p>
                                
                                {{#praxishinweise}}
                                <h4>Praktische Hinweise</h4>
                                <p>{{praxishinweise}}</p>
                                {{/praxishinweise}}
                            </div>
                            
                            <div class="relevance-box" style="background: #e8f4f8; border-left: 3px solid #0066cc; padding: 12px; margin: 16px 0; border-radius: 4px;">
                                <p style="margin: 0; font-size: 0.875rem; color: #004080; font-weight: 500;">
                                    💡 <strong>Relevanz für Bonn:</strong> [DATEN ERFORDERLICH: Spezifische Auswirkungen auf Bonner Verwaltung]
                                </p>
                            </div>
                        </div>
                        <div class="item-metadata">
                            <div class="source-info">
                                <span class="source-label">📖 Quelle:</span>
                                {{#fundstelle}}
                                <span class="source-text">{{fundstelle}}</span>
                                {{/fundstelle}}
                                {{^fundstelle}}
                                <input type="text" placeholder="Fundstelle (BStBl., DStR etc.)..." class="source-field">
                                {{/fundstelle}}
                            </div>
                            <div class="bmf-tags">
                                <span class="tag-item role-tag">👤 Steuerberater</span>
                                <span class="tag-item department-tag">🏢 Finanzamt</span>
                                <span class="tag-item topic-tag">📌 BMF-Schreiben</span>
                            </div>
                        </div>
                    </div>
                `
            },

            'gerichtsurteil': {
                name: 'Gerichtsurteil',
                icon: 'fas fa-gavel',
                description: 'Template für relevante Gerichtsentscheidungen',
                fields: {
                    gericht: {
                        label: 'Gericht',
                        type: 'text',
                        placeholder: 'z.B. Bundesfinanzhof (BFH)',
                        required: true
                    },
                    aktenzeichen: {
                        label: 'Aktenzeichen',
                        type: 'text',
                        placeholder: 'z.B. II R 12/20',
                        required: true
                    },
                    entscheidungsdatum: {
                        label: 'Entscheidungsdatum',
                        type: 'date',
                        required: true
                    },
                    leitsatz: {
                        label: 'Leitsatz',
                        type: 'textarea',
                        placeholder: 'Der offizielle Leitsatz der Entscheidung',
                        required: true
                    },
                    sachverhalt: {
                        label: 'Sachverhalt (kurz)',
                        type: 'textarea',
                        placeholder: 'Knapper Sachverhalt des Falls',
                        required: true
                    },
                    entscheidung: {
                        label: 'Entscheidung des Gerichts',
                        type: 'textarea',
                        placeholder: 'Wie hat das Gericht entschieden?',
                        required: true
                    },
                    relevanz_kommunen: {
                        label: 'Relevanz für Kommunen',
                        type: 'textarea',
                        placeholder: 'Warum ist diese Entscheidung für kommunale Steuern relevant?',
                        required: true
                    },
                    instanzenzug: {
                        label: 'Instanzenzug',
                        type: 'text',
                        placeholder: 'Informationen zu Rechtsmitteln/Revision'
                    },
                    fundstelle: {
                        label: 'Fundstelle',
                        type: 'text',
                        placeholder: 'BStBl., DStR, NWB etc.'
                    },
                    classification: {
                        label: 'Relevanz',
                        type: 'select',
                        options: [
                            { value: 'pflicht', text: '🔴 Hoch - Grundsatzentscheidung' },
                            { value: 'bald', text: '🟡 Mittel - Praxisrelevant' },
                            { value: 'radar', text: '🟢 Info - Zur Kenntnis' }
                        ],
                        required: true
                    }
                },
                template: `
                    <div class="newsletter-item {{classification}}">
                        <div class="item-header">
                            <h3>{{gericht}}: {{aktenzeichen}}</h3>
                            <div class="ampel-selector">
                                <span class="ampel-indicator ampel-{{classification}}">{{classification_text}}</span>
                            </div>
                        </div>
                        <div class="item-content">
                            <p><strong>Entscheidungsdatum:</strong> {{entscheidungsdatum}}</p>
                            {{#instanzenzug}}
                            <p><strong>Instanzenzug:</strong> {{instanzenzug}}</p>
                            {{/instanzenzug}}
                            
                            <div class="court-decision">
                                <h4>Leitsatz</h4>
                                <blockquote style="margin: 16px 0; padding: 12px 16px; border-left: 4px solid var(--bonn-secondary); background: #f8f9fa; font-style: italic;">
                                    {{leitsatz}}
                                </blockquote>
                                
                                <h4>Sachverhalt</h4>
                                <p>{{sachverhalt}}</p>
                                
                                <h4>Entscheidung</h4>
                                <p>{{entscheidung}}</p>
                                
                                <h4>Relevanz für Kommunen</h4>
                                <p>{{relevanz_kommunen}}</p>
                            </div>
                        </div>
                        <div class="item-metadata">
                            <div class="source-info">
                                <span class="source-label">📖 Quelle:</span>
                                {{#fundstelle}}
                                <span class="source-text">{{fundstelle}}</span>
                                {{/fundstelle}}
                                {{^fundstelle}}
                                <input type="text" placeholder="Fundstelle eingeben..." class="source-field">
                                {{/fundstelle}}
                            </div>
                            <div class="court-tags">
                                <span class="tag-item role-tag">👤 Rechtsabteilung</span>
                                <span class="tag-item department-tag">🏢 Steueramt</span>
                                <span class="tag-item topic-tag">📌 Rechtsprechung</span>
                            </div>
                        </div>
                    </div>
                `
            },

            'eu-richtlinie': {
                name: 'EU-Richtlinie',
                icon: 'fas fa-flag',
                description: 'Template für EU-Richtlinien und europarechtliche Entwicklungen',
                fields: {
                    richtlinie: {
                        label: 'Richtlinienbezeichnung',
                        type: 'text',
                        placeholder: 'z.B. Richtlinie (EU) 2022/XXX',
                        required: true
                    },
                    titel: {
                        label: 'Titel der Richtlinie',
                        type: 'text',
                        placeholder: 'Vollständiger Titel',
                        required: true
                    },
                    veroeffentlichung: {
                        label: 'Veröffentlichungsdatum',
                        type: 'date',
                        required: true
                    },
                    umsetzungsfrist: {
                        label: 'Umsetzungsfrist',
                        type: 'date',
                        required: true
                    },
                    inhalt: {
                        label: 'Wesentlicher Inhalt',
                        type: 'textarea',
                        placeholder: 'Was regelt die Richtlinie?',
                        required: true
                    },
                    deutschland_betroffenheit: {
                        label: 'Betroffenheit Deutschland',
                        type: 'textarea',
                        placeholder: 'Welche deutschen Gesetze müssen geändert werden?',
                        required: true
                    },
                    kommunale_auswirkungen: {
                        label: 'Kommunale Auswirkungen',
                        type: 'textarea',
                        placeholder: 'Welche Auswirkungen auf Kommunen sind zu erwarten?',
                        required: true
                    },
                    handlungsempfehlung: {
                        label: 'Handlungsempfehlung',
                        type: 'textarea',
                        placeholder: 'Was sollten Kommunen jetzt tun?'
                    },
                    amtsblatt: {
                        label: 'Amtsblatt-Fundstelle',
                        type: 'text',
                        placeholder: 'ABl. L XXX vom XX.XX.XXXX'
                    },
                    classification: {
                        label: 'Dringlichkeit',
                        type: 'select',
                        options: [
                            { value: 'pflicht', text: '🔴 Hoch - Kurze Umsetzungsfrist' },
                            { value: 'bald', text: '🟡 Mittel - Normale Umsetzungsfrist' },
                            { value: 'radar', text: '🟢 Niedrig - Lange Umsetzungsfrist' }
                        ],
                        required: true
                    }
                },
                template: `
                    <div class="newsletter-item {{classification}}">
                        <div class="item-header">
                            <h3>EU-Richtlinie: {{richtlinie}}</h3>
                            <div class="ampel-selector">
                                <span class="ampel-indicator ampel-{{classification}}">{{classification_text}}</span>
                            </div>
                        </div>
                        <div class="item-content">
                            <h4>{{titel}}</h4>
                            <p><strong>Veröffentlicht:</strong> {{veroeffentlichung}}</p>
                            <p><strong>Umsetzungsfrist:</strong> {{umsetzungsfrist}}</p>
                            
                            <div class="eu-directive">
                                <h4>Wesentlicher Inhalt</h4>
                                <p>{{inhalt}}</p>
                                
                                <h4>Betroffenheit Deutschland</h4>
                                <p>{{deutschland_betroffenheit}}</p>
                                
                                <h4>Auswirkungen auf Kommunen</h4>
                                <p>{{kommunale_auswirkungen}}</p>
                                
                                {{#handlungsempfehlung}}
                                <div style="background: #e8f4f8; border-left: 3px solid #0066cc; padding: 12px; margin: 16px 0; border-radius: 4px;">
                                    <h4 style="color: #004080; margin: 0 0 8px 0;">💡 Handlungsempfehlung</h4>
                                    <p style="margin: 0; color: #004080;">{{handlungsempfehlung}}</p>
                                </div>
                                {{/handlungsempfehlung}}
                            </div>
                        </div>
                        <div class="item-metadata">
                            <div class="source-info">
                                <span class="source-label">📖 Quelle:</span>
                                {{#amtsblatt}}
                                <span class="source-text">{{amtsblatt}}</span>
                                {{/amtsblatt}}
                                {{^amtsblatt}}
                                <input type="text" placeholder="Amtsblatt-Fundstelle..." class="source-field">
                                {{/amtsblatt}}
                            </div>
                            <div class="eu-tags">
                                <span class="tag-item role-tag">👤 Europabeauftragte</span>
                                <span class="tag-item department-tag">🏢 Rechtsamt</span>
                                <span class="tag-item topic-tag">📌 EU-Recht</span>
                            </div>
                        </div>
                    </div>
                `
            },

            'kommunale-auswirkung': {
                name: 'Kommunale Auswirkung',
                icon: 'fas fa-building',
                description: 'Template für spezifische Auswirkungen auf Kommunalverwaltung',
                fields: {
                    thema: {
                        label: 'Thema/Bereich',
                        type: 'text',
                        placeholder: 'z.B. Grundsteuerreform Phase 2',
                        required: true
                    },
                    auswirkung_typ: {
                        label: 'Art der Auswirkung',
                        type: 'select',
                        options: ['Rechtliche Änderung', 'Verfahrensänderung', 'Technische Umstellung', 'Organisatorische Anpassung', 'Finanzielle Auswirkung'],
                        required: true
                    },
                    betroffene_bereiche: {
                        label: 'Betroffene Bereiche',
                        type: 'textarea',
                        placeholder: 'Welche Bereiche der Kommunalverwaltung sind betroffen?',
                        required: true
                    },
                    konkrete_auswirkungen: {
                        label: 'Konkrete Auswirkungen',
                        type: 'textarea',
                        placeholder: 'Was ändert sich konkret für die tägliche Arbeit?',
                        required: true
                    },
                    handlungsschritte: {
                        label: 'Erforderliche Handlungsschritte',
                        type: 'textarea',
                        placeholder: 'Was muss die Kommune konkret tun?',
                        required: true
                    },
                    zeitrahmen: {
                        label: 'Zeitrahmen',
                        type: 'text',
                        placeholder: 'Bis wann müssen Maßnahmen umgesetzt sein?',
                        required: true
                    },
                    kosten_schaetzung: {
                        label: 'Kostenschätzung',
                        type: 'text',
                        placeholder: 'Geschätzte Kosten oder Auswirkungen (falls bekannt)'
                    },
                    ansprechpartner: {
                        label: 'Ansprechpartner/Zuständigkeit',
                        type: 'text',
                        placeholder: 'Wer ist in der Verwaltung zuständig?',
                        required: true
                    },
                    chancen: {
                        label: 'Chancen',
                        type: 'textarea',
                        placeholder: 'Welche Vorteile/Chancen ergeben sich?'
                    },
                    risiken: {
                        label: 'Risiken',
                        type: 'textarea',
                        placeholder: 'Welche Risiken bestehen?'
                    },
                    classification: {
                        label: 'Priorität',
                        type: 'select',
                        options: [
                            { value: 'pflicht', text: '🔴 Hoch - Dringender Handlungsbedarf' },
                            { value: 'bald', text: '🟡 Mittel - Mittelfristige Planung' },
                            { value: 'radar', text: '🟢 Niedrig - Langfristige Vorbereitung' }
                        ],
                        required: true
                    }
                },
                template: `
                    <div class="newsletter-item {{classification}}">
                        <div class="item-header">
                            <h3>Kommunale Auswirkung: {{thema}}</h3>
                            <div class="ampel-selector">
                                <span class="ampel-indicator ampel-{{classification}}">{{classification_text}}</span>
                            </div>
                        </div>
                        <div class="item-content">
                            <p><strong>Art der Auswirkung:</strong> {{auswirkung_typ}}</p>
                            <p><strong>Zeitrahmen:</strong> {{zeitrahmen}}</p>
                            <p><strong>Zuständigkeit:</strong> {{ansprechpartner}}</p>
                            {{#kosten_schaetzung}}
                            <p><strong>Kostenschätzung:</strong> {{kosten_schaetzung}}</p>
                            {{/kosten_schaetzung}}
                            
                            <div class="municipal-impact">
                                <h4>Betroffene Bereiche</h4>
                                <p>{{betroffene_bereiche}}</p>
                                
                                <h4>Konkrete Auswirkungen</h4>
                                <p>{{konkrete_auswirkungen}}</p>
                                
                                <h4>Erforderliche Handlungsschritte</h4>
                                <p>{{handlungsschritte}}</p>
                                
                                {{#chancen}}{{#risiken}}
                                <div class="chancen-risiken" style="margin-top: 16px;">
                                    {{/risiken}}{{/chancen}}
                                    {{#chancen}}
                                    <div style="background: #f0fdf4; border-left: 3px solid #22c55e; padding: 12px; margin: 8px 0; border-radius: 4px;">
                                        <h5 style="color: #15803d; margin: 0 0 4px 0;">💡 Chancen</h5>
                                        <p style="margin: 0; color: #15803d; font-size: 0.875rem;">{{chancen}}</p>
                                    </div>
                                    {{/chancen}}
                                    {{#risiken}}
                                    <div style="background: #fef2f2; border-left: 3px solid #ef4444; padding: 12px; margin: 8px 0; border-radius: 4px;">
                                        <h5 style="color: #dc2626; margin: 0 0 4px 0;">⚠️ Risiken</h5>
                                        <p style="margin: 0; color: #dc2626; font-size: 0.875rem;">{{risiken}}</p>
                                    </div>
                                    {{/risiken}}
                                {{#chancen}}{{#risiken}}
                                </div>
                                {{/risiken}}{{/chancen}}
                            </div>
                        </div>
                        <div class="item-metadata">
                            <div class="source-info">
                                <span class="source-label">📖 Quelle:</span>
                                <input type="text" placeholder="Quelle der Information..." class="source-field">
                            </div>
                            <div class="municipal-tags">
                                <span class="tag-item role-tag">👤 {{ansprechpartner}}</span>
                                <span class="tag-item department-tag">🏢 Kommunalverwaltung</span>
                                <span class="tag-item topic-tag">📌 {{auswirkung_typ}}</span>
                            </div>
                        </div>
                    </div>
                `
            }
        };
    }

    getTemplate(templateId) {
        return this.templates[templateId] || null;
    }

    getAllTemplates() {
        return this.templates;
    }

    renderTemplate(templateId, data) {
        const template = this.getTemplate(templateId);
        if (!template) {
            throw new Error(`Template ${templateId} not found`);
        }

        // Simple template rendering (Mustache-style)
        let html = template.template;
        
        // Replace variables
        Object.keys(data).forEach(key => {
            const value = data[key];
            if (value !== undefined && value !== null && value !== '') {
                // Replace {{key}} with value
                const regex = new RegExp(`{{${key}}}`, 'g');
                html = html.replace(regex, value);
                
                // Handle conditional sections {{#key}}...{{/key}}
                const conditionalRegex = new RegExp(`{{#${key}}}([\\s\\S]*?){{/${key}}}`, 'g');
                html = html.replace(conditionalRegex, '$1');
            } else {
                // Remove conditional sections for empty values
                const conditionalRegex = new RegExp(`{{#${key}}}([\\s\\S]*?){{/${key}}}`, 'g');
                html = html.replace(conditionalRegex, '');
                
                // Replace empty variables with placeholder
                const regex = new RegExp(`{{${key}}}`, 'g');
                html = html.replace(regex, `[DATEN ERFORDERLICH: ${key}]`);
            }
        });

        // Handle negated conditionals {{^key}}...{{/key}} for empty values
        Object.keys(data).forEach(key => {
            const value = data[key];
            if (!value || value === '') {
                const negatedRegex = new RegExp(`{{\\^${key}}}([\\s\\S]*?){{/${key}}}`, 'g');
                html = html.replace(negatedRegex, '$1');
            } else {
                const negatedRegex = new RegExp(`{{\\^${key}}}([\\s\\S]*?){{/${key}}}`, 'g');
                html = html.replace(negatedRegex, '');
            }
        });

        // Clean up any remaining template syntax
        html = html.replace(/{{[^}]*}}/g, '');

        return html;
    }

    generateFormFields(templateId) {
        const template = this.getTemplate(templateId);
        if (!template) return '';

        let formHTML = '';
        Object.keys(template.fields).forEach(fieldKey => {
            const field = template.fields[fieldKey];
            formHTML += `<div class="template-field">`;
            formHTML += `<label for="${fieldKey}">${field.label}${field.required ? ' *' : ''}</label>`;
            
            switch (field.type) {
                case 'textarea':
                    formHTML += `<textarea id="${fieldKey}" name="${fieldKey}" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''}></textarea>`;
                    break;
                case 'select':
                    formHTML += `<select id="${fieldKey}" name="${fieldKey}" ${field.required ? 'required' : ''}>`;
                    formHTML += `<option value="">Bitte wählen...</option>`;
                    field.options.forEach(option => {
                        if (typeof option === 'string') {
                            formHTML += `<option value="${option}">${option}</option>`;
                        } else {
                            formHTML += `<option value="${option.value}">${option.text}</option>`;
                        }
                    });
                    formHTML += `</select>`;
                    break;
                case 'date':
                    formHTML += `<input type="date" id="${fieldKey}" name="${fieldKey}" ${field.required ? 'required' : ''}>`;
                    break;
                default:
                    formHTML += `<input type="${field.type}" id="${fieldKey}" name="${fieldKey}" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''}>`;
            }
            formHTML += `</div>`;
        });

        return formHTML;
    }

    validateTemplateData(templateId, data) {
        const template = this.getTemplate(templateId);
        if (!template) return { valid: false, errors: ['Template not found'] };

        const errors = [];
        Object.keys(template.fields).forEach(fieldKey => {
            const field = template.fields[fieldKey];
            if (field.required && (!data[fieldKey] || data[fieldKey].trim() === '')) {
                errors.push(`${field.label} ist ein Pflichtfeld`);
            }
        });

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    // Helper method to get classification display text
    getClassificationText(classification) {
        const classificationTexts = {
            'pflicht': 'Pflicht',
            'bald': 'Bald', 
            'radar': 'Radar'
        };
        return classificationTexts[classification] || classification;
    }
}

// Make it available globally
window.NewsletterTemplates = NewsletterTemplates;