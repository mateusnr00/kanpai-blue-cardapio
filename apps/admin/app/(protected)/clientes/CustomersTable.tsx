"use client";

import { useMemo, useState } from "react";
import { MagnifyingGlass, WhatsappLogo, EnvelopeSimple, DownloadSimple, Star } from "@phosphor-icons/react";
import { whatsappNumber, type Customer } from "@/lib/data/customers-shared";

type Props = {
  customers: Customer[];
};

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    // eslint-disable-next-line no-misleading-character-class
    .replace(/[̀-ͯ]/g, "");
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function fmtAvg(n: number | null): string {
  return n == null ? "-" : n.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

/** Escapa um valor pra CSV (aspas + separador + quebra de linha). */
function csvCell(v: string | number | null): string {
  const s = v == null ? "" : String(v);
  return `"${s.replace(/"/g, '""')}"`;
}

export function CustomersTable({ customers }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = norm(query.trim());
    if (!q) return customers;
    return customers.filter((c) =>
      norm([c.name ?? "", c.email ?? "", c.phone ?? "", c.phoneDigits ?? ""].join(" ")).includes(q),
    );
  }, [customers, query]);

  function exportCsv() {
    const header = ["Nome", "Telefone", "E-mail", "Visitas", "Nota média", "Primeira visita", "Última visita", "Último comentário"];
    const lines = filtered.map((c) =>
      [
        c.name ?? "",
        c.phone ?? "",
        c.email ?? "",
        c.visits,
        c.avgOverall == null ? "" : c.avgOverall.toFixed(1),
        fmtDate(c.firstVisit),
        fmtDate(c.lastVisit),
        c.lastComment ?? "",
      ]
        .map(csvCell)
        .join(","),
    );
    const csv = [header.map(csvCell).join(","), ...lines].join("\r\n");
    // BOM pra o Excel abrir acentos corretamente.
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clientes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <MagnifyingGlass
            size={18}
            weight="bold"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome, telefone ou e-mail..."
            className="admin-input w-full pl-10"
            aria-label="Buscar cliente"
          />
        </div>
        <button
          type="button"
          onClick={exportCsv}
          disabled={filtered.length === 0}
          className="admin-btn-secondary shrink-0"
        >
          <DownloadSimple size={16} weight="bold" />
          Exportar CSV
          <span className="tabular-nums text-ink-muted">({filtered.length})</span>
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="admin-empty">
          {customers.length === 0
            ? "Nenhum cliente ainda. Quando alguém deixar contato numa avaliação, aparece aqui."
            : "Nenhum cliente encontrado para essa busca."}
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Contato</th>
                <th className="w-20 text-center">Visitas</th>
                <th className="w-20 text-center">Nota</th>
                <th className="w-28">Última visita</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const wa = whatsappNumber(c.phoneDigits);
                return (
                  <tr key={c.key}>
                    <td>
                      <div className="font-medium text-ink">{c.name ?? "—"}</div>
                      {c.lastComment ? (
                        <div className="line-clamp-1 max-w-md text-xs italic text-ink-muted">
                          “{c.lastComment}”
                        </div>
                      ) : null}
                    </td>
                    <td>
                      <div className="flex flex-col gap-1">
                        {c.phone ? (
                          <a
                            href={wa ? `https://wa.me/${wa}` : undefined}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex w-fit items-center gap-1.5 text-sm text-ink transition hover:text-accent"
                            title="Abrir no WhatsApp"
                          >
                            <WhatsappLogo size={15} weight="fill" className="text-success" />
                            {c.phone}
                          </a>
                        ) : null}
                        {c.email ? (
                          <a
                            href={`mailto:${c.email}`}
                            className="inline-flex w-fit items-center gap-1.5 text-xs text-ink-muted transition hover:text-accent"
                          >
                            <EnvelopeSimple size={14} weight="duotone" />
                            {c.email}
                          </a>
                        ) : null}
                        {!c.phone && !c.email ? <span className="text-xs text-ink-faint">—</span> : null}
                      </div>
                    </td>
                    <td className="text-center">
                      <span className="tabular-nums font-medium text-ink">{c.visits}</span>
                    </td>
                    <td className="text-center">
                      {c.avgOverall == null ? (
                        <span className="text-ink-faint">-</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 tabular-nums text-ink">
                          <Star size={13} weight="fill" className="text-amber-500" />
                          {fmtAvg(c.avgOverall)}
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap text-sm text-ink-muted">{fmtDate(c.lastVisit)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
