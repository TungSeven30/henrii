/**
 * HTML email templates for henrii notification system.
 * Styled to match the invite email: henrii pink header, clean layout.
 */

function wrapTemplate(content: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #E8A0BF; margin-bottom: 24px;">henrii</h2>
      ${content}
      <p style="color: #999; font-size: 12px; margin-top: 24px;">
        You received this because you have notifications enabled in henrii.
        Manage your preferences in the app settings.
      </p>
    </div>
  `;
}

export function buildVaccinationReminderHtml(
  babyName: string,
  vaccineName: string,
  scheduledDate: string,
): string {
  return wrapTemplate(`
    <p style="font-size: 16px; line-height: 1.5; color: #333;">
      <strong>${babyName}</strong> has a vaccination coming up.
    </p>
    <div style="background: #FFF5F9; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <p style="font-size: 14px; color: #555; margin: 0 0 8px 0;">
        <strong>Vaccine:</strong> ${vaccineName}
      </p>
      <p style="font-size: 14px; color: #555; margin: 0;">
        <strong>Scheduled:</strong> ${scheduledDate}
      </p>
    </div>
    <p style="font-size: 14px; line-height: 1.5; color: #555;">
      Make sure to schedule or confirm the appointment with your pediatrician.
    </p>
  `);
}

export function buildAppointmentReminderHtml(
  babyName: string,
  appointmentTitle: string,
  scheduledAt: string,
  location: string | null,
): string {
  const locationLine = location
    ? `<p style="font-size: 14px; color: #555; margin: 0 0 8px 0;"><strong>Location:</strong> ${location}</p>`
    : "";

  return wrapTemplate(`
    <p style="font-size: 16px; line-height: 1.5; color: #333;">
      Reminder: <strong>${babyName}</strong> has an appointment tomorrow.
    </p>
    <div style="background: #FFF5F9; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <p style="font-size: 14px; color: #555; margin: 0 0 8px 0;">
        <strong>Appointment:</strong> ${appointmentTitle}
      </p>
      ${locationLine}
      <p style="font-size: 14px; color: #555; margin: 0;">
        <strong>When:</strong> ${scheduledAt}
      </p>
    </div>
    <p style="font-size: 14px; line-height: 1.5; color: #555;">
      Don't forget to bring any documents or questions for the visit.
    </p>
  `);
}

export function buildPatternAlertHtml(
  babyName: string,
  patternType: "feeding_gap" | "diaper_gap",
  details: string,
): string {
  const typeLabel = patternType === "feeding_gap" ? "Feeding gap" : "Diaper gap";

  return wrapTemplate(`
    <p style="font-size: 16px; line-height: 1.5; color: #333;">
      <strong>${typeLabel}</strong> alert for <strong>${babyName}</strong>.
    </p>
    <div style="background: #FFF5F9; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <p style="font-size: 14px; color: #555; margin: 0;">
        ${details}
      </p>
    </div>
    <p style="font-size: 14px; line-height: 1.5; color: #555;">
      This is an automated alert based on your notification preferences.
    </p>
  `);
}
