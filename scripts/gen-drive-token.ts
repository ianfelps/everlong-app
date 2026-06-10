import http from 'node:http';
import { google } from 'googleapis';

const PORT = 53682;
const REDIRECT = `http://localhost:${PORT}`;
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

async function main() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      'Defina GOOGLE_OAUTH_CLIENT_ID e GOOGLE_OAUTH_CLIENT_SECRET no .env.local antes de rodar.',
    );
  }

  const oauth2 = new google.auth.OAuth2(clientId, clientSecret, REDIRECT);
  const authUrl = oauth2.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
  });

  const code: string = await new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url ?? '/', REDIRECT);
      const c = url.searchParams.get('code');
      const err = url.searchParams.get('error');
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      res.end(
        `<body style="font-family:sans-serif;background:#0e2a3c;color:#e6ebef;display:grid;place-items:center;height:100vh;margin:0"><div><h2>${
          c ? '✓ Autorizado' : '✗ Falhou'
        }</h2><p>Pode fechar esta aba e voltar ao terminal.</p></div></body>`,
      );
      server.close();
      if (c) resolve(c);
      else reject(new Error(err ?? 'sem code'));
    });
    server.listen(PORT, () => {
      console.log('\n1) Abra esta URL no navegador, faça login e autorize:\n');
      console.log('   ' + authUrl + '\n');
      console.log(`2) Aguardando o retorno em ${REDIRECT} ...\n`);
    });
  });

  const { tokens } = await oauth2.getToken(code);
  if (!tokens.refresh_token) {
    throw new Error(
      'Nenhum refresh_token retornado. Revogue o acesso em https://myaccount.google.com/permissions e rode de novo.',
    );
  }

  console.log('\n✓ Refresh token gerado. Cole no .env.local:\n');
  console.log(`GOOGLE_OAUTH_REFRESH_TOKEN=${tokens.refresh_token}\n`);
  console.log(
    'Dica: publique a OAuth consent screen em "Production" p/ o token não expirar em 7 dias.',
  );
  process.exit(0);
}

main().catch((e) => {
  console.error('\nErro:', e instanceof Error ? e.message : e);
  process.exit(1);
});
