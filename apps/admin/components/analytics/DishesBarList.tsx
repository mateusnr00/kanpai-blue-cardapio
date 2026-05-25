"use client";

import { useState } from "react";
import type { DishRank } from "@/lib/data/analytics";
import { CHART_LABELS } from "@/lib/analytics-labels";
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
  const { dishes: labels } = CHART_LABELS;

  if (dishes.length === 0) {
    return (
      <ChartPanel title={labels.title} description={labels.description}>
        <ChartEmpty message={labels.empty} />
      </ChartPanel>
    );
  }

  return (
    <>
      <ChartPanel
        title={labels.title}
        description={labels.description}
        className="flex flex-col"
      >
        <DishRankBars dishes={preview} />
        {hasMore ? (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="admin-btn-secondary mt-5 w-full text-sm"
          >
            {labels.seeMore(dishes.length)}
          </button>
        ) : null}
      </ChartPanel>

      <AnalyticsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={labels.modalTitle}
        description={labels.modalDescription(dishes.length)}
      >
        <DishRankBars dishes={dishes} />
      </AnalyticsModal>
    </>
  );
}
