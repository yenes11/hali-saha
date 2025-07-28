'use client';

import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Player } from '@/lib/supabase';
import { PlayerCard } from './PlayerCard';

interface TeamColumnProps {
  title: string;
  players: Player[];
  teamId: string;
  onDeletePlayer: (id: number) => void;
  className?: string;
}

export function TeamColumn({
  title,
  players,
  teamId,
  onDeletePlayer,
  className = '',
}: TeamColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: teamId,
  });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg p-4 border-2 border-dashed transition-colors ${
        isOver ? 'border-white/60 bg-white/20' : 'border-white/20 bg-white/10'
      } ${className}`}
    >
      <h3 className="text-xl font-semibold mb-4 text-center">{title}</h3>
      <div className="text-center mb-4 text-sm text-white/60">
        {players.length} oyuncu
      </div>

      <SortableContext
        items={players.map((p) => p.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {players.length === 0 ? (
            <div className="text-center py-8 text-white/40">
              <p className="text-sm">Oyuncu yok</p>
              <p className="text-xs">Sürükleyerek oyuncu ekleyin</p>
            </div>
          ) : (
            players.map((player, index) => (
              <PlayerCard
                key={player.id}
                player={player}
                onDelete={onDeletePlayer}
                index={index + 1}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}
