import 'server-only';
import { google, type drive_v3 } from 'googleapis';
import { Readable } from 'node:stream';
import { env } from '@/env';

let driveClient: drive_v3.Drive | null = null;

function getDrive(): drive_v3.Drive {
  if (driveClient) return driveClient;

  const clientId = env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = env.GOOGLE_OAUTH_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      'Google Drive não configurado: faltam GOOGLE_OAUTH_CLIENT_ID/SECRET/REFRESH_TOKEN. ' +
        'Rode `pnpm drive:token` para gerar o refresh token.',
    );
  }

  const oauth2 = new google.auth.OAuth2(clientId, clientSecret);
  oauth2.setCredentials({ refresh_token: refreshToken });
  driveClient = google.drive({ version: 'v3', auth: oauth2 });
  return driveClient;
}

export type UploadInput = {
  buffer: Buffer;
  mimeType: string;
  filename: string;
  parentFolderId?: string;
};

export async function uploadFoto(
  input: UploadInput,
): Promise<{ id: string; size: number }> {
  const drive = getDrive();
  const parent = input.parentFolderId ?? env.GOOGLE_DRIVE_FOLDER_ID;
  const res = await drive.files.create({
    requestBody: {
      name: input.filename,
      parents: [parent],
    },
    media: {
      mimeType: input.mimeType,
      body: Readable.from(input.buffer),
    },
    fields: 'id, size',
    supportsAllDrives: true,
  });
  if (!res.data.id) throw new Error('Drive não retornou file id');
  return {
    id: res.data.id,
    size: Number(res.data.size ?? input.buffer.length),
  };
}

export async function streamFoto(driveFileId: string) {
  const drive = getDrive();
  return drive.files.get(
    { fileId: driveFileId, alt: 'media', supportsAllDrives: true },
    { responseType: 'stream' },
  );
}

export async function deleteFoto(driveFileId: string): Promise<void> {
  const drive = getDrive();
  await drive.files.delete({ fileId: driveFileId, supportsAllDrives: true });
}

export async function criarPastaRaiz(
  nome: string,
  parentId?: string,
): Promise<string> {
  const drive = getDrive();
  const res = await drive.files.create({
    requestBody: {
      name: nome,
      mimeType: 'application/vnd.google-apps.folder',
      ...(parentId ? { parents: [parentId] } : {}),
    },
    fields: 'id',
    supportsAllDrives: true,
  });
  if (!res.data.id) throw new Error('Falha ao criar pasta no Drive');
  return res.data.id;
}
