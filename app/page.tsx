import { categories } from "@/lib/menu-data";
import { AppShell } from "@/components/AppShell";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CategoryCard } from "@/components/CategoryCard";

export default function HomePage() {
  return (
    <AppShell>
      <Header />
      <main>
        <section
          style={{
            padding: "40px 22px 28px",
          }}
        >
          <h1
            style={{
              fontSize: 44,
              fontWeight: 500,
              letterSpacing: "-0.03em",
              lineHeight: 1,
              margin: 0,
              color: "var(--ink)",
            }}
          >
            Cardápio
          </h1>
          <p
            style={{
              marginTop: 14,
              marginBottom: 0,
              fontSize: 11,
              fontWeight: 400,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--ink-soft)",
            }}
          >
            Explore
          </p>
        </section>

        <section
          style={{
            padding: "8px 22px 24px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 14,
            }}
            className="category-grid"
          >
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </section>
      </main>
      <Footer left="Goiânia" right={`${String(categories.length).padStart(2, "0")} categorias`} />

      {/* responsive desktop columns */}
      <style>{`
        @media (min-width: 1100px) {
          .category-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            gap: 18px !important;
          }
        }
      `}</style>
    </AppShell>
  );
}
