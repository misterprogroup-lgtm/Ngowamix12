export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendVerificationCode(phone: string, code: string): Promise<boolean> {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Ngowamix';
  const message = `Votre code de verification ${appName} : ${code}. Valable 10 minutes.`;

  const smsProvider = process.env.SMS_PROVIDER || 'console';

  switch (smsProvider) {
    case 'twilio': {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const from = process.env.TWILIO_PHONE_NUMBER;
      if (!accountSid || !authToken || !from) return false;
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ To: phone, From: from, Body: message }),
      });
      return res.ok;
    }

    default: {
      console.log(`[SMS] Envoi à ${phone}: ${message}`);
      return true;
    }
  }
}
