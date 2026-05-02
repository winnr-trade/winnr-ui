"use client";

import { useEffect } from "react";
import { useGetCategories } from "@/api/market";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/useAppStore";

export function MarketCategories() {
  const { data: categories, isLoading } = useGetCategories();
  const { activeCategory, setActiveCategory } = useAppStore();

  useEffect(() => {
    if (categories && categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].name);
    }
  }, [categories, activeCategory, setActiveCategory]);

  if (isLoading || !categories) return null;

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-center gap-8 py-4 px-1">
      <div className="flex items-center gap-3 overflow-x-auto pb-4 lg:pb-0 scrollbar-none justify-center w-full">
        {categories.map((cat) => (
          <Button
            key={cat.name}
            variant="pill"
            size="pill"
            data-active={activeCategory === cat.name}
            onClick={() => setActiveCategory(cat.name)}
          >
            {cat.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
