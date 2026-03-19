import crypto from 'crypto';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

export interface AuthResult {
  valid: boolean;
  user?: TelegramUser;
}

export function validateInitData(initData: string, botToken: string): AuthResult {
  if (!initData) return { valid: false };

  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return { valid: false };

  params.delete('hash');

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();

  const calculatedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  if (calculatedHash !== hash) return { valid: false };

  // Parse user data
  const userStr = params.get('user');
  if (!userStr) return { valid: false };

  try {
    const user = JSON.parse(userStr) as TelegramUser;
    return { valid: true, user };
  } catch {
    return { valid: false };
  }
}
