import { notFound } from "next/navigation";
import { getDish } from "@/lib/data/dishes";
import { listSections } from "@/lib/data/sections";
import { BackLink } from "@/components/BackLink";
import { PageHeader } from "@/components/PageHeader";
import { DishDetailsForm } from "./DishDetailsForm";
import { saveDishDetails } from "./actions";

type Params = { id: string };

export default async function DishDetailsPage({ params }: { params: Params }) {
  const dish = await getDish(params.id);
  if (!dish) notFound();

  const sections = await listSections(dish.id);

  async function onSubmit(formData: FormData) {
    "use server";
    return saveDishDetails(params.id, formData);
  }

  return (
    <section className="flex w-full flex-col gap-6">
      <BackLink href={`/dishes/${dish.id}`}>Voltar ao prato</BackLink>
      <PageHeader
        title={`Detalhes: ${dish.name}`}
        description='Texto longo e seções aparecem no modal "Ver itens" no cardápio.'
      />
      <div className="admin-card p-6 sm:p-8">
        <DishDetailsForm
          initialLongDescription={dish.long_description ?? ""}
          initialSections={sections}
          onSubmit={onSubmit}
        />
      </div>
    </section>
  );
}
