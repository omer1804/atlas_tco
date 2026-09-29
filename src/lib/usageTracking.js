import { base44 } from '@/api/base44Client';

/**
 * Passive usage tracking. Fire-and-forget: any failure is swallowed
 * so logging never breaks or blocks the app.
 */
export async function logUsageEvent({ eventType, pageOrAction = null, details = null, userEmail = null }) {
  try {
    await base44.entities.UsageEvent.create({
      event_type: eventType,
      user_email: userEmail,
      page_or_action: pageOrAction,
      details,
    });
  } catch (e) {
    // Silent: usage tracking must never break the app.
  }
}