import { Request, Response } from 'express';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_FROM_NUMBER;

const twilioClient = accountSid && authToken ? twilio(accountSid, authToken) : null;

interface Contact {
  name: string;
  phone: string;
  relation?: string;
}

interface SOSPayload {
  contacts: Contact[];
  location?: {
    latitude?: number;
    longitude?: number;
    url?: string;
  };
  user?: {
    name?: string;
    phone?: string;
    bloodGroup?: string;
    allergies?: string;
    medications?: string;
  };
  reason?: string;
  triggeredAt?: string;
  evidenceUrl?: string;
}

const buildMessage = (payload: SOSPayload) => {
  const { user, location, reason, triggeredAt } = payload;
  const lines = [
    '🚨 SOS ALERT 🚨',
    reason ? `Reason: ${reason}` : 'Reason: Emergency SOS triggered',
    user?.name ? `Name: ${user.name}` : null,
    user?.phone ? `Phone: ${user.phone}` : null,
    user?.bloodGroup ? `Blood Group: ${user.bloodGroup}` : null,
    user?.allergies ? `Allergies: ${user.allergies}` : null,
    user?.medications ? `Medications: ${user.medications}` : null,
    location?.url ? `Location: ${location.url}` : null,
    location?.latitude && location?.longitude
      ? `Coords: ${location.latitude}, ${location.longitude}`
      : null,
    payload.evidenceUrl ? `Evidence: ${payload.evidenceUrl}` : null,
    triggeredAt ? `Time: ${triggeredAt}` : `Time: ${new Date().toISOString()}`,
    'Reply or call back if you received this.'
  ].filter(Boolean);

  return lines.join('\n');
};

export const sendSOS = async (req: Request, res: Response) => {
  const payload: SOSPayload = req.body;

  if (!payload.contacts || !Array.isArray(payload.contacts) || payload.contacts.length === 0) {
    return res.status(400).json({ message: 'contacts array is required' });
  }

  // Graceful no-SMS mode when Twilio is not configured
  if (!twilioClient || !fromNumber) {
    console.warn('sendSOS: Twilio not configured; skipping SMS send');
    return res.status(200).json({
      message: 'SMS sending is disabled (Twilio not configured).',
      results: payload.contacts.map((contact) => ({ contact, status: 'skipped' })),
    });
  }

  const messageBody = buildMessage(payload);

  try {
    const results = await Promise.allSettled(
      payload.contacts.map((contact) =>
        twilioClient.messages.create({
          body: messageBody,
          from: fromNumber,
          to: contact.phone,
        })
      )
    );

    const summary = results.map((result, index) => {
      const contact = payload.contacts[index];
      if (result.status === 'fulfilled') {
        return { contact, status: 'sent', sid: result.value.sid };
      }
      return { contact, status: 'failed', error: result.reason?.message || 'Unknown error' };
    });

    const failed = summary.filter((s) => s.status === 'failed');
    const statusCode = failed.length === summary.length ? 502 : failed.length > 0 ? 207 : 200;

    return res.status(statusCode).json({
      message: 'SMS dispatch completed',
      results: summary,
    });
  } catch (error: any) {
    console.error('Failed to send SOS SMS:', error);
    return res.status(500).json({ message: 'Failed to send SOS SMS', error: error?.message || error });
  }
};
