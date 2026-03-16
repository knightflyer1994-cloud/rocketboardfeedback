import { jsPDF } from 'jspdf';
import type { InsightReport, AllAnswers } from '@/types/feedback';
import { BOTTLENECK_CARDS, KNOWLEDGE_SOURCES, INTEGRATION_OPTIONS } from '@/types/feedback';

const ROLE_LABELS: Record<string, string> = {
  vpe: 'VP Engineering', cto: 'CTO', em: 'Eng Manager', staff: 'Staff Engineer',
  senior: 'Senior Engineer', director: 'Director of Eng', devex: 'DevEx / Platform', principal: 'Principal Engineer',
};

const COLORS = {
  bg: [15, 15, 25] as [number, number, number],
  primary: [99, 102, 241] as [number, number, number],
  accent: [6, 182, 212] as [number, number, number],
  danger: [239, 68, 68] as [number, number, number],
  warning: [245, 158, 11] as [number, number, number],
  success: [16, 185, 129] as [number, number, number],
  text: [229, 231, 235] as [number, number, number],
  muted: [148, 163, 184] as [number, number, number],
  card: [30, 30, 48] as [number, number, number],
  border: [51, 51, 75] as [number, number, number],
};

export function useExportFeedback() {
  const renderDoc = (report: InsightReport, answers: AllAnswers, sessionId?: string): jsPDF => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = 210;
    const pageH = 297;
    const margin = 20;
    const contentW = pageW - margin * 2;
    let y = margin;

    const lineBreak = (extra = 6) => { y += extra; };

    // Helper: Apply background to current page
    const applyBackground = () => {
      doc.setFillColor(...COLORS.bg);
      doc.rect(0, 0, pageW, pageH, 'F');
      // Header accent bar
      doc.setFillColor(...COLORS.primary);
      doc.rect(0, 0, pageW, 1.5, 'F');
      
      // Footer
      doc.setFontSize(7);
      doc.setTextColor(...COLORS.muted);
      doc.setFont('helvetica', 'normal');
      doc.text('© RocketBoard Engineering · Research Report · Confidential', margin, pageH - 10);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageW - margin, pageH - 10, { align: 'right' });
    };

    const checkPage = (needed = 20) => {
      if (y + needed > 275) {
        doc.addPage();
        applyBackground();
        y = margin + 5;
      }
    };

    const heading = (text: string, size = 16, color = COLORS.primary) => {
      checkPage(15);
      doc.setFontSize(size);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...color);
      doc.text(text, margin, y);
      y += 8;
    };

    const subheading = (text: string, size = 11, color = COLORS.muted) => {
      checkPage(10);
      doc.setFontSize(size);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...color);
      doc.text(text, margin, y);
      y += 6;
    };

    const body = (text: string, size = 9, color = COLORS.text, indent = 0) => {
      checkPage(8);
      doc.setFontSize(size);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...color);
      const lines = doc.splitTextToSize(text, contentW - indent);
      doc.text(lines, margin + indent, y);
      y += lines.length * 5;
    };

    const scoreBar = (label: string, score: number, max = 10) => {
      checkPage(15);
      const pct = Math.min(score / max, 1);
      const barW = contentW * 0.6;
      const barH = 3;
      const color = score <= 3 ? COLORS.success : score <= 6 ? COLORS.warning : COLORS.danger;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.text);
      doc.text(label, margin, y);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...color);
      doc.text(`${score.toFixed(1)}/${max}`, margin + contentW, y, { align: 'right' });

      y += 3;
      doc.setFillColor(40, 40, 60);
      doc.roundedRect(margin, y, barW, barH, 0.5, 0.5, 'F');
      doc.setFillColor(...color);
      doc.roundedRect(margin, y, barW * pct, barH, 0.5, 0.5, 'F');
      y += 8;
    };

    const renderCard = (title: string, desc: string, icon: string, rank: number, color: [number, number, number]) => {
      checkPage(25);
      doc.setFillColor(...COLORS.card);
      doc.setDrawColor(...COLORS.border);
      doc.roundedRect(margin, y, contentW, 20, 3, 3, 'FD');

      // Rank Circle
      doc.setFillColor(...color);
      doc.circle(margin + 10, y + 10, 4, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(`${rank}`, margin + 10, y + 11.5, { align: 'center' });

      // Content
      doc.setTextColor(...COLORS.text);
      doc.setFontSize(10);
      doc.text(title, margin + 20, y + 7);
      
      doc.setTextColor(...COLORS.muted);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(desc, contentW - 35);
      doc.text(lines, margin + 20, y + 12);

      // Rank Label
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...color);
      doc.text(`#${rank} Priority`, margin + contentW - 5, y + 8, { align: 'right' });

      y += 24;
    };

    // --- EXECUTION ---
    applyBackground();

    // COVER
    y = 60;
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.primary);
    doc.text('Engineering Onboarding', margin, y);
    y += 12;
    doc.text('Insight Report', margin, y);
    
    y += 15;
    const ch1 = answers[1] || {};
    const roleLabel = ROLE_LABELS[ch1.role as string] || (ch1.role as string) || 'Engineering Leader';
    doc.setFontSize(14);
    doc.setTextColor(...COLORS.accent);
    doc.text(`Personalized for ${roleLabel}`, margin, y);
    
    y += 8;
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.muted);
    if (ch1.company_size_eng) {
      doc.text(`${ch1.company_size_eng} engineers · ${(ch1.work_mode as string || '').replace('_', ' ')} environment`, margin, y);
    }

    y += 20;
    doc.setDrawColor(...COLORS.border);
    doc.line(margin, y, margin + contentW, y);
    y += 15;

    scoreBar('Onboarding Friction Score', report.frictionScore || 0);
    scoreBar('Vision & Solution Fit', report.visionScore ?? 0);

    if (sessionId) {
      y = pageH - 25;
      doc.setFontSize(7);
      doc.setTextColor(50, 50, 80);
      doc.text(`SESSION_TOKEN: ${sessionId}`, margin, y);
    }

    // PAGE 2: BOTTLENECKS
    doc.addPage();
    applyBackground();
    y = margin + 10;
    heading('🚧 Critical Bottlenecks');
    body('Based on your feedback, these are the primary friction points impacting your engineering team\'s velocity and developer experience.', 9, COLORS.muted);
    y += 5;

    const rankColors: [number, number, number][] = [COLORS.danger, COLORS.warning, COLORS.primary];
    (report.topBottlenecks || []).forEach((id, idx) => {
      const card = BOTTLENECK_CARDS.find(c => c.id === id);
      if (card) renderCard(card.label, card.desc, card.icon, idx + 1, rankColors[idx] || COLORS.primary);
    });

    // PAGE 3: ECOSYSTEM
    doc.addPage();
    applyBackground();
    y = margin + 10;
    heading('📚 Knowledge & Integrations', 16, COLORS.accent);
    
    subheading('Knowledge Sources Mapped');
    const ch4 = answers[4] || {};
    const knowledgeSources = (ch4.knowledge_sources as string[]) || [];
    const sourceFreshness = (ch4.source_freshness as Record<string, string>) || {};
    
    if (knowledgeSources.length > 0) {
      let pillX = margin;
      knowledgeSources.forEach(id => {
        const src = KNOWLEDGE_SOURCES.find(s => s.id === id);
        if (!src) return;
        const fresh = sourceFreshness[id];
        const statusColor = fresh === 'fresh' ? COLORS.success : fresh === 'stale' ? COLORS.danger : COLORS.warning;
        
        const label = `${src.label}`;
        const w = doc.getTextWidth(label) + 12;
        if (pillX + w > margin + contentW) { pillX = margin; y += 10; }
        checkPage(10);
        
        doc.setFillColor(30, 30, 50);
        doc.roundedRect(pillX, y - 4, w, 7, 1, 1, 'F');
        doc.setFillColor(...statusColor);
        doc.circle(pillX + 3, y - 0.5, 1, 'F');
        
        doc.setFontSize(8);
        doc.setTextColor(...COLORS.text);
        doc.text(label, pillX + 6, y);
        pillX += w + 3;
      });
      y += 15;
    }

    subheading('Target Integrations');
    const mustHaveInts = report.mustHaveIntegrations || [];
    if (mustHaveInts.length > 0) {
      let intX = margin;
      mustHaveInts.forEach((id, idx) => {
        const int = INTEGRATION_OPTIONS.find(i => i.id === id);
        if (!int) return;
        const label = `${idx + 1}. ${int.label}`;
        const w = doc.getTextWidth(label) + 10;
        if (intX + w > margin + contentW) { intX = margin; y += 10; }
        checkPage(10);
        doc.setFillColor(40, 40, 80);
        doc.roundedRect(intX, y - 4, w, 7, 1, 1, 'F');
        doc.setFontSize(8);
        doc.setTextColor(200, 200, 255);
        doc.text(label, intX + 5, y);
        intX += w + 3;
      });
      y += 15;
    }

    // PAGE 4: QUALITATIVE INSIGHTS
    if (report.keyThemes && (
      report.keyThemes.accessStory || 
      report.keyThemes.cultureVision || 
      report.keyThemes.redlineSources || 
      report.keyThemes.aiGovernance || 
      report.keyThemes.postMonth1 || 
      report.keyThemes.openText ||
      report.keyThemes.otherIntegrations
    )) {
      doc.addPage();
      applyBackground();
      y = margin + 10;
      heading('💡 Qualitative Insights', 16, COLORS.accent);
      body('This section captures your strategic nuance and specific organizational stories.', 9, COLORS.muted);
      y += 5;

      const themes = report.keyThemes;
      const renderInsight = (title: string, text?: string) => {
        if (!text || text.trim().length === 0) return;
        subheading(title, 10, COLORS.primary);
        body(text, 9, COLORS.text, 2);
        lineBreak(4);
      };

      renderInsight('Access & Onboarding Friction', themes.accessStory);
      renderInsight('Culture & Human Connection', themes.cultureVision);
      renderInsight('Other Critical Systems', themes.otherIntegrations);
      renderInsight('Governance & Red-Lines', themes.redlineSources);
      renderInsight('AI Security & Policy', themes.aiGovernance);
      renderInsight('Long-term Platform Value', themes.postMonth1);
      renderInsight('Final Strategic Thoughts', themes.openText);
    }

    // PAGE 5: RAW DATA
    doc.addPage();
    applyBackground();
    y = margin + 10;
    heading('🗂️ Response Audit Log', 16, COLORS.muted);
    
    Object.entries(answers).sort((a, b) => Number(a[0]) - Number(b[0])).forEach(([chNum, chAnswers]) => {
      checkPage(15);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.primary);
      doc.text(`Chapter ${chNum}`, margin, y);
      y += 6;

      Object.entries(chAnswers).forEach(([key, val]) => {
        checkPage(10);
        const displayVal = Array.isArray(val) ? val.join(', ') : typeof val === 'object' ? JSON.stringify(val) : String(val ?? '—');
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.muted);
        doc.text(`${key}:`, margin + 3, y);
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...COLORS.text);
        const lines = doc.splitTextToSize(displayVal, contentW - 25);
        doc.text(lines, margin + 25, y);
        y += lines.length * 4 + 2;
      });
      y += 4;
    });

    return doc;
  };

  const generatePDF = (report: InsightReport, answers: AllAnswers, sessionId?: string): void => {
    const doc = renderDoc(report, answers, sessionId);
    const filename = `onboarding-insight-report-${sessionId || Date.now()}.pdf`;
    doc.save(filename);
  };

  const generatePDFBase64 = (report: InsightReport, answers: AllAnswers, sessionId?: string): string => {
    const doc = renderDoc(report, answers, sessionId);
    return doc.output('datauristring').split(',')[1];
  };

  return { generatePDF, generatePDFBase64 };
}
