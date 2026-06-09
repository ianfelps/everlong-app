import 'server-only';
import { google, type drive_v3 } from 'googleapis';
import { Readable } from 'node:stream';
import { env } from '@/env';

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

let driveClient: drive_v3.Drive | null = null;

function getDrive(): drive_v3.Drive {
  if (driveClient) return driveClient;
  const json = Buffer.from(env.GOOGLE_SERVICE_ACCOUNT_B64, 'base64').toString(
    'utf8',
  );
  const credentials = JSON.parse(json) as {
    client_email: string;
    private_key: string;
  };
  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: SCOPES,
  });
  driveClient = google.drive({ version: 'v3', auth });
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
    { fileId: driveFileId, alt: 'media' },
    { responseType: 'stream' },
  );
}

export async function deleteFoto(driveFileId: string): Promise<void> {
  const drive = getDrive();
  await drive.files.delete({ fileId: driveFileId });
}

export async function criarPastaRaiz(nome: string): Promise<string> {
  const drive = getDrive();
  const res = await drive.files.create({
    requestBody: {
      name: nome,
      mimeType: 'application/vnd.google-apps.folder',
    },
    fields: 'id',
  });
  if (!res.data.id) throw new Error('Falha ao criar pasta no Drive');
  return res.data.id;
}
