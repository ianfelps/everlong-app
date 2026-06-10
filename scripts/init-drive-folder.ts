import { google } from 'googleapis';

async function main() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      'Faltam GOOGLE_OAUTH_CLIENT_ID/SECRET/REFRESH_TOKEN. Rode `pnpm drive:token` primeiro.',
    );
  }

  const oauth2 = new google.auth.OAuth2(clientId, clientSecret);
  oauth2.setCredentials({ refresh_token: refreshToken });
  const drive = google.drive({ version: 'v3', auth: oauth2 });

  const nome = process.argv[2] ?? 'Everlong';
  const res = await drive.files.create({
    requestBody: { name: nome, mimeType: 'application/vnd.google-apps.folder' },
    fields: 'id, name, webViewLink',
  });

  console.log('Pasta criada no seu Drive:');
  console.log(`  id:    ${res.data.id}`);
  console.log(`  nome:  ${res.data.name}`);
  console.log(`  link:  ${res.data.webViewLink ?? '(sem link)'}`);
  console.log('\nCole o id em GOOGLE_DRIVE_FOLDER_ID no .env.local.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
