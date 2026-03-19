// @ts-nocheck
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

    // SECURITY: Disallow arbitrary relay from public calls.
    // Admin alerts are allowed if is_admin_alert is true (will be sent ONLY to ADMIN_EMAIL).
    // All other emails (including report delivery to users) MUST be authenticated via FUNCTION_SECRET.
    const isPublicAllowed = is_admin_alert === true;
    
    const isAuthenticated = FUNCTION_SECRET && authHeader === `Bearer ${FUNCTION_SECRET}`;

    if (!isPublicAllowed && !isAuthenticated) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Arbitrary relay requires authentication.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validation
    const missing = [];
    if (!subject) missing.push('subject');
    if (!html) missing.push('html');
    if (!is_admin_alert && !to) missing.push('to');

    if (missing.length > 0) {
      return new Response(
        JSON.stringify({ error: `Missing required fields: ${missing.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (is_admin_alert && !ADMIN_EMAIL) {
      console.error('ADMIN_EMAIL is not configured');
      return new Response(
        JSON.stringify({ error: 'Configuration Error: Admin notifications are currently unavailable.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // SECURITY: Enforce that admin alerts ONLY go to the hardcoded admin email
    const targetRecipient = is_admin_alert ? ADMIN_EMAIL : to;
    
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
      const resendErrorMsg: string = resendData?.message || resendData?.error?.message || resendData?.error || '';

      if (resendErrorMsg.includes('testing emails to your own email address')) {
        return new Response(
          JSON.stringify({
            error: 'Domain Verification Required',
            message: `The email delivery service is in restricted mode. Please verify your domain in the Resend dashboard to send emails to ${targetRecipient}.`,
            suggestion: 'Go to resend.com/domains to add and verify your sender domain.',
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
