-- Schedule the daily digest every morning at 9:00 AM UTC
-- First, unschedule the weekly one if it exists (using its likely name)
SELECT cron.unschedule('weekly-onboarding-digest');

-- Schedule the new daily digest
SELECT cron.schedule(
  'daily-onboarding-digest',
  '0 9 * * *',
  $$ SELECT net.http_post(
       url := 'https://ysjhnokgziuaphunmgdh.supabase.co/functions/v1/weekly-digest',
       headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')),
       body := '{}'
     ) $$
);
