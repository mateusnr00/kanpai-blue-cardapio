import Link from "next/link";
import { notFound } from "next/navigation";
import { getDish } from "@/lib/data/dishes";
import { listSections } from "@/lib/data/sections";
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
    <section className="flex flex-col gap-6">
      <Link href={`/dishes/${dish.id}`} className="text-xs text-ink-soft hover:text-ink">
        ← Voltar pro prato
      </Link>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Detalhes de: {dish.name}</h1>
        <p className="text-xs text-ink-soft">
          Texto longo + seções aparecem no modal "Ver itens" do prato no cardápio.
        </p>
      </div>

      <DishDetailsForm
        initialLongDescription={dish.long_description ?? ""}
        initialSections={sections}
        onSubmit={onSubmit}
      />
    </section>
  );
}
