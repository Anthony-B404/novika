#!/usr/bin/env node

/**
 * Agent Router Intelligent - Qualiopii
 * 
 * Script de routing automatique des agents basé sur l'analyse contextuelle
 * Compatible avec Claude Code et le workflow TDD strict de Qualiopii
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

class QualiopiiAgentRouter {
    constructor() {
        this.configPath = path.join(process.cwd(), '.claude', 'agent-triggers.yaml');
        this.config = this.loadConfig();
        this.activationLog = [];
    }

    loadConfig() {
        try {
            const configFile = fs.readFileSync(this.configPath, 'utf8');
            return yaml.load(configFile);
        } catch (error) {
            console.error('❌ Impossible de charger la configuration des agents:', error.message);
            return null;
        }
    }

    /**
     * Analyse le contexte de la demande utilisateur
     * @param {string} userInput - Entrée utilisateur
     * @param {Array} changedFiles - Fichiers modifiés
     * @param {string} currentContext - Contexte actuel
     * @returns {Object} Analyse contextuelle
     */
    analyzeContext(userInput, changedFiles = [], currentContext = '') {
        const analysis = {
            keywords: this.extractKeywords(userInput),
            filePatterns: this.analyzeFilePatterns(changedFiles),
            contexts: this.identifyContexts(userInput, currentContext),
            urgency: this.assessUrgency(userInput),
            complianceRisk: this.assessComplianceRisk(userInput, changedFiles),
            tddRequired: this.assessTDDRequirement(userInput, changedFiles)
        };

        return analysis;
    }

    extractKeywords(text) {
        const normalizedText = text.toLowerCase();
        const allKeywords = [];
        
        // Extraction des mots-clés depuis la configuration
        Object.values(this.config.primary_triggers).forEach(trigger => {
            if (trigger.auto_activate_on && trigger.auto_activate_on.keywords) {
                trigger.auto_activate_on.keywords.forEach(keyword => {
                    if (normalizedText.includes(keyword.toLowerCase())) {
                        allKeywords.push(keyword);
                    }
                });
            }
        });

        return [...new Set(allKeywords)];
    }

    analyzeFilePatterns(changedFiles) {
        const patterns = {
            frontend: changedFiles.filter(f => 
                f.includes('frontend/') || 
                f.includes('components/') || 
                f.includes('pages/') || 
                f.endsWith('.vue')
            ),
            backend: changedFiles.filter(f => 
                f.includes('backend/') || 
                f.includes('controllers/') || 
                f.includes('models/') || 
                f.includes('services/')
            ),
            tests: changedFiles.filter(f => 
                f.includes('test') || 
                f.includes('spec') || 
                f.endsWith('.test.js') || 
                f.endsWith('.spec.ts')
            ),
            compliance: changedFiles.filter(f => 
                f.includes('compliance/') || 
                f.includes('legal/') || 
                f.includes('privacy/')
            )
        };

        return patterns;
    }

    identifyContexts(userInput, currentContext) {
        const contexts = [];
        const normalizedInput = userInput.toLowerCase();

        // Contextes Qualiopi spécifiques
        const qualiopiiContexts = {
            'formation_data_handling': ['formation', 'apprenant', 'learner', 'session', 'training'],
            'qualiopi_indicators': ['indicator', 'indicateur', 'evidence', 'preuve', 'audit'],
            'admin_interface': ['organization', 'tenant', 'dashboard', 'admin'],
            'compliance_critical': ['rgpd', 'gdpr', 'qualiopi', 'conformité', 'audit']
        };

        Object.entries(qualiopiiContexts).forEach(([context, keywords]) => {
            if (keywords.some(keyword => normalizedInput.includes(keyword))) {
                contexts.push(context);
            }
        });

        if (currentContext) {
            contexts.push(currentContext);
        }

        return contexts;
    }

    assessUrgency(userInput) {
        const urgentKeywords = ['urgent', 'critique', 'critical', 'bug', 'error', 'broken', 'failing', 'audit'];
        const normalizedInput = userInput.toLowerCase();
        
        const urgentFound = urgentKeywords.some(keyword => normalizedInput.includes(keyword));
        return urgentFound ? 'high' : 'normal';
    }

    assessComplianceRisk(userInput, changedFiles) {
        const normalizedInput = userInput.toLowerCase();
        const complianceKeywords = ['rgpd', 'gdpr', 'qualiopi', 'privacy', 'personal data', 'donnée personnelle'];
        const complianceFiles = changedFiles.some(file => 
            file.includes('compliance/') || 
            file.includes('legal/') || 
            file.includes('privacy/') ||
            file.includes('audit/')
        );

        const hasComplianceKeywords = complianceKeywords.some(keyword => normalizedInput.includes(keyword));
        
        if (hasComplianceKeywords || complianceFiles) {
            return 'high';
        }
        return 'low';
    }

    assessTDDRequirement(userInput, changedFiles) {
        const codeKeywords = ['implement', 'create', 'add', 'fix', 'update', 'refactor'];
        const normalizedInput = userInput.toLowerCase();
        const hasCodeChanges = changedFiles.some(file => 
            file.endsWith('.ts') || 
            file.endsWith('.js') || 
            file.endsWith('.vue') || 
            file.endsWith('.py')
        );
        const hasCodeKeywords = codeKeywords.some(keyword => normalizedInput.includes(keyword));

        return hasCodeChanges || hasCodeKeywords;
    }

    /**
     * Détermine quels agents activer basé sur l'analyse contextuelle
     * @param {Object} analysis - Analyse contextuelle
     * @returns {Array} Liste des agents à activer avec priorités
     */
    routeAgents(analysis) {
        const recommendations = [];
        const primaryTriggers = this.config.primary_triggers;

        // Parcourt tous les agents et calcule leur score de pertinence
        Object.entries(primaryTriggers).forEach(([agentName, config]) => {
            const score = this.calculateAgentScore(agentName, config, analysis);
            
            if (score.confidence >= config.confidence_threshold) {
                recommendations.push({
                    agent: agentName,
                    confidence: score.confidence,
                    priority: config.priority + score.boost,
                    reasons: score.reasons,
                    mandatory: score.mandatory
                });
            }
        });

        // Ajoute les agents secondaires si conditions remplies
        this.addSecondaryAgents(recommendations, analysis);

        // Trie par priorité descendante
        recommendations.sort((a, b) => b.priority - a.priority);

        // Applique les règles de chaînes d'agents
        this.applyAgentChains(recommendations, analysis);

        return recommendations;
    }

    calculateAgentScore(agentName, config, analysis) {
        let confidence = 0;
        let boost = 0;
        const reasons = [];
        let mandatory = false;

        // Score basé sur les mots-clés
        if (config.auto_activate_on && config.auto_activate_on.keywords) {
            const keywordMatches = analysis.keywords.filter(keyword => 
                config.auto_activate_on.keywords.some(configKeyword => 
                    configKeyword.toLowerCase() === keyword.toLowerCase()
                )
            );
            
            if (keywordMatches.length > 0) {
                confidence += 0.4 + (keywordMatches.length * 0.1);
                reasons.push(`Mots-clés correspondants: ${keywordMatches.join(', ')}`);
            }
        }

        // Score basé sur les patterns de fichiers
        if (config.auto_activate_on && config.auto_activate_on.file_patterns) {
            const hasFileMatch = Object.values(analysis.filePatterns).some(files => 
                files.length > 0 && config.auto_activate_on.file_patterns.some(pattern => 
                    files.some(file => this.matchPattern(file, pattern))
                )
            );
            
            if (hasFileMatch) {
                confidence += 0.3;
                reasons.push('Fichiers modifiés correspondent aux patterns');
            }
        }

        // Score basé sur les contextes
        if (config.auto_activate_on && config.auto_activate_on.contexts) {
            const contextMatches = analysis.contexts.filter(context => 
                config.auto_activate_on.contexts.includes(context)
            );
            
            if (contextMatches.length > 0) {
                confidence += 0.2 + (contextMatches.length * 0.05);
                reasons.push(`Contextes: ${contextMatches.join(', ')}`);
            }
        }

        // Boosts spéciaux pour Qualiopii
        if (agentName === 'legal-compliance-checker' && analysis.complianceRisk === 'high') {
            boost += 30;
            mandatory = true;
            reasons.push('🚨 CONFORMITÉ CRITIQUE - Activation obligatoire');
        }

        if (agentName === 'test-writer-fixer' && analysis.tddRequired) {
            boost += 20;
            mandatory = true;
            reasons.push('📋 TDD OBLIGATOIRE - Tests requis');
        }

        // Boost d'urgence
        if (analysis.urgency === 'high') {
            boost += 10;
            reasons.push('⚡ URGENCE ÉLEVÉE');
        }

        return { confidence, boost, reasons, mandatory };
    }

    addSecondaryAgents(recommendations, analysis) {
        const secondary = this.config.secondary_triggers;
        
        Object.entries(secondary).forEach(([agentName, config]) => {
            // Vérifie les conditions d'activation après d'autres agents
            if (config.auto_activate_after) {
                const hasActivatingAgent = recommendations.some(rec => 
                    config.auto_activate_after.includes(rec.agent)
                );
                
                if (hasActivatingAgent) {
                    recommendations.push({
                        agent: agentName,
                        confidence: config.confidence_threshold || 0.75,
                        priority: config.priority || 70,
                        reasons: ['Activation en chaîne après agent primaire'],
                        mandatory: false,
                        chain: true
                    });
                }
            }
        });
    }

    applyAgentChains(recommendations, analysis) {
        const chains = this.config.activation_rules?.agent_chains;
        if (!chains) return;

        // Applique la chaîne TDD si nécessaire
        if (analysis.tddRequired && chains.tdd_chain?.mandatory) {
            const hasTestWriter = recommendations.some(r => r.agent === 'test-writer-fixer');
            if (!hasTestWriter) {
                recommendations.unshift({
                    agent: 'test-writer-fixer',
                    confidence: 1.0,
                    priority: 100,
                    reasons: ['🔴 TDD CHAIN - Tests obligatoires avant implémentation'],
                    mandatory: true,
                    chain: 'tdd_pre'
                });
            }
        }

        // Applique la chaîne Qualiopi si nécessaire
        if (analysis.complianceRisk === 'high' && chains.qualiopi_chain?.mandatory) {
            const qualiopiiAgents = ['legal-compliance-checker', 'backend-architect', 'test-writer-fixer'];
            qualiopiiAgents.forEach((agentName, index) => {
                const exists = recommendations.some(r => r.agent === agentName);
                if (!exists) {
                    recommendations.push({
                        agent: agentName,
                        confidence: 1.0,
                        priority: 95 - index,
                        reasons: ['🏛️ QUALIOPI CHAIN - Conformité obligatoire'],
                        mandatory: true,
                        chain: 'qualiopi'
                    });
                }
            });
        }
    }

    matchPattern(filePath, pattern) {
        // Implémentation simple de matching de pattern
        const regex = pattern
            .replace(/\*\*/g, '.*')
            .replace(/\*/g, '[^/]*');
        return new RegExp(regex).test(filePath);
    }

    /**
     * Génère un rapport d'activation pour l'utilisateur
     * @param {Array} recommendations - Recommandations d'agents
     * @param {Object} analysis - Analyse contextuelle
     * @returns {string} Rapport formaté
     */
    generateActivationReport(recommendations, analysis) {
        if (recommendations.length === 0) {
            return "ℹ️  Aucun agent spécialisé recommandé pour cette tâche.";
        }

        let report = "\n🤖 **AGENTS RECOMMANDÉS**\n\n";
        
        const mandatory = recommendations.filter(r => r.mandatory);
        const optional = recommendations.filter(r => !r.mandatory);

        if (mandatory.length > 0) {
            report += "🔴 **AGENTS OBLIGATOIRES:**\n";
            mandatory.forEach((rec, index) => {
                report += `${index + 1}. **${rec.agent}** (priorité: ${rec.priority})\n`;
                report += `   📊 Confiance: ${(rec.confidence * 100).toFixed(1)}%\n`;
                report += `   💡 Raisons: ${rec.reasons.join(', ')}\n\n`;
            });
        }

        if (optional.length > 0) {
            report += "💡 **AGENTS RECOMMANDÉS:**\n";
            optional.forEach((rec, index) => {
                report += `${index + 1}. **${rec.agent}** (priorité: ${rec.priority})\n`;
                report += `   📊 Confiance: ${(rec.confidence * 100).toFixed(1)}%\n`;
                report += `   💡 Raisons: ${rec.reasons.join(', ')}\n\n`;
            });
        }

        // Ajoute les informations contextuelles
        report += "📋 **ANALYSE CONTEXTUELLE:**\n";
        report += `• Mots-clés détectés: ${analysis.keywords.join(', ') || 'aucun'}\n`;
        report += `• Risque conformité: ${analysis.complianceRisk}\n`;
        report += `• TDD requis: ${analysis.tddRequired ? 'Oui' : 'Non'}\n`;
        report += `• Urgence: ${analysis.urgency}\n\n`;

        return report;
    }

    /**
     * Point d'entrée principal pour le routing d'agents
     * @param {string} userInput - Demande utilisateur
     * @param {Array} changedFiles - Fichiers modifiés
     * @param {string} currentContext - Contexte actuel
     * @returns {Object} Résultat complet du routing
     */
    route(userInput, changedFiles = [], currentContext = '') {
        if (!this.config) {
            return {
                error: "Configuration des agents non disponible",
                recommendations: [],
                report: "❌ Impossible de charger la configuration des agents"
            };
        }

        const analysis = this.analyzeContext(userInput, changedFiles, currentContext);
        const recommendations = this.routeAgents(analysis);
        const report = this.generateActivationReport(recommendations, analysis);

        // Log l'activation pour les métriques
        this.activationLog.push({
            timestamp: new Date().toISOString(),
            userInput: userInput.substring(0, 100),
            recommendations: recommendations.map(r => ({ 
                agent: r.agent, 
                confidence: r.confidence, 
                mandatory: r.mandatory 
            })),
            analysis: analysis
        });

        return {
            analysis,
            recommendations,
            report,
            success: true
        };
    }

    /**
     * Méthode utilitaire pour tester le système
     * @param {string} testInput - Entrée de test
     */
    test(testInput) {
        console.log(`\n🧪 TEST: "${testInput}"\n`);
        const result = this.route(testInput);
        console.log(result.report);
        return result;
    }
}

// Export pour utilisation en module
export default QualiopiiAgentRouter;

// Utilisation en CLI si exécuté directement
if (import.meta.url === `file://${process.argv[1]}`) {
    const router = new QualiopiiAgentRouter();
    
    const testCases = [
        "Je veux implémenter l'authentification Qualiopi avec des données RGPD",
        "Créer un composant dashboard pour les indicateurs de formation", 
        "Fixer un bug dans l'API multi-tenant",
        "Ajouter des tests pour le module de conformité",
        "Optimiser les performances de l'interface utilisateur"
    ];

    console.log("🚀 Test du système de routing d'agents Qualiopii\n");
    
    testCases.forEach(testCase => {
        router.test(testCase);
    });

    console.log("\n✅ Tests terminés!");
}