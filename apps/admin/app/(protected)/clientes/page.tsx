import { PageHeader } from "@/components/PageHeader";
import { getActiveRestaurantId } from "@/lib/active-restaurant";
import { listCustomers } from "@/lib/data/customers";
import { CustomersTable } from "./CustomersTable";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const restaurantId = getActiveRestaurantId();
  const customers = await listCustomers(restaurantId);

  const withPhone = customers.filter((c) => c.phoneDigits).length;
  const withEmail = customers.filter((c) => c.email).length;
  const recurring = customers.filter((c) => c.visits > 1).length;

  return (
    <section className="flex w-full flex-col gap-6">
      <PageHeader
        title="Clientes"
        description="Base de clientes montada a partir de quem deixou contato nas avaliações desta unidade."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatBox label="Clientes" value={String(customers.length)} hint="contatos únicos" />
        <StatBox label="Com WhatsApp" value={String(withPhone)} hint="têm telefone" />
        <StatBox label="Com e-mail" value={String(withEmail)} hint="têm e-mail" />
        <StatBox label="Recorrentes" value={String(recurring)} hint="+1 avaliação" />
      </div>

      <CustomersTable customers={customers} />

      <p className="text-xs text-ink-muted">
        Os contatos vêm do formulário público de avaliação (campos opcionais). A mesma pessoa que
        avaliou mais de uma vez é unificada por telefone ou e-mail.
      </p>
    </section>
  );
}

function StatBox({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-xl border border-ink-ghost bg-bg-card px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-soft">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">{value}</p>
      <p className="text-[11px] text-ink-muted">{hint}</p>
    </div>
  );
}
