"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { SpiritAnimal } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

interface SpiritAnimalSelectorProps {
  onSelect: (animalId: string) => void;
  selectedId?: string;
  className?: string;
}

export function SpiritAnimalSelector({
  onSelect,
  selectedId,
  className,
}: SpiritAnimalSelectorProps) {
  const [animals, setAnimals] = useState<SpiritAnimal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnimals() {
      try {
        const res = await fetch("/api/spirit-animals");
        if (res.ok) {
          const data = await res.json();
          setAnimals(data);
        }
      } catch (error) {
        console.error("Failed to fetch spirit animals:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAnimals();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
        className,
      )}
    >
      {animals.map((animal) => {
        const isSelected = selectedId === animal.id;

        return (
          <div
            key={animal.id}
            onClick={() => onSelect(animal.id)}
            className={cn(
              "cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 hover:scale-[1.02]",
              isSelected
                ? "border-blue-600 bg-blue-50 shadow-md ring-2 ring-blue-600 ring-offset-2"
                : "border-slate-200 hover:border-blue-300 hover:bg-slate-50",
            )}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div
                className="relative w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-inner border"
                style={{
                  backgroundColor: `${animal.color}20`,
                  borderColor: animal.color,
                }}
              >
                {/* Fallback to emoji if no image */}
                {animal.slug === "dragon" && "🐉"}
                {animal.slug === "phoenix" && "🦅"}
                {animal.slug === "turtle" && "🐢"}
                {animal.slug === "tiger" && "🐯"}
                {animal.slug === "unicorn" && "🦄"}

                {/* 
                  TODO: Enable Image component once we have real assets
                  {animal.imageUrl && (
                    <Image
                      src={animal.imageUrl}
                      alt={animal.name}
                      fill
                      className="object-contain p-2"
                    />
                  )}
                */}
              </div>

              <div>
                <h3
                  className="font-bold text-gray-900"
                  style={{ color: animal.color }}
                >
                  {animal.name}
                </h3>
                <div className="flex flex-wrap justify-center gap-1 mt-2">
                  {animal.personality.map((trait) => (
                    <span
                      key={trait}
                      className="inline-block px-2 py-0.5 bg-white rounded-full text-[10px] font-medium border text-gray-500 uppercase tracking-tighter"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2 line-clamp-3 leading-relaxed">
                  {animal.description}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
