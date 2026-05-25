"use client";

import { useState } from "react";
import type { DishRank } from "@/lib/data/analytics";
import { ChartEmpty, ChartPanel } from "./ChartPanel";
import { AnalyticsModal } from "./AnalyticsModal";
import { DishRankBars, DISH_RANK_PREVIEW } from "./DishRankBars";

type Props = {
  dishes: DishRank[];
};

export function DishesBarList({ dishes }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const preview = dishes.slice(0, DISH_RANK_PREVIEW);
  const hasMore = dishes.length > DISH_RANK_PREVIEW;

  if (dishes.length === 0) {
    return (
      <ChartPanel title="Itens mais vistos" description="Top 10 por impressões na lista">
        <ChartEmpty message="Nenhum item visualizado no período." />
      </ChartPanel>
    );
  }

  return (
    <>
      <ChartPanel
        title="Itens mais vistos"
        description={`Top ${Math.min(DISH_RANK_PREVIEW, dishes.length)} por impressões`}
        className="flex flex-col"
      >
        <DishRankBars dishes={preview} />
        {hasMore ? (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="admin-btn-secondary mt-5 w-full text-sm"
          >
            Ver mais ({dishes.length} itens)
          </button>
        ) : null}
      </ChartPanel>

      <AnalyticsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Todos os itens visualizados"
        description={`${dishes.length} itens no período · ordenados por impressões`}
      >
        <DishRankBars dishes={dishes} />
      </AnalyticsModal>
    </>
  );
}
