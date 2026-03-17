import { jsPDF } from 'jspdf';
import type { InsightReport, AllAnswers } from '@/types/feedback';
import { BOTTLENECK_CARDS, KNOWLEDGE_SOURCES, INTEGRATION_OPTIONS } from '@/types/feedback';

const ROLE_LABELS: Record<string, string> = {
  vpe: 'VP Engineering', cto: 'CTO', em: 'Eng Manager', staff: 'Staff Engineer',
  senior: 'Senior Engineer', director: 'Director of Eng', devex: 'DevEx / Platform', principal: 'Principal Engineer',
};

const COLORS = {
  bg: [255, 255, 255] as [number, number, number],
  primary: [37, 99, 235] as [number, number, number], // Royal Blue
  title: [15, 23, 42] as [number, number, number],   // Navy
  text: [30, 41, 59] as [number, number, number],    // Dark Slate
  muted: [100, 116, 139] as [number, number, number],
  danger: [220, 38, 38] as [number, number, number],
  warning: [217, 119, 6] as [number, number, number],
  success: [22, 163, 74] as [number, number, number],
  cardBg: [248, 250, 252] as [number, number, number],
  border: [226, 232, 240] as [number, number, number],
};

export function useExportFeedback() {
  const renderDoc = (report: InsightReport, answers: AllAnswers, sessionId?: string): jsPDF => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = 210;
    const pageH = 297;
    const margin = 20;
    const contentW = pageW - margin * 2;
    let y = margin;

    const applyBackground = () => {
      doc.setFillColor(...COLORS.bg);
      doc.rect(0, 0, pageW, pageH, 'F');
      
      // Professional header line
      doc.setDrawColor(...COLORS.primary);
      doc.setLineWidth(0.5);
      doc.line(margin, 15, pageW - margin, 15);

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.muted);
      doc.setFont('helvetica', 'normal');
      doc.text('RocketBoard Strategic Analysis - Confidential', margin, pageH - 12);
      doc.text(`Page ${doc.getNumberOfPages()}`, pageW / 2, pageH - 12, { align: 'center' });
      doc.text(`${new Date().toLocaleDateString()}`, pageW - margin, pageH - 12, { align: 'right' });
    };

    const checkPage = (needed = 20) => {
      if (y + needed > 275) {
        doc.addPage();
        applyBackground();
        y = margin + 10;
      }
    };

    const sectionHeading = (text: string) => {
      checkPage(15);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.title);
      doc.text(text.toUpperCase(), margin, y);
      y += 2;
      doc.setDrawColor(...COLORS.border);
      doc.setLineWidth(0.2);
      doc.line(margin, y, margin + contentW, y);
      y += 8;
    };

    // --- COVER PAGE ---
    applyBackground();
    y = 80;
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.title);
    doc.text('Engineering Onboarding', margin, y);
    y += 12;
    doc.text('Strategic Insight Report', margin, y);
    
    y += 25;
    const ch1 = answers[1] || {};
    const roleLabel = ROLE_LABELS[ch1.role as string] || (ch1.role as string) || 'Engineering Leader';
    doc.setFontSize(16);
    doc.setTextColor(...COLORS.primary);
    doc.text(`Executive Briefing: ${roleLabel}`, margin, y);
    
    y += 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.text);
    const meta = [
      ch1.company_size_eng ? `${ch1.company_size_eng} Engineers` : null,
      ch1.work_mode ? (ch1.work_mode as string).replace('_', ' ') : null
    ].filter(Boolean).join(' | ');
    doc.text(meta, margin, y);

    y += 40;
    // Executive Metrics
    doc.setFillColor(...COLORS.cardBg);
    doc.roundedRect(margin, y, contentW, 40, 2, 2, 'F');
    
    const renderMetric = (label: string, score: number, xOff: number) => {
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.muted);
      doc.setFont('helvetica', 'bold');
      doc.text(label.toUpperCase(), margin + xOff, y + 15);
      
      doc.setFontSize(24);
      const color = score <= 3 ? COLORS.success : score <= 6 ? COLORS.warning : COLORS.danger;
      doc.setTextColor(...color);
      doc.text(`${score.toFixed(1)}/10`, margin + xOff, y + 28);
    };

    renderMetric('Onboarding Friction', report.frictionScore || 0, 10);
    renderMetric('Strategic Alignment Index', report.visionScore ?? 0, contentW / 2 + 10);

    // --- PAGE 2: EXECUTIVE SUMMARY ---
    doc.addPage();
    applyBackground();
    y = margin + 15;
    sectionHeading('Executive Strategic Summary');

    const generateSummary = () => {
      const { frictionScore, visionScore, keyThemes, topBottlenecks } = report;
      const role = ROLE_LABELS[keyThemes.role || ''] || keyThemes.role || 'Engineering Leader';
      
      // 1. Current State
      const frictionLevel = frictionScore > 7 ? 'Critical' : frictionScore > 4 ? 'Moderate' : 'Low';
      const stateNarrative = `Based on the diagnostic data provided, the engineering organization is currently facing ${frictionLevel.toLowerCase()} operational friction (Score: ${frictionScore.toFixed(1)}/10). For a team of this profile, this indicates ${
        frictionScore > 7 
          ? 'significant systemic drag that is likely impacting time-to-market and developer retention.' 
          : 'pockets of inefficiency that, while manageable now, will likely compound as the team scales.'
      }`;

      // 2. Primary Friction Mapping
      const top3Names = topBottlenecks.slice(0, 3).map(id => BOTTLENECK_CARDS.find(c => c.id === id)?.label).filter(Boolean);
      const bottleneckNarrative = `The primary drivers of this friction are identified as: ${top3Names.join(', ')}. These bottlenecks suggest a core breakdown in ${
        topBottlenecks.includes('scattered_docs') || topBottlenecks.includes('stale_info') 
          ? 'knowledge discoverability and documentation lifecycle management.' 
          : 'access workflows and organizational context sharing.'
      }`;

      // 3. Strategic Recommendations
      const recommendation = `To achieve a Strategic Alignment Index of 10/10, the organization should prioritize transitioning toward a "Self-Teaching" internal ecosystem. By leveraging technical moats like Zero-Hallucination AI and Citation Grounding, you can neutralize ${top3Names[0] || 'your core bottlenecks'} and reduce the cognitive load on senior mentors.`;

      return { stateNarrative, bottleneckNarrative, recommendation };
    };

    const summary = generateSummary();

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.primary);
    doc.text('I. CURRENT STATE ANALYSIS', margin, y);
    y += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.text);
    let lines = doc.splitTextToSize(summary.stateNarrative, contentW);
    doc.text(lines, margin, y);
    y += lines.length * 5 + 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.primary);
    doc.text('II. PRIMARY FRICTION MAPPING', margin, y);
    y += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.text);
    lines = doc.splitTextToSize(summary.bottleneckNarrative, contentW);
    doc.text(lines, margin, y);
    y += lines.length * 5 + 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.primary);
    doc.text('III. STRATEGIC RECOMMENDATION', margin, y);
    y += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.text);
    lines = doc.splitTextToSize(summary.recommendation, contentW);
    doc.text(lines, margin, y);
    y += lines.length * 5 + 10;

    // Qualitative Themes if available
    if (report.keyThemes.openText || report.keyThemes.cultureVision) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.primary);
      doc.text('IV. QUALITATIVE OBSERVATIONS', margin, y);
      y += 7;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(...COLORS.muted);
      const observation = `The participant highlighted specific cultural and organizational nuances: "${(report.keyThemes.openText || report.keyThemes.cultureVision || '').substring(0, 200)}..."`;
      lines = doc.splitTextToSize(observation, contentW);
      doc.text(lines, margin, y);
    }

    if (sessionId) {
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.muted);
      doc.text(`Reference ID: ${sessionId}`, margin, pageH - 25);
    }

    // --- PAGE 2: BOTTLENECKS ---
    doc.addPage();
    applyBackground();
    y = margin + 15;
    sectionHeading('Operational Bottlenecks');
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.text);
    const intro = doc.splitTextToSize('The following table outlines the primary friction points identified within the engineering team\'s current onboarding lifecycle, ranked by their strategic priority.', contentW);
    doc.text(intro, margin, y);
    y += 15;

    (report.topBottlenecks || []).forEach((id, idx) => {
      const card = BOTTLENECK_CARDS.find(c => c.id === id);
      if (!card) return;
      
      checkPage(30);
      doc.setFillColor(...COLORS.cardBg);
      doc.roundedRect(margin, y, contentW, 22, 1, 1, 'F');
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.title);
      doc.text(`${idx + 1}. ${card.label}`, margin + 5, y + 8);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.text);
      const lines = doc.splitTextToSize(card.desc, contentW - 40);
      doc.text(lines, margin + 5, y + 14);
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      const rankColor = idx === 0 ? COLORS.danger : idx === 1 ? COLORS.warning : COLORS.primary;
      doc.setTextColor(...rankColor);
      doc.text(`PRIORITY LEVEL: ${idx + 1}`, margin + contentW - 5, y + 8, { align: 'right' });
      
      y += 28;
    });

    // --- PAGE 3: ECOSYSTEM ---
    doc.addPage();
    applyBackground();
    y = margin + 15;
    sectionHeading('Knowledge Ecosystem & Tooling');
    
    // Knowledge Sources
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.title);
    doc.text('Current Knowledge Sources', margin, y);
    y += 8;

    const ch4 = answers[4] || {};
    const sources = (ch4.knowledge_sources as string[]) || [];
    const freshness = (ch4.source_freshness as Record<string, string>) || {};

    if (sources.length > 0) {
      sources.forEach(id => {
        const src = KNOWLEDGE_SOURCES.find(s => s.id === id);
        if (!src) return;
        checkPage(10);
        const fresh = freshness[id];
        const status = fresh === 'fresh' ? '(Optimized)' : fresh === 'stale' ? '(Needs Audit)' : '(Mixed)';
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...COLORS.text);
        doc.text(`- ${src.label}`, margin + 5, y);
        doc.setTextColor(...COLORS.muted);
        doc.text(status, margin + 55, y);
        y += 6;
      });
      y += 10;
    }

    // Integrations
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.title);
    doc.text('Target Integration Requirements', margin, y);
    y += 8;

    const ints = report.mustHaveIntegrations || [];
    ints.forEach((id, idx) => {
      const int = INTEGRATION_OPTIONS.find(i => i.id === id);
      if (!int) return;
      checkPage(10);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.text);
      doc.text(`${idx + 1}. ${int.label}`, margin + 5, y);
      y += 6;
    });

    // --- PAGE 4: STRATEGIC INSIGHTS ---
    if (report.keyThemes && Object.values(report.keyThemes).some(v => v && String(v).trim())) {
      doc.addPage();
      applyBackground();
      y = margin + 15;
      sectionHeading('Strategic Qualitative Analysis');
      
      const themes = report.keyThemes;
      const renderSection = (title: string, content?: string) => {
        if (!content || !content.trim()) return;
        checkPage(25);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.primary);
        doc.text(title, margin, y);
        y += 6;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...COLORS.text);
        const lines = doc.splitTextToSize(content, contentW - 5);
        doc.text(lines, margin, y);
        y += lines.length * 5 + 8;
      };

      renderSection('Workflow & Access Friction', themes.accessStory);
      renderSection('Organizational Culture', themes.cultureVision);
      renderSection('Governance & Compliance', themes.redlineSources);
      renderSection('AI Security Integration', themes.aiGovernance);
      renderSection('Platform Scaling Strategy', themes.postMonth1);
      renderSection('Additional Observations', themes.openText);
    }

    // --- PAGE 5: AUDIT LOG ---
    doc.addPage();
    applyBackground();
    y = margin + 15;
    sectionHeading('Response Audit Log');
    
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.muted);
    doc.text('Detailed trace of raw participant responses for data integrity and archival purposes.', margin, y);
    y += 10;

    Object.entries(answers).sort((a, b) => Number(a[0]) - Number(b[0])).forEach(([chNum, chData]) => {
      checkPage(20);
      doc.setFillColor(...COLORS.cardBg);
      doc.rect(margin, y - 5, contentW, 7, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.title);
      doc.text(`CHAPTER ${chNum}`, margin + 3, y);
      y += 8;

      Object.entries(chData).forEach(([key, val]) => {
        checkPage(10);
        const displayVal = Array.isArray(val) ? val.join(', ') : typeof val === 'object' ? JSON.stringify(val) : String(val ?? 'N/A');
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.text);
        doc.text(`${key}:`, margin + 5, y);
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...COLORS.text);
        const lines = doc.splitTextToSize(displayVal, contentW - 40);
        doc.text(lines, margin + 40, y);
        y += Math.max(lines.length * 4, 6);
      });
      y += 6;
    });

    return doc;
  };

  const generatePDF = (report: InsightReport, answers: AllAnswers, sessionId?: string): void => {
    const doc = renderDoc(report, answers, sessionId);
    doc.save(`rocketboard-analysis-${sessionId || Date.now()}.pdf`);
  };

  const generatePDFBase64 = (report: InsightReport, answers: AllAnswers, sessionId?: string): string => {
    const doc = renderDoc(report, answers, sessionId);
    return doc.output('datauristring').split(',')[1];
  };

  return { generatePDF, generatePDFBase64 };
}
