import { jsPDF } from 'jspdf';
import type { InsightReport, AllAnswers } from '@/types/feedback';
import { BOTTLENECK_CARDS, KNOWLEDGE_SOURCES, INTEGRATION_OPTIONS } from '@/types/feedback';

const ROLE_LABELS: Record<string, string> = {
  vpe: 'VP Engineering', cto: 'CTO', em: 'Eng Manager', staff: 'Staff Engineer',
  senior: 'Senior Engineer', director: 'Director of Eng', devex: 'DevEx / Platform', principal: 'Principal Engineer',
};

export function useExportFeedback() {
  const generatePDF = (report: InsightReport, answers: AllAnswers, sessionId?: string): void => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = 210;
    const margin = 20;
    const contentW = pageW - margin * 2;
    let y = margin;

    // ──────────────────────────────────────
    // Helper utilities
    // ──────────────────────────────────────
    const lineBreak = (extra = 6) => { y += extra; };

    const checkPage = (needed = 20) => {
      if (y + needed > 275) {
        doc.addPage();
        y = margin;
      }
    };

    const heading = (text: string, size = 14, color: [number, number, number] = [99, 102, 241]) => {
      checkPage(12);
      doc.setFontSize(size);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...color);
      doc.text(text, margin, y);
      y += size * 0.5 + 2;
    };

    const subheading = (text: string, size = 11) => {
      checkPage(10);
      doc.setFontSize(size);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(150, 150, 170);
      doc.text(text, margin, y);
      y += size * 0.45 + 2;
    };

    const body = (text: string, size = 9, indent = 0) => {
      checkPage(8);
      doc.setFontSize(size);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(200, 200, 220);
      const lines = doc.splitTextToSize(text, contentW - indent);
      doc.text(lines, margin + indent, y);
      y += lines.length * (size * 0.45 + 1.5);
    };

    const pill = (text: string, x: number, yPos: number, bg: [number, number, number] = [40, 40, 70]) => {
      const w = doc.getTextWidth(text) + 6;
      doc.setFillColor(...bg);
      doc.roundedRect(x, yPos - 4, w, 6, 1.5, 1.5, 'F');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(180, 180, 220);
      doc.text(text, x + 3, yPos);
      return w + 4;
    };

    const divider = () => {
      checkPage(6);
      doc.setDrawColor(50, 50, 80);
      doc.setLineWidth(0.3);
      doc.line(margin, y, margin + contentW, y);
      y += 5;
    };

    const scoreBar = (label: string, score: number, max = 10) => {
      checkPage(12);
      const pct = score / max;
      const barW = contentW * 0.55;
      const barH = 4;
      const color: [number, number, number] = score <= 3 ? [16, 185, 129] : score <= 6 ? [245, 158, 11] : [239, 68, 68];

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(200, 200, 220);
      doc.text(label, margin, y);

      const scoreText = `${score.toFixed(1)} / ${max}`;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...color);
      doc.text(scoreText, margin + contentW, y, { align: 'right' });

      y += 4;
      doc.setFillColor(35, 35, 55);
      doc.roundedRect(margin, y, barW, barH, 1, 1, 'F');
      doc.setFillColor(...color);
      doc.roundedRect(margin, y, barW * pct, barH, 1, 1, 'F');
      y += barH + 5;
    };

    // ──────────────────────────────────────
    // PAGE 1 — COVER
    // ──────────────────────────────────────
    // Dark background
    doc.setFillColor(15, 15, 25);
    doc.rect(0, 0, 210, 297, 'F');

    // Header accent bar
    doc.setFillColor(99, 102, 241);
    doc.rect(0, 0, 210, 2, 'F');

    // Title block
    y = 55;
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(99, 102, 241);
    doc.text('Engineering Onboarding', margin, y);
    y += 11;
    doc.text('Insight Report', margin, y);
    y += 8;

    doc.setFontSize(13);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(140, 140, 180);
    const ch1 = answers[1] || {};
    const roleLabel = ROLE_LABELS[ch1.role as string] || (ch1.role as string) || 'Engineering Leader';
    doc.text(`Personalized for ${roleLabel}`, margin, y);
    y += 7;

    if (ch1.company_size_eng) {
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 140);
      doc.text(`Team size: ${ch1.company_size_eng} engineers · ${(ch1.work_mode as string || '').replace('_', ' ')}`, margin, y);
      y += 6;
    }

    y += 10;
    divider();

    // Cover Scores
    const scores = [
      { label: 'Friction Score', score: report.frictionScore || 0 },
      { label: 'Vision Fit Score', score: report.visionScore ?? 0 },
    ];
    scores.forEach(s => scoreBar(s.label, s.score));

    y += 8;
    doc.setFontSize(8);
    doc.setTextColor(70, 70, 100);
    const now = new Date();
    doc.text(`Generated: ${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, margin, y);
    if (sessionId) {
      y += 5;
      doc.text(`Session ID: ${sessionId}`, margin, y);
    }

    // ──────────────────────────────────────
    // PAGE 2 — TOP BOTTLENECKS
    // ──────────────────────────────────────
    doc.addPage();
    doc.setFillColor(15, 15, 25);
    doc.rect(0, 0, 210, 297, 'F');
    doc.setFillColor(99, 102, 241);
    doc.rect(0, 0, 210, 2, 'F');
    y = margin;

    heading('🚧 Top Bottlenecks', 16);
    lineBreak(2);

    const topBottlenecks = report.topBottlenecks || [];
    if (topBottlenecks.length > 0) {
      topBottlenecks.forEach((id, idx) => {
        const card = BOTTLENECK_CARDS.find(c => c.id === id);
        if (!card) return;
        checkPage(22);

        const rankColors: [number, number, number][] = [[239, 68, 68], [245, 158, 11], [99, 102, 241]];
        const bg: [number, number, number] = [22, 22, 38];

        doc.setFillColor(...bg);
        doc.roundedRect(margin, y, contentW, 18, 3, 3, 'F');

        doc.setFillColor(...(rankColors[idx] || [99, 102, 241]));
        doc.circle(margin + 8, y + 9, 5, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text(`${idx + 1}`, margin + 8, y + 9 + 3, { align: 'center' });

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(220, 220, 240);
        doc.text(card.label, margin + 18, y + 7);

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(130, 130, 160);
        doc.text(card.desc, margin + 18, y + 13);

        const rankLabel = idx === 0 ? '#1 Priority' : idx === 1 ? '#2 Priority' : '#3 Priority';
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...(rankColors[idx] || [99, 102, 241]));
        doc.text(rankLabel, margin + contentW - 4, y + 9, { align: 'right' });

        y += 22;
      });
    } else {
      body('No bottlenecks recorded.');
    }

    lineBreak();
    divider();

    // Impact Ratings section
    const ch3 = answers[3] || {};
    const impactKeys = ['frustration', 'time_to_productivity', 'mentor_bandwidth', 'attrition_risk', 'knowledge_loss'];
    const impactLabels: Record<string, string> = {
      frustration: 'New Hire Frustration',
      time_to_productivity: 'Time to Productivity',
      mentor_bandwidth: 'Mentor Bandwidth',
      attrition_risk: 'Attrition Risk',
      knowledge_loss: 'Knowledge Loss Risk',
    };

    const hasImpact = impactKeys.some(k => ch3[k] !== undefined);
    if (hasImpact) {
      heading('📊 Impact Ratings', 13);
      lineBreak(2);
      impactKeys.forEach(k => {
        const val = Number(ch3[k]);
        if (!isNaN(val)) scoreBar(impactLabels[k] || k, val);
      });
    }

    // ──────────────────────────────────────
    // PAGE 3 — KNOWLEDGE & INTEGRATIONS
    // ──────────────────────────────────────
    doc.addPage();
    doc.setFillColor(15, 15, 25);
    doc.rect(0, 0, 210, 297, 'F');
    doc.setFillColor(6, 182, 212);
    doc.rect(0, 0, 210, 2, 'F');
    y = margin;

    heading('📚 Knowledge Ecosystem', 16, [6, 182, 212]);
    lineBreak(2);

    const ch4 = answers[4] || {};
    const knowledgeSources = (ch4.knowledge_sources as string[]) || [];
    const sourceFreshness = (ch4.source_freshness as Record<string, string>) || {};

    if (knowledgeSources.length > 0) {
      let pillX = margin;
      knowledgeSources.forEach(id => {
        const src = KNOWLEDGE_SOURCES.find(s => s.id === id);
        if (!src) return;
        const freshness = sourceFreshness[id];
        const bg: [number, number, number] = freshness === 'fresh'
          ? [16, 60, 40] : freshness === 'stale' ? [60, 16, 16] : [40, 35, 16];
        const text = `${src.label}${freshness ? ` (${freshness})` : ''}`;
        const w = doc.getTextWidth(text) + 10;
        if (pillX + w > margin + contentW) { pillX = margin; y += 9; }
        checkPage(10);
        doc.setFillColor(...bg);
        doc.roundedRect(pillX, y - 4, w, 6, 1.5, 1.5, 'F');
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(200, 220, 200);
        doc.text(text, pillX + 4, y);
        pillX += w + 3;
      });
      y += 9;
    } else {
      body('No knowledge sources recorded.');
    }

    lineBreak(4);
    divider();

    heading('🔌 Must-Have Integrations', 14, [6, 182, 212]);
    lineBreak(2);

    const mustHaveInts = report.mustHaveIntegrations || [];
    if (mustHaveInts.length > 0) {
      let intX = margin;
      mustHaveInts.forEach((id, idx) => {
        const integration = INTEGRATION_OPTIONS.find(i => i.id === id);
        if (!integration) return;
        const text = `${idx + 1}. ${integration.label}`;
        const w = doc.getTextWidth(text) + 10;
        if (intX + w > margin + contentW) { intX = margin; y += 9; }
        checkPage(10);
        pill(text, intX, y, [30, 30, 60]);
        intX += w + 3;
      });
      y += 12;
    } else {
      body('No must-have integrations recorded.');
    }

    lineBreak(4);
    divider();

    // Vision & key themes
    heading('🎯 Vision Reaction & Key Themes', 14, [6, 182, 212]);
    lineBreak(2);

    const ch8 = answers[8] || {};
    if (ch8.vision_score !== undefined) {
      scoreBar('Vision Platform Fit', Number(ch8.vision_score));
    }

    if (report.keyThemes) {
      const themes = report.keyThemes;
      if (themes.workMode) {
        subheading('Work Model');
        body(String(themes.workMode).replace('_', ' '), 9, 4);
        lineBreak(2);
      }
      if ((themes.productivityMetrics as string[])?.length > 0) {
        subheading('Success Metrics');
        body((themes.productivityMetrics as string[]).join(', '), 9, 4);
        lineBreak(2);
      }
      if (themes.openText) {
        subheading('Open Feedback');
        body(String(themes.openText), 9, 4);
        lineBreak(2);
      }
    }

    // ──────────────────────────────────────
    // PAGE 4 — RAW AUDIT LOG
    // ──────────────────────────────────────
    doc.addPage();
    doc.setFillColor(15, 15, 25);
    doc.rect(0, 0, 210, 297, 'F');
    doc.setFillColor(239, 68, 68);
    doc.rect(0, 0, 210, 2, 'F');
    y = margin;

    heading('🗂️ Full Response Audit Log', 16, [239, 68, 68]);
    doc.setFontSize(7);
    doc.setTextColor(80, 80, 100);
    doc.text(`Timestamped: ${new Date().toISOString()}`, margin, y);
    y += 8;
    divider();

    const chapterLabels: Record<number, string> = {
      1: 'Snapshot', 2: 'Reality Anchor', 3: 'Bottlenecks & Impact',
      4: 'Knowledge & Data', 5: 'Integrations', 6: 'Ideal Services',
      7: 'Competitive', 8: 'Vision Reaction', 9: 'Adoption & Business', 10: 'Closing',
    };

    Object.entries(answers).sort((a, b) => Number(a[0]) - Number(b[0])).forEach(([chNum, chAnswers]) => {
      checkPage(15);
      const label = chapterLabels[Number(chNum)] || `Chapter ${chNum}`;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(99, 102, 241);
      doc.text(`Chapter ${chNum}: ${label}`, margin, y);
      y += 7;

      Object.entries(chAnswers).forEach(([key, val]) => {
        checkPage(12);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(150, 150, 180);
        doc.text(`${key}:`, margin + 3, y);
        y += 5;

        let displayVal = '';
        if (Array.isArray(val)) {
          displayVal = val.join(', ');
        } else if (typeof val === 'object' && val !== null) {
          displayVal = JSON.stringify(val, null, 2);
        } else {
          displayVal = String(val ?? '—');
        }

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(200, 200, 220);
        const lines = doc.splitTextToSize(displayVal, contentW - 8);
        lines.forEach((line: string) => {
          checkPage(6);
          doc.text(line, margin + 6, y);
          y += 5;
        });
        y += 2;
      });

      divider();
    });

    // ──────────────────────────────────────
    // Save
    // ──────────────────────────────────────
    const filename = `onboarding-insight-report-${sessionId || Date.now()}.pdf`;
    doc.save(filename);
  };

  const generatePDFBase64 = (report: InsightReport, answers: AllAnswers, sessionId?: string): string => {
    // Re-create the same doc but return base64 instead of saving
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = 210;
    const margin = 20;
    const contentW = pageW - margin * 2;
    let y = margin;

    const checkPage = (needed = 20) => {
      if (y + needed > 275) { doc.addPage(); y = margin; }
    };
    const divider = () => {
      checkPage(6);
      doc.setDrawColor(50, 50, 80); doc.setLineWidth(0.3);
      doc.line(margin, y, margin + contentW, y); y += 5;
    };
    const body = (text: string, size = 9, indent = 0) => {
      checkPage(8);
      doc.setFontSize(size); doc.setFont('helvetica', 'normal');
      doc.setTextColor(200, 200, 220);
      const lines = doc.splitTextToSize(text, contentW - indent);
      doc.text(lines, margin + indent, y);
      y += lines.length * (size * 0.45 + 1.5);
    };

    // Cover page
    doc.setFillColor(15, 15, 25); doc.rect(0, 0, 210, 297, 'F');
    doc.setFillColor(99, 102, 241); doc.rect(0, 0, 210, 2, 'F');
    y = 55;
    doc.setFontSize(22); doc.setFont('helvetica', 'bold');
    doc.setTextColor(99, 102, 241);
    doc.text('Engineering Onboarding Insight Report', margin, y); y += 12;
    doc.setFontSize(10); doc.setFont('helvetica', 'normal');
    doc.setTextColor(140, 140, 180);
    const ch1b = answers[1] || {};
    doc.text(`Friction Score: ${(report.frictionScore || 0).toFixed(1)} / 10 · Vision Fit: ${report.visionScore ?? 0} / 10`, margin, y); y += 7;
    doc.text(`Generated: ${new Date().toISOString()}`, margin, y); y += 7;
    if (sessionId) { doc.text(`Session: ${sessionId}`, margin, y); y += 7; }
    divider();

    // Bottlenecks
    doc.setFontSize(13); doc.setFont('helvetica', 'bold'); doc.setTextColor(99, 102, 241);
    doc.text('Top Bottlenecks', margin, y); y += 8;
    const topBots = report.topBottlenecks || [];
    topBots.forEach((id, idx) => {
      const card = BOTTLENECK_CARDS.find(c => c.id === id);
      if (card) body(`${idx + 1}. ${card.label} — ${card.desc}`, 9, 4);
    });
    divider();

    // Audit log pages
    const chapterLabels: Record<number, string> = {
      1: 'Snapshot', 2: 'Reality', 3: 'Bottlenecks',
      4: 'Knowledge', 5: 'Integrations', 6: 'Services',
      7: 'Competitive', 8: 'Vision', 9: 'Adoption', 10: 'Closing',
    };
    Object.entries(answers).sort((a, b) => Number(a[0]) - Number(b[0])).forEach(([chNum, chAnswers]) => {
      checkPage(15);
      doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(99, 102, 241);
      doc.text(`Ch ${chNum}: ${chapterLabels[Number(chNum)] || `Chapter ${chNum}`}`, margin, y); y += 7;
      Object.entries(chAnswers).forEach(([key, val]) => {
        checkPage(10);
        const displayVal = Array.isArray(val) ? val.join(', ') : typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val ?? '—');
        body(`${key}: ${displayVal}`, 8, 3);
      });
      y += 3;
    });

    return doc.output('datauristring').split(',')[1]; // base64 only
  };

  return { generatePDF, generatePDFBase64 };
}
