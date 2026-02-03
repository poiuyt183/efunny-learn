"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SpiritAnimal } from "@/generated/prisma/client";

interface SpiritAnimalSelectorProps {
    spiritAnimals: SpiritAnimal[];
    selectedId?: string;
    onSelect: (id: string) => void;
}

export function SpiritAnimalSelector({
    spiritAnimals,
    selectedId,
    onSelect,
}: SpiritAnimalSelectorProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {spiritAnimals.map((animal) => {
                const isSelected = selectedId === animal.id;

                return (
                    <Card
                        key={animal.id}
                        className={cn(
                            "relative p-4 cursor-pointer transition-all hover:shadow-lg",
                            isSelected && "ring-2 ring-primary shadow-lg"
                        )}
                        onClick={() => onSelect(animal.id)}
                    >
                        {/* Selection Check */}
                        {isSelected && (
                            <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                                <Check className="h-4 w-4 text-primary-foreground" />
                            </div>
                        )}

                        {/* Animal Icon */}
                        <div
                            className="w-16 h-16 rounded-full mb-3 flex items-center justify-center text-2xl"
                            style={{ backgroundColor: `${animal.color}20` }}
                        >
                            <span style={{ color: animal.color }}>
                                {animal.name.charAt(0)}
                            </span>
                        </div>

                        {/* Animal Info */}
                        <h3 className="font-semibold text-lg mb-1">{animal.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                            {animal.description}
                        </p>

                        {/* Personality Tags */}
                        <div className="flex flex-wrap gap-1">
                            {animal.personality.slice(0, 3).map((trait) => (
                                <span
                                    key={trait}
                                    className="text-xs px-2 py-1 rounded-full"
                                    style={{
                                        backgroundColor: `${animal.color}15`,
                                        color: animal.color,
                                    }}
                                >
                                    {trait}
                                </span>
                            ))}
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}
