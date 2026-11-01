import { createInstructorAuth } from '../../server/instructorAuth';

/**
 * Netlify Function da área do instrutor (produção).
 * Rotas (via public/_redirects): POST /api/instructor/login · GET /api/instructor/verify
 * Variáveis de ambiente no painel da Netlify: INSTRUCTOR_ACCESS_CODE (obrigatória) e
 * INSTRUCTOR_TOKEN_SECRET (recomendada; se ausente, o segredo é derivado do código de acesso).
 * O acesso rápido de desenvolvedor (dev-bootstrap) NÃO existe em produção.
 */
const auth = createInstructorAuth({
  accessCode: process.env.INSTRUCTOR_ACCESS_CODE,
  tokenSecret: process.env.INSTRUCTOR_TOKEN_SECRET
});

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
  });

export default async (req: Request): Promise<Response> => {
  const action = new URL(req.url).pathname.split('/').filter(Boolean).pop();

  if (action === 'login' && req.method === 'POST') {
    let body: Record<string, unknown>;
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      return json(400, { error: 'Requisição malformada.' });
    }
    const ip = req.headers.get('x-nf-client-connection-ip') || req.headers.get('x-forwarded-for') || 'desconhecido';
    const result = auth.login(ip, body);
    return json(result.status, result.body);
  }

  if (action === 'verify' && req.method === 'GET') {
    const result = auth.verify(req.headers.get('authorization'));
    return json(result.status, result.body);
  }

  return json(404, { error: 'Endpoint não encontrado.' });
};
