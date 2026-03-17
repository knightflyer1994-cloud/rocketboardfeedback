import type { InsightReport as InsightReportType, AllAnswers } from '@/types/feedback';
import { BOTTLENECK_CARDS, INTEGRATION_OPTIONS } from '@/types/feedback';

export function buildReportEmail(
  report: InsightReportType, 
  answers: AllAnswers,
  contactInfo?: { name?: string; email?: string }
): string {
  const ch1 = answers[1] || {};
  const roleLabels: Record<string, string> = {
    vpe: 'VP Engineering', cto: 'CTO', em: 'Eng Manager', staff: 'Staff Engineer',
    senior: 'Senior Engineer', director: 'Director of Eng', devex: 'DevEx / Platform', principal: 'Principal Engineer',
  };
  const role = roleLabels[ch1.role as string] || (ch1.role as string) || 'Engineering Leader';
  const frictionColor = (report.frictionScore || 0) <= 3 ? '#10b981' : (report.frictionScore || 0) <= 6 ? '#f59e0b' : '#ef4444';
  const topBots = (report.topBottlenecks || []).slice(0, 3).map(id => BOTTLENECK_CARDS.find(c => c.id === id)?.label || id).join(', ');
  const topInts = (report.mustHaveIntegrations || []).slice(0, 3).map(id => INTEGRATION_OPTIONS.find(i => i.id === id)?.label || id).join(', ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Your Engineering Onboarding Insight Report</title>
</head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:'Segoe UI',system-ui,sans-serif;color:#e5e7eb;">
  <div style="max-width:640px;margin:0 auto;padding:0 16px 48px;">

    <!-- Top accent bar -->
    <div style="height:3px;background:linear-gradient(90deg,#6366f1,#06b6d4);border-radius:0 0 3px 3px;"></div>

    <!-- Header -->
    <div style="text-align:center;padding:40px 0 32px;">
      <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.3);border-radius:999px;padding:6px 16px;margin-bottom:20px;">
        <span style="font-size:14px;color:#a5b4fc;font-weight:600;">✨ Your Insight Report is ready</span>
      </div>
      <h1 style="margin:0 0 8px;font-size:28px;font-weight:800;color:#f1f5f9;letter-spacing:-0.5px;">
        Engineering Onboarding<br/>Analysis
      </h1>
      <p style="margin:0;color:#94a3b8;font-size:14px;">
        Personalized for <strong style="color:#e2e8f0;">${role}</strong>
        ${ch1.company_size_eng ? ` · ${ch1.company_size_eng} engineers` : ''}
      </p>
    </div>

    <!-- Contact Info (if provided) -->
    ${contactInfo?.name || contactInfo?.email ? `
    <div style="background:#1e1e2e;border:1px solid #2d2d3a;border-radius:12px;padding:20px;margin-bottom:28px;">
      <h2 style="margin:0 0 12px;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;">👤 Participant Details</h2>
      <div style="font-size:14px;color:#e2e8f0;">
        ${contactInfo.name ? `<p style="margin:0 0 4px;"><strong>Name:</strong> ${contactInfo.name}</p>` : ''}
        ${contactInfo.email ? `<p style="margin:0;"><strong>Email:</strong> ${contactInfo.email}</p>` : ''}
      </div>
    </div>
    ` : ''}

    <!-- Score Cards -->
    <div style="display:flex;gap:12px;margin-bottom:28px;flex-wrap:wrap;">
      <div style="flex:1;min-width:140px;background:#1e1e2e;border:1px solid #2d2d3a;border-radius:12px;padding:20px;text-align:center;">
        <div style="font-size:22px;margin-bottom:6px;">🔥</div>
        <div style="font-size:32px;font-weight:800;color:${frictionColor};">${(report.frictionScore || 0).toFixed(1)}</div>
        <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;margin-top:4px;">Friction Score</div>
        <div style="font-size:10px;color:#475569;margin-top:2px;">out of 10</div>
      </div>
      <div style="flex:1;min-width:140px;background:#1e1e2e;border:1px solid #2d2d3a;border-radius:12px;padding:20px;text-align:center;">
        <div style="font-size:22px;margin-bottom:6px;">🎯</div>
        <div style="font-size:32px;font-weight:800;color:#6366f1;">${report.visionScore || '—'}</div>
        <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;margin-top:4px;">Vision Fit</div>
        <div style="font-size:10px;color:#475569;margin-top:2px;">out of 10</div>
      </div>
      <div style="flex:1;min-width:140px;background:#1e1e2e;border:1px solid #2d2d3a;border-radius:12px;padding:20px;text-align:center;">
        <div style="font-size:22px;margin-bottom:6px;">📚</div>
        <div style="font-size:32px;font-weight:800;color:#06b6d4;">${(answers[4] as Record<string, unknown>)?.knowledge_sources ? ((answers[4] as Record<string, string[]>).knowledge_sources || []).length : 0}</div>
        <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;margin-top:4px;">Knowledge Sources</div>
        <div style="font-size:10px;color:#475569;margin-top:2px;">tools mapped</div>
      </div>
    </div>

    <!-- Top Bottlenecks -->
    ${topBots ? `
    <div style="background:#1e1e2e;border:1px solid #2d2d3a;border-radius:12px;padding:24px;margin-bottom:20px;">
      <h2 style="margin:0 0 16px;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;">🚧 Your Top Bottlenecks</h2>
      ${(report.topBottlenecks || []).slice(0, 3).map((id, idx) => {
        const card = BOTTLENECK_CARDS.find(c => c.id === id);
        if (!card) return '';
        const rankColors = ['#ef4444', '#f59e0b', '#6366f1'];
        return `
        <div style="display:flex;align-items:flex-start;gap:12px;padding:12px 0;${idx < 2 ? 'border-bottom:1px solid #1f2937;' : ''}">
          <div style="width:28px;height:28px;border-radius:50%;background:${rankColors[idx]};display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:11px;font-weight:800;color:white;text-align:center;line-height:28px;">${idx + 1}</div>
          <div>
            <div style="font-size:13px;font-weight:700;color:#e2e8f0;">${card.label}</div>
            <div style="font-size:11px;color:#64748b;margin-top:2px;">${card.desc}</div>
          </div>
        </div>`;
      }).join('')}
    </div>` : ''}

    <!-- Must-Have Integrations -->
    ${topInts ? `
    <div style="background:#1e1e2e;border:1px solid #2d2d3a;border-radius:12px;padding:24px;margin-bottom:20px;">
      <h2 style="margin:0 0 12px;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;">🔌 Must-Have Integrations</h2>
      <div style="display:flex;flex-wrap:wrap;gap:8px;">
        ${(report.mustHaveIntegrations || []).slice(0, 5).map((id, idx) => {
          const int = INTEGRATION_OPTIONS.find(i => i.id === id);
          if (!int) return '';
          return `<span style="background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.3);border-radius:999px;padding:4px 12px;font-size:11px;color:#a5b4fc;font-weight:600;">${idx + 1}. ${int.label}</span>`;
        }).join('')}
      </div>
    </div>` : ''}

    <!-- CTA -->
    <div style="background:linear-gradient(135deg,rgba(99,102,241,0.15),rgba(6,182,212,0.1));border:1px solid rgba(99,102,241,0.3);border-radius:16px;padding:32px;text-align:center;margin-bottom:24px;">
      <div style="font-size:32px;margin-bottom:12px;">🚀</div>
      <h3 style="margin:0 0 8px;font-size:18px;font-weight:800;color:#f1f5f9;">Thank you for your insights</h3>
      <p style="margin:0 0 20px;font-size:13px;color:#94a3b8;max-width:360px;margin-left:auto;margin-right:auto;">
        Your responses will directly shape how we build our platform. We'd love to show you an early demo.
      </p>
      <a href="mailto:hello@yourdomain.com?subject=Early Demo Request" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#4f46e5);color:white;font-size:13px;font-weight:700;padding:12px 28px;border-radius:10px;text-decoration:none;">
        📅 Request an Early Demo
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align:center;border-top:1px solid #1f2937;padding-top:20px;">
      <p style="color:#374151;font-size:11px;margin:0;">Engineering Onboarding Insights · Research Report</p>
      <p style="color:#374151;font-size:10px;margin:4px 0 0;">Generated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>

  </div>
</body>
</html>`;
}
