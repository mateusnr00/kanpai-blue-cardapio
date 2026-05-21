"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { categories } from "@/lib/menu-data";
import { fs } from "@/lib/scale";
import { AppShell } from "@/components/AppShell";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CategoryCard } from "@/components/CategoryCard";
import { IntroAnimation } from "@/components/IntroAnimation";
import { SearchBar } from "@/components/SearchBar";

const SESSION_KEY = "kanpai-intro-seen";

export default function HomePage() {
  // Decisão sobre tocar a intro só rola no cliente (precisa de sessionStorage).
  // Durante SSR / hidratação inicial, mantemos as cards "escondidas" (opacity 0)
  // até o cliente decidir.
  const [decided, setDecided] = useState(false);
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {}
    setShowIntro(!seen);
    setDecided(true);
  }, []);

  const handleIntroDone = () => {
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {}
    setShowIntro(false);
  };

  // Conteúdo está "pronto pra aparecer" quando já decidimos e a intro não está rolando
  const ready = decided && !showIntro;

  return (
    <>
      <AppShell>
        <Header />
        <main>
          <section
            style={{
              padding: "40px 22px 18px",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
              transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
              style={{
                fontSize: fs(44),
                fontWeight: 500,
                letterSpacing: "-0.03em",
                lineHeight: 1,
                margin: 0,
                color: "var(--ink)",
              }}
            >
              Cardápio
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={ready ? { opacity: 1 } : { opacity: 0 }}
              transition={{
                duration: 0.4,
                delay: ready ? 0.15 : 0,
                ease: [0.32, 0.72, 0, 1],
              }}
              style={{
                marginTop: 14,
                marginBottom: 0,
                fontSize: fs(11),
                fontWeight: 400,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--ink-soft)",
              }}
            >
              Explore
            </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={ready ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, delay: ready ? 0.2 : 0, ease: [0.32, 0.72, 0, 1] }}
              style={{ flexShrink: 0 }}
            >
              <SearchBar />
            </motion.div>
          </section>

          <section style={{ padding: "8px 22px 24px" }}>
            <motion.div
              className="category-grid"
              initial="hidden"
              animate={ready ? "show" : "hidden"}
              variants={{
                hidden: {},
                show: {
                  transition: { staggerChildren: 0.07, delayChildren: 0.25 },
                },
              }}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 14,
              }}
            >
              {categories.map((category) => (
                <motion.div
                  key={category.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.55, ease: [0.32, 0.72, 0, 1] },
                    },
                  }}
                >
                  <CategoryCard category={category} />
                </motion.div>
              ))}
            </motion.div>
          </section>
        </main>
        <Footer
          left="Goiânia"
          right={`${String(categories.length).padStart(2, "0")} categorias`}
        />

        <style>{`
          @media (min-width: 1100px) {
            .category-grid {
              grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
              gap: 18px !important;
            }
          }
        `}</style>
      </AppShell>

      <AnimatePresence>
        {showIntro && <IntroAnimation key="intro" onDone={handleIntroDone} />}
      </AnimatePresence>
    </>
  );
}
