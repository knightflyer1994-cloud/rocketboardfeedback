

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: string; // base64
    type: string;
  }>;
  from?: string;
  is_admin_alert?: boolean;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const payload: EmailPayload = await req.json();
    const { to, subject, html, attachments, from, is_admin_alert } = payload;
    const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL');
    const FUNCTION_SECRET = Deno.env.get('SEND_EMAIL_SECRET');
    const authHeader = req.headers.get('Authorization');

    const is_report_delivery = (payload as any).is_report_delivery;

    // SECURITY: Disallow arbitrary 'to' addresses from public (unauthenticated) calls.
    // We allow:
    // 1. Admin alerts (hardcoded to ADMIN_EMAIL)
    // 2. Report delivery (which we'll tag and monitor, or use a separate secret)
    // 3. Authenticated calls with FUNCTION_SECRET
    const isPublicAllowed = is_admin_alert || is_report_delivery;
    
    if (!isPublicAllowed && (!FUNCTION_SECRET || authHeader !== `Bearer ${FUNCTION_SECRET}`)) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Arbitrary relay requires secret. Use is_admin_alert or is_report_delivery for public calls.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Granular validation
    const missing = [];
    if (!subject) missing.push('subject');
    if (!html) missing.push('html');
    
    // If it's an admin alert, we use ADMIN_EMAIL. If not, we need 'to' (and we already checked auth above).
    if (!is_admin_alert && !to) missing.push('to');

    if (missing.length > 0) {
      return new Response(
        JSON.stringify({ error: `Missing required fields: ${missing.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (is_admin_alert && !ADMIN_EMAIL) {
      return new Response(
        JSON.stringify({ error: 'ADMIN_EMAIL is not configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // SECURITY: Enforce that admin alerts ONLY go to the hardcoded admin email
    const targetRecipient = is_admin_alert ? ADMIN_EMAIL : to;
    
    console.log(`[send-email] Sending to: ${targetRecipient} (Admin: ${is_admin_alert})`);

    const emailBody: Record<string, unknown> = {
      from: from || 'Rocketboard Feedback <reports@resend.dev>',
      to: [targetRecipient],
      subject: subject || 'New Insight Report',
      html,
    };

    if (attachments && attachments.length > 0) {
      emailBody.attachments = attachments.map(att => ({
        filename: att.filename,
        content: att.content,
        type: att.type,
      }));
    }

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailBody),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      console.error('Resend error:', JSON.stringify(resendData));

      // Fuzzy-match sandbox restriction from both resendData.message and resendData.error.message
      const resendErrorMsg: string =
        resendData?.message ||
        resendData?.error?.message ||
        resendData?.error ||
        '';

      if (resendErrorMsg.includes('testing emails to your own email address')) {
        return new Response(
          JSON.stringify({
            error: 'Resend Sandbox Restriction',
            message: `Resend is in Sandbox mode. You can ONLY send emails to your authorized account email (kirannreddyaero@gmail.com). Currently trying to send to: ${targetRecipient}. Please update your ADMIN_EMAIL secret to match your Resend account email, or verify a domain at resend.com/domains.`,
            details: resendErrorMsg,
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(resendErrorMsg || 'Failed to send email via Resend');
    }

    return new Response(
      JSON.stringify({ success: true, id: resendData.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('send-email error:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
