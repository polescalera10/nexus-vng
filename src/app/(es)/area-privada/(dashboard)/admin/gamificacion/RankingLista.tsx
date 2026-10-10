"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { formatPoints } from "@/lib/format";

type Fila = {
  studentId: string;
  fullName: string;
  balance: number;
  avatarUrl: string | null;
};

const VISIBLES = 10;

/**
 * Ranking de puntos con toggle "Ver todos / Ver menos". Recibe todos los
 * alumnos con saldo > 0 y enseña los primeros 10 hasta que se despliega.
 */
export function RankingLista({ filas }: { filas: Fila[] }) {
  const [todos, setTodos] = useState(false);
  const visibles = todos ? filas : filas.slice(0, VISIBLES);

  return (
    <>
      <ol className="flex flex-col gap-2">
        {visibles.map((row, i) => (
          <li
            key={row.studentId}
            className="flex items-center justify-between gap-3 font-body text-sm"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span className="w-6 shrink-0 text-text-muted">{i + 1}.</span>
              <Avatar
                name={row.fullName}
                seed={row.studentId}
                src={row.avatarUrl}
                size="sm"
              />
              <Link
                href={`/area-privada/admin/alumnos/${row.studentId}`}
                className="truncate font-semibold text-text-strong hover:text-accent"
              >
                {row.fullName}
              </Link>
            </span>
            <span className="shrink-0 font-bold text-accent">
              {formatPoints(row.balance)}
            </span>
          </li>
        ))}
      </ol>
      {filas.length > VISIBLES && (
        <Button
          variant="secondary"
          size="sm"
          className="mt-4 w-full"
          aria-expanded={todos}
          onClick={() => setTodos((v) => !v)}
        >
          {todos ? "Ver menos" : `Ver todos (${filas.length})`}
        </Button>
      )}
    </>
  );
}
