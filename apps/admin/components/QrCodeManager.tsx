"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { QrCode, Copy, DownloadSimple, Trash, Plus } from "@phosphor-icons/react";
import type { QrCodeRow } from "@/lib/data/qrcodes";
import type { RestaurantRow } from "@/lib/restaurants-shared";

type Props = {
  codes: QrCodeRow[];
  restaurants: RestaurantRow[];
  origin: string;
  onCreate: (formData: FormData) => Promise<{ error?: string }>;
  onDelete: (id: string) => Promise<{ error?: string }>;
};

function qrImageUrl(data: string, size = 600): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=10&data=${encodeURIComponent(data)}`;
}

// Mostra o destino de forma amigavel (sem o https:// pra caber).
function prettyTarget(origin: string, target: string): string {
  if (target === "/") return origin.replace(/^https?:\/\//, "");
  if (target.startsWith("/")) return origin.replace(/^https?:\/\//, "") + target;
  return target.replace(/^https?:\/\//, "");
}

export function QrCodeManager({ codes, restaurants, origin, onCreate, onDelete }: Props) {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [target, setTarget] = useState("/"); // padrao: home (kanpaiblue.com)
  const [creating, startCreate] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const presets = [
    { label: "Home (kanpaiblue.com)", value: "/" },
    ...restaurants.map((r) => ({ label: `Cardápio · ${r.name}`, value: `/${r.id}` })),
  ];

  function handleCreate() {
    if (!label.trim()) {
      toast.error("Dê um nome pro QR (ex.: Mesa 4, Balcão, Panfleto).");
      return;
    }
    if (!target.trim()) {
      toast.error("Informe o destino do QR.");
      return;
    }
    const fd = new FormData();
    fd.set("label", label.trim());
    fd.set("target_path", target.trim());
    startCreate(async () => {
      const res = await onCreate(fd);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("QR criado.");
        setLabel("");
        router.refresh();
      }
    });
  }

  function handleDelete(id: string, lbl: string) {
    if (!window.confirm(`Excluir o QR "${lbl}"? As métricas dele somem do painel.`)) return;
    setDeletingId(id);
    onDelete(id)
      .then((res) => {
        if (res.error) toast.error(res.error);
        else {
          toast.success("QR excluído.");
          router.refresh();
        }
      })
      .finally(() => setDeletingId(null));
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Link copiado.");
    } catch {
      toast.error("Não consegui copiar.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Criar novo QR */}
      <div className="rounded-md border border-ink-faint p-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-ink-soft">Novo QR code</p>
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-ink-soft">Nome (só pra você identificar)</span>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ex.: Mesa 4, Balcão, Panfleto, Instagram"
              className="rounded-md border border-ink-faint bg-bg-card px-3 py-2 text-sm outline-none focus:border-ink"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-ink-soft">Destino (pra onde o QR leva)</span>
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder='"/" para a home, "/flamboyant" para um cardápio, ou uma URL completa'
              className="rounded-md border border-ink-faint bg-bg-card px-3 py-2 text-sm outline-none focus:border-ink"
            />
            <span className="text-xs text-ink-muted">
              Vai pra: <strong>{prettyTarget(origin, target || "/")}</strong>
            </span>
          </label>

          <div className="flex flex-wrap gap-1.5">
            {presets.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setTarget(p.value)}
                className={
                  "rounded-md border px-2.5 py-1 text-xs transition " +
                  (target === p.value
                    ? "border-ink bg-ink text-white"
                    : "border-ink-faint bg-bg-card text-ink hover:border-ink")
                }
              >
                {p.label}
              </button>
            ))}
          </div>

          <div>
            <button
              type="button"
              onClick={handleCreate}
              disabled={creating}
              className="inline-flex items-center justify-center gap-1.5 rounded-md bg-ink px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
            >
              <Plus size={16} weight="bold" />
              {creating ? "Gerando..." : "Gerar QR"}
            </button>
          </div>
        </div>
      </div>

      {/* Lista */}
      {codes.length === 0 ? (
        <p className="text-sm italic text-ink-soft">Nenhum QR ainda. Crie o primeiro acima.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {codes.map((c) => {
            const shortUrl = `${origin}/q/${c.slug}`;
            const img = qrImageUrl(shortUrl);
            return (
              <li key={c.id} className="flex flex-col gap-3 rounded-md border border-ink-faint bg-bg-card p-4">
                <div className="flex items-start gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrImageUrl(shortUrl, 240)}
                    alt={`QR de ${c.label}`}
                    width={96}
                    height={96}
                    className="h-24 w-24 shrink-0 rounded-md bg-white p-1 ring-1 ring-ink-ghost"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-ink">
                      <QrCode size={16} weight="duotone" />
                      <p className="truncate font-medium">{c.label}</p>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-ink-muted" title={c.target_path}>
                      → {prettyTarget(origin, c.target_path)}
                    </p>
                    <button
                      type="button"
                      onClick={() => copy(shortUrl)}
                      className="mt-1 inline-flex max-w-full items-center gap-1 text-left text-xs text-ink-muted hover:text-ink"
                      title="Copiar link do QR"
                    >
                      <span className="truncate">{shortUrl.replace(/^https?:\/\//, "")}</span>
                      <Copy size={12} className="shrink-0" />
                    </button>
                    <p className="mt-2 text-sm text-ink">
                      <strong className="tabular-nums">{c.scans}</strong>{" "}
                      <span className="text-ink-soft">{c.scans === 1 ? "leitura" : "leituras"}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={img}
                    target="_blank"
                    rel="noreferrer"
                    download={`qr-${c.slug}.png`}
                    className="inline-flex items-center gap-1.5 rounded-md border border-ink-faint px-3 py-1.5 text-xs font-medium hover:border-ink"
                  >
                    <DownloadSimple size={14} />
                    Baixar QR
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id, c.label)}
                    disabled={deletingId === c.id}
                    className="inline-flex items-center gap-1.5 rounded-md border border-ink-faint px-3 py-1.5 text-xs font-medium text-red-700 hover:border-ink disabled:opacity-50"
                  >
                    <Trash size={14} />
                    Excluir
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
