import "jsr:@supabase/functions-js/edge-runtime.d.ts";

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

    // Granular validation
    const missing = [];
    if (!subject) missing.push('subject');
    if (!html) missing.push('html');
    if (!is_admin_alert && !to) missing.push('to');

    if (missing.length > 0) {
      return new Response(
        JSON.stringify({ error: `Missing required fields: ${missing.join(', ')}`, received_payload: { subject: !!subject, html: !!html, to: !!to, is_admin_alert: !!is_admin_alert } }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (is_admin_alert && !ADMIN_EMAIL) {
      return new Response(
        JSON.stringify({ error: 'ADMIN_EMAIL is not configured in environment variables' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const targetRecipient = is_admin_alert ? ADMIN_EMAIL : to;
    console.log(`[send-email] Attempting to send ${is_admin_alert ? 'ADMIN ALERT' : 'standard email'} to: ${targetRecipient}`);

    const emailBody: Record<string, unknown> = {
      from: from || 'Onboarding Insights <reports@resend.dev>',
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
      console.error('Resend error:', resendData);
      
      // Specifically handle sandbox restriction error message
      if (resendData.message?.includes('testing emails to your own email address')) {
        return new Response(
          JSON.stringify({ 
            error: "Resend Sandbox Restriction",
            message: `Resend is in Sandbox mode. You can ONLY send emails to your account email (kirannreddyaero@gmail.com). Currently trying to send to: ${targetRecipient}. Please update your ADMIN_EMAIL secret in Supabase to match your Resend account email or verify a domain on Resend.`,
            details: resendData.message
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(resendData.message || 'Failed to send email via Resend');
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
