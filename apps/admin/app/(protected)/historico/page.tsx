import { PageHeader } from "@/components/PageHeader";
import { listAuditLog } from "@/lib/data/audit";
import { AuditList } from "./AuditList";

type SearchParams = {
  entity?: string;
  action?: string;
  restaurant?: string;
};

export default async function HistoricoPage({ searchParams }: { searchParams: SearchParams }) {
  const rows = await listAuditLog({
    limit: 300,
    entityType: searchParams.entity || null,
    action: searchParams.action || null,
    restaurantId: searchParams.restaurant || null,
  });

  return (
    <section className="flex w-full flex-col gap-6">
      <PageHeader
        title="Histórico"
        description="Mudanças feitas no admin: quem alterou, o quê e quando."
      />
      <AuditList
        rows={rows}
        filters={{
          entity: searchParams.entity ?? null,
          action: searchParams.action ?? null,
        }}
      />
    </section>
  );
}
