// Cria pasta raiz no Drive da Service Account (1x). Imprime o ID — cole em GOOGLE_DRIVE_FOLDER_ID.
import { google } from 'googleapis';

async function main() {
  const b64 = process.env.GOOGLE_SERVICE_ACCOUNT_B64;
  if (!b64) throw new Error('GOOGLE_SERVICE_ACCOUNT_B64 ausente');

  const credentials = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });
  const drive = google.drive({ version: 'v3', auth });

  const nome = process.argv[2] ?? 'Everlong';
  const res = await drive.files.create({
    requestBody: {
      name: nome,
      mimeType: 'application/vnd.google-apps.folder',
    },
    fields: 'id, name, webViewLink',
  });

  console.log('Pasta criada:');
  console.log(`  id:      ${res.data.id}`);
  console.log(`  nome:    ${res.data.name}`);
  console.log(`  link:    ${res.data.webViewLink ?? '(sem link)'}`);
  console.log('\nCole o id em GOOGLE_DRIVE_FOLDER_ID no .env.local.');
  console.log(
    '\nAtenção: compartilhe a pasta com o e-mail da Service Account ou todo upload ficará invisível para você.',
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
