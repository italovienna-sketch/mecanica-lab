import crypto from 'node:crypto';

/**
 * Autenticação da área do instrutor — usada pelo servidor de desenvolvimento (vite.config.ts)
 * e pela Netlify Function de produção (netlify/functions/instructor.ts).
 *
 * - O código de acesso fica apenas na variável de ambiente INSTRUCTOR_ACCESS_CODE (nunca no navegador).
 * - O token é assinado com HMAC-SHA256 e não precisa de banco de dados: qualquer instância
 *   do servidor consegue validá-lo, o que funciona em hospedagem serverless.
 * - O limite de tentativas fica em memória: em serverless ele vale por instância (proteção parcial).
 */

export type InstructorRole = 'instructor' | 'developer_admin';

export interface InstructorTokenPayload {
  instructorName: string;
  role: InstructorRole;
  expiresAt: number;
}

export interface AuthResult {
  status: number;
  body: Record<string, unknown>;
}

const SESSION_MS = 1000 * 60 * 60 * 4;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 10;

const b64url = (buf: Buffer) => buf.toString('base64url');

/** Compara em tempo constante (evita descobrir o código pelo tempo de resposta). */
export function safeEqual(a: string, b: string): boolean {
  const ha = crypto.createHash('sha256').update(a).digest();
  const hb = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(ha, hb) && a.length === b.length;
}

export function createInstructorAuth(options: { accessCode?: string; tokenSecret?: string }) {
  const accessCode = options.accessCode?.trim() || undefined;
  // Sem segredo configurado, usa um aleatório: tokens valem só enquanto o processo estiver vivo.
  const secret = options.tokenSecret || (accessCode ? `token:${accessCode}` : crypto.randomBytes(32).toString('hex'));
  const attempts = new Map<string, { count: number; windowStart: number }>();

  const sign = (data: string) => b64url(crypto.createHmac('sha256', secret).update(data).digest());

  function issueToken(instructorName: string, role: InstructorRole) {
    const payload: InstructorTokenPayload = { instructorName, role, expiresAt: Date.now() + SESSION_MS };
    const data = b64url(Buffer.from(JSON.stringify(payload)));
    return { token: `${data}.${sign(data)}`, ...payload };
  }

  function verifyToken(token: string): InstructorTokenPayload | null {
    const [data, signature] = token.split('.');
    if (!data || !signature || !safeEqual(signature, sign(data))) return null;
    try {
      const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8')) as InstructorTokenPayload;
      if (typeof payload.expiresAt !== 'number' || payload.expiresAt < Date.now()) return null;
      return payload;
    } catch {
      return null;
    }
  }

  function login(ip: string, body: { instructorName?: unknown; accessCode?: unknown }): AuthResult {
    const now = Date.now();
    const attempt = attempts.get(ip);
    if (attempt && now - attempt.windowStart < WINDOW_MS && attempt.count >= MAX_ATTEMPTS) {
      return { status: 429, body: { error: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' } };
    }
    if (!attempt || now - attempt.windowStart >= WINDOW_MS) attempts.set(ip, { count: 1, windowStart: now });
    else attempt.count += 1;

    if (!accessCode) {
      return {
        status: 503,
        body: { error: 'A área do instrutor ainda não foi configurada neste servidor (falta definir o código de acesso).' }
      };
    }
    if (!safeEqual(String(body.accessCode ?? '').trim(), accessCode)) {
      return { status: 401, body: { error: 'Código de acesso incorreto.' } };
    }
    attempts.delete(ip);
    const name = String(body.instructorName ?? '').trim().slice(0, 60) || 'Instrutor(a)';
    return { status: 200, body: { authenticated: true, ...issueToken(name, 'instructor') } };
  }

  function verify(authorization: string | undefined | null): AuthResult {
    const token = String(authorization || '').replace(/^Bearer\s+/i, '').trim();
    const payload = token ? verifyToken(token) : null;
    if (!payload) return { status: 401, body: { authenticated: false, error: 'Sessão expirada ou não autorizada.' } };
    return { status: 200, body: { authenticated: true, instructorName: payload.instructorName, role: payload.role } };
  }

  return { issueToken, verifyToken, login, verify };
}
