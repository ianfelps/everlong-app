export type CapItem = {
  id: string;
  titulo: string;
  from: string;
  dataDesbloqueio: string;
  aberta: boolean;
};

export type CapAberta = {
  id: string;
  titulo: string;
  conteudo: string;
  from: string;
  fotos?: {
    id: string;
    legenda: string | null;
    mimeType: string;
    tamanhoBytes: string;
    createdAt: string;
  }[];
};
