'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Player } from '@/lib/supabase';

interface PlayerCardProps {
  player: Player;
  onDelete: (id: number) => void;
  index?: number;
}

export function PlayerCard({ player, onDelete, index }: PlayerCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: player.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/30 transition-colors cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {index && (
              <span className="bg-white/20 text-white text-sm font-bold px-2 py-1 rounded-full min-w-[24px] text-center">
                {index}
              </span>
            )}
            <h3 className="font-semibold text-lg">{player.name}</h3>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(player.id);
          }}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
        >
          Sil
        </button>
      </div>
    </div>
  );
}
