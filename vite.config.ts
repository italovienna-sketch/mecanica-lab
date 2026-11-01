import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { createInstructorAuth } from './server/instructorAuth';

/** Requisição vinda da própria máquina do desenvolvedor (não de outro computador da rede). */
function isLoopback(address: string | undefined): boolean {
  if (!address) return false;
  return address === '127.0.0.1' || address === '::1' || address === '::ffff:127.0.0.1';
}

function mecanicaLabServerPlugin(): Plugin {
  const instructorAuth = createInstructorAuth({
    accessCode: process.env.INSTRUCTOR_ACCESS_CODE,
    tokenSecret: process.env.INSTRUCTOR_TOKEN_SECRET
  });
  return {
    name: 'mecanica-lab-server-middleware',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        res.setHeader('Content-Type', 'application/json; charset=utf-8');

        // Área do instrutor — mesma lógica da Netlify Function de produção (server/instructorAuth.ts)
        if (req.url === '/api/instructor/dev-bootstrap' && req.method === 'POST') {
          // O acesso de desenvolvedor só existe no servidor de desenvolvimento e só vale na própria máquina.
          // Outros computadores da rede (por exemplo, alunos no mesmo Wi-Fi) recebem 403.
          if (!isLoopback(req.socket.remoteAddress)) {
            res.statusCode = 403;
            res.end(JSON.stringify({ error: 'Acesso de desenvolvedor disponível apenas no computador que executa o servidor.' }));
            return;
          }
          res.statusCode = 200;
          res.end(JSON.stringify({ authenticated: true, ...instructorAuth.issueToken('Desenvolvedor(a) local', 'developer_admin') }));
          return;
        }

        if (req.url === '/api/instructor/login' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            let parsed: Record<string, unknown>;
            try {
              parsed = JSON.parse(body || '{}');
            } catch {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Requisição malformada.' }));
              return;
            }
            const result = instructorAuth.login(req.socket.remoteAddress || 'desconhecido', parsed);
            res.statusCode = result.status;
            res.end(JSON.stringify(result.body));
          });
          return;
        }

        if (req.url === '/api/instructor/verify' && req.method === 'GET') {
          const result = instructorAuth.verify(req.headers.authorization);
          res.statusCode = result.status;
          res.end(JSON.stringify(result.body));
          return;
        }

        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'Endpoint não encontrado.' }));
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), mecanicaLabServerPlugin()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'lucide-react'],
          'vendor-three': ['three'],
          'vendor-phaser': ['phaser']
        }
      }
    }
  }
});
