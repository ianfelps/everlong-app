import 'server-only';
import { db } from '@/server/db';
import { configCasal } from '@/server/db/schema';
import {
  differenceInSeconds,
  differenceInDays,
  intervalToDuration,
} from 'date-fns';

export type CronometroResposta = {
  data_inicio: string;
  anos: number;
  meses: number;
  dias: number;
  horas: number;
  minutos: number;
  segundos: number;
  total_dias: number;
  total_segundos: number;
};

export async function calcularCronometro(
  agora: Date = new Date(),
): Promise<CronometroResposta> {
  const [cfg] = await db.select().from(configCasal).limit(1);
  if (!cfg) throw new Error('config_casal não inicializado — rode o seed');

  const inicio = cfg.dataInicio;
  if (agora < inicio) {
    return {
      data_inicio: inicio.toISOString(),
      anos: 0,
      meses: 0,
      dias: 0,
      horas: 0,
      minutos: 0,
      segundos: 0,
      total_dias: 0,
      total_segundos: 0,
    };
  }

  const dur = intervalToDuration({ start: inicio, end: agora });

  return {
    data_inicio: inicio.toISOString(),
    anos: dur.years ?? 0,
    meses: dur.months ?? 0,
    dias: dur.days ?? 0,
    horas: dur.hours ?? 0,
    minutos: dur.minutes ?? 0,
    segundos: dur.seconds ?? 0,
    total_dias: differenceInDays(agora, inicio),
    total_segundos: differenceInSeconds(agora, inicio),
  };
}
