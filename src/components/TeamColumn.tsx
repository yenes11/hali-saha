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
  isOver?: boolean;
}

export function TeamColumn({
  title,
  players,
  teamId,
  onDeletePlayer,
  className = '',
  isOver = false,
}: TeamColumnProps) {
  const { setNodeRef } = useDroppable({
    id: teamId,
  });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl border-2 transition-all duration-300 ease-out ${
        isOver
          ? 'border-zinc-400 bg-zinc-800/50 scale-[1.02] shadow-lg shadow-zinc-900/50 ring-2 ring-zinc-500/30'
          : 'border-zinc-800 bg-transparent'
      } ${className}`}
    >
      <div className="border-b p-4 border-zinc-800">
        <h3 className="text-xl font-bold mb-2 text-center text-zinc-100">
          {title}
        </h3>
        <div className="text-center">
          <span className="text-xs font-medium px-3 py-1 rounded-full bg-zinc-900 text-zinc-500 border border-zinc-800">
            {players.length} oyuncu
          </span>
        </div>
      </div>

      <SortableContext
        items={players.map((p) => p.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2 min-h-[200px] p-2">
          {players.length === 0 ? (
            <div
              className={`flex flex-col items-center justify-center h-[200px] text-zinc-700 border-2 border-dashed rounded-lg transition-all duration-300 ${
                isOver
                  ? 'border-zinc-500 bg-zinc-800/30 text-zinc-400'
                  : 'border-zinc-900'
              }`}
            >
              <p className="text-sm font-medium">Henüz oyuncu yok</p>
              <p
                className={`text-xs mt-1 transition-opacity ${
                  isOver ? 'opacity-100' : 'opacity-60'
                }`}
              >
                {isOver ? 'Bırakmak için bırakın' : 'Buraya sürükleyin'}
              </p>
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
