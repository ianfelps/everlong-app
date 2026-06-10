'use client';

import { Fragment, useEffect, useState } from 'react';
import { MetalSphere } from '@/components/brand/MetalSphere';

function useElapsed(since: Date) {
  const [, force] = useState(0);
  useEffect(() => {
    const t = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const now = new Date();
  let y = now.getFullYear() - since.getFullYear();
  let mo = now.getMonth() - since.getMonth();
  let d = now.getDate() - since.getDate();
  let h = now.getHours() - since.getHours();
  let mi = now.getMinutes() - since.getMinutes();
  let s = now.getSeconds() - since.getSeconds();
  if (s < 0) {
    s += 60;
    mi--;
  }
  if (mi < 0) {
    mi += 60;
    h--;
  }
  if (h < 0) {
    h += 24;
    d--;
  }
  if (d < 0) {
    d += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    mo--;
  }
  if (mo < 0) {
    mo += 12;
    y--;
  }
  return { y, mo, d, h, mi, s };
}

const pad = (n: number) => String(n).padStart(2, '0');

export function DatingTimer({ dataInicio }: { dataInicio: string }) {
  const since = new Date(dataInicio);
  const e = useElapsed(since);
  const cells = [
    { n: String(e.y), u: 'Anos', red: true },
    { n: String(e.mo), u: 'Meses', red: false },
    { n: String(e.d), u: 'Dias', red: false },
    { n: pad(e.h), u: 'Horas', red: false },
    { n: pad(e.mi), u: 'Min', red: false },
    { n: pad(e.s), u: 'Seg', red: true },
  ];
  return (
    <div className="timer">
      {cells.map((c, i) => (
        <Fragment key={i}>
          <div className="timer-cell">
            <div className="timer-orb">
              <MetalSphere size={30} />
            </div>
            <div className="timer-num">
              <span className={c.red ? 'red' : ''}>{c.n}</span>
            </div>
            <div className="timer-unit">{c.u}</div>
          </div>
          {i === 2 && <div className="timer-sep">·</div>}
        </Fragment>
      ))}
    </div>
  );
}
