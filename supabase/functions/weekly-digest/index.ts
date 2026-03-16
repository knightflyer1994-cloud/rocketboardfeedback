import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BOTTLENECK_LABELS: Record<string, string> = {
  scattered_docs: 'Scattered Docs', stale_info: 'Stale Information',
  access_delays: 'Access Delays', tribal_knowledge: 'Tribal Knowledge',
  one_size_fits_all: 'One-Size-Fits-All', remote_isolation: 'Remote Isolation',
  missing_context: 'Missing Context', mentor_overload: 'Mentor Overload',
  unclear_milestones: 'Unclear Milestones', tool_sprawl: 'Tool Sprawl',
  no_feedback_loop: 'No Feedback Loop', cultural_gap: 'Cultural Gap',
  tech_debt_fog: 'Tech Debt Fog', slow_first_pr: 'Slow First PR',
  security_blockers: 'Security Blockers', no_learning_path: 'No Learning Path',
};

function buildDigestHtml(sessions: Array<Record<string, unknown>>, weekStart: string, weekEnd: string): string {
  const total = sessions.length;
  const avgFriction = total > 0
    ? (sessions.reduce((sum, s) => {
        const summary = s.summary as Array<Record<string, unknown>>;
        return sum + ((summary?.[0]?.friction_score as number) || 0);
      }, 0) / total).toFixed(1)
    : '—';
  const avgVision = total > 0
    ? (sessions.reduce((sum, s) => {
        const summary = s.summary as Array<Record<string, unknown>>;
        return sum + ((summary?.[0]?.vision_score as number) || 0);
      }, 0) / total).toFixed(1)
    : '—';

  // Count bottleneck frequency
  const bottleneckCount: Record<string, number> = {};
  sessions.forEach(s => {
    const summary = s.summary as Array<Record<string, unknown>>;
    const bottlenecks = (summary?.[0]?.top_bottlenecks as string[]) || [];
    bottlenecks.forEach(b => { bottleneckCount[b] = (bottleneckCount[b] || 0) + 1; });
  });
  const sortedBottlenecks = Object.entries(bottleneckCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const roleCount: Record<string, number> = {};
  sessions.forEach(s => {
    const role = (s.role as string) || 'Unknown';
    roleCount[role] = (roleCount[role] || 0) + 1;
  });

  const barColor = '#6366f1';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Weekly Onboarding Insights Digest</title>
</head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:'Segoe UI',system-ui,sans-serif;color:#e5e7eb;">
  <div style="max-width:680px;margin:0 auto;padding:32px 16px;">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:40px;">
      <div style="display:inline-block;background:linear-gradient(135deg,#6366f1,#06b6d4);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:28px;font-weight:800;letter-spacing:-0.5px;margin-bottom:8px;">
        🚀 Daily Insights Digest
      </div>
      <p style="color:#9ca3af;font-size:14px;margin:4px 0 0;">${weekStart} — ${weekEnd}</p>
    </div>

    <!-- KPI Row -->
    <div style="display:flex;gap:16px;margin-bottom:32px;flex-wrap:wrap;">
      ${[
        { label: 'New Responses', value: total.toString(), icon: '📋', color: '#6366f1' },
        { label: 'Avg Friction Score', value: `${avgFriction}/10`, icon: '🔥', color: '#f59e0b' },
        { label: 'Avg Vision Fit', value: `${avgVision}/10`, icon: '🎯', color: '#10b981' },
      ].map(kpi => `
        <div style="flex:1;min-width:160px;background:#1a1a2e;border:1px solid #2d2d3a;border-radius:12px;padding:20px;text-align:center;">
          <div style="font-size:24px;margin-bottom:8px;">${kpi.icon}</div>
          <div style="font-size:28px;font-weight:800;color:${kpi.color};">${kpi.value}</div>
          <div style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em;margin-top:4px;">${kpi.label}</div>
        </div>
      `).join('')}
    </div>

    <!-- Top Bottlenecks -->
    ${sortedBottlenecks.length > 0 ? `
    <div style="background:#1a1a2e;border:1px solid #2d2d3a;border-radius:12px;padding:24px;margin-bottom:24px;">
      <h2 style="font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#9ca3af;margin:0 0 20px;">🚧 Top Bottlenecks This Week</h2>
      ${sortedBottlenecks.map(([id, count], idx) => {
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        return `
        <div style="margin-bottom:14px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span style="font-size:13px;font-weight:600;color:#e5e7eb;">${idx + 1}. ${BOTTLENECK_LABELS[id] || id}</span>
            <span style="font-size:12px;color:#9ca3af;">${count} / ${total} (${pct}%)</span>
          </div>
          <div style="background:#2d2d3a;border-radius:4px;height:6px;overflow:hidden;">
            <div style="height:6px;width:${pct}%;background:${barColor};border-radius:4px;"></div>
          </div>
        </div>`;
      }).join('')}
    </div>` : ''}

    <!-- Role Breakdown -->
    ${Object.keys(roleCount).length > 0 ? `
    <div style="background:#1a1a2e;border:1px solid #2d2d3a;border-radius:12px;padding:24px;margin-bottom:24px;">
      <h2 style="font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#9ca3af;margin:0 0 16px;">👤 Respondents by Role</h2>
      <div style="display:flex;flex-wrap:wrap;gap:8px;">
        ${Object.entries(roleCount).map(([role, count]) => `
          <span style="background:#6366f1/10;border:1px solid #4f46e5;border-radius:20px;padding:4px 12px;font-size:12px;color:#a5b4fc;">
            ${role} × ${count}
          </span>
        `).join('')}
      </div>
    </div>` : ''}

    <!-- Individual sessions table -->
    ${total > 0 ? `
    <div style="background:#1a1a2e;border:1px solid #2d2d3a;border-radius:12px;padding:24px;margin-bottom:32px;overflow:hidden;">
      <h2 style="font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#9ca3af;margin:0 0 16px;">📋 This Week's Responses</h2>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="border-bottom:1px solid #2d2d3a;">
            <th style="text-align:left;font-size:11px;color:#6b7280;padding:8px 4px;font-weight:600;text-transform:uppercase;">Role</th>
            <th style="text-align:left;font-size:11px;color:#6b7280;padding:8px 4px;font-weight:600;text-transform:uppercase;">Path</th>
            <th style="text-align:right;font-size:11px;color:#6b7280;padding:8px 4px;font-weight:600;text-transform:uppercase;">Friction</th>
            <th style="text-align:right;font-size:11px;color:#6b7280;padding:8px 4px;font-weight:600;text-transform:uppercase;">Vision</th>
          </tr>
        </thead>
        <tbody>
          ${sessions.map(s => {
            const summary = s.summary as Array<Record<string, unknown>>;
            const friction = (summary?.[0]?.friction_score as number)?.toFixed(1) || '—';
            const vision = summary?.[0]?.vision_score || '—';
            const frictionColor = parseFloat(friction) <= 3 ? '#10b981' : parseFloat(friction) <= 6 ? '#f59e0b' : '#ef4444';
            return `
            <tr style="border-bottom:1px solid #1f1f2e;">
              <td style="padding:10px 4px;font-size:13px;color:#e5e7eb;">${s.role || 'Unknown'}</td>
              <td style="padding:10px 4px;"><span style="background:#2d2d3a;border-radius:4px;padding:2px 8px;font-size:11px;text-transform:uppercase;color:#9ca3af;">${s.mode}</span></td>
              <td style="padding:10px 4px;text-align:right;font-weight:700;color:${frictionColor};">${friction}</td>
              <td style="padding:10px 4px;text-align:right;font-weight:700;color:#6366f1;">${vision}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>` : `
    <div style="text-align:center;padding:48px 24px;color:#6b7280;">
      <div style="font-size:48px;margin-bottom:12px;">📭</div>
      <p style="font-size:16px;">No completed responses this week.</p>
    </div>`}

    <!-- Footer -->
    <div style="text-align:center;border-top:1px solid #2d2d3a;padding-top:24px;">
      <p style="color:#6b7280;font-size:12px;margin:0;">Engineering Onboarding Insights · Automated Weekly Digest</p>
      <p style="color:#6b7280;font-size:11px;margin:4px 0 0;">Generated ${new Date().toISOString().split('T')[0]}</p>
    </div>

  </div>
</body>
</html>`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const FUNCTION_SECRET = Deno.env.get('WEEKLY_DIGEST_SECRET');

    // Simple auth guard: require a secret if it's configured
    const authHeader = req.headers.get('Authorization');
    if (FUNCTION_SECRET && authHeader !== `Bearer ${FUNCTION_SECRET}`) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!RESEND_API_KEY || !ADMIN_EMAIL || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get sessions from the past 24 hours
    const dayAgo = new Date();
    dayAgo.setDate(dayAgo.getDate() - 1);

    const { data: sessions, error } = await supabase
      .from('feedback_sessions')
      .select('*, summary:feedback_summary(*)')
      .eq('completed', true)
      .gte('created_at', dayAgo.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;

    const dayLabel = dayAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const todayLabel = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const html = buildDigestHtml(sessions || [], dayLabel, todayLabel);

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Onboarding Insights <reports@resend.dev>',
        to: [ADMIN_EMAIL],
        subject: `Daily Digest: ${sessions?.length || 0} new responses — ${todayLabel}`,
        html,
      }),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      throw new Error(resendData.message || 'Failed to send digest via Resend');
    }

    console.log('Weekly digest sent:', resendData.id, 'to', ADMIN_EMAIL);

    return new Response(
      JSON.stringify({ success: true, id: resendData.id, count: sessions?.length || 0 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('weekly-digest error:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
