'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Player } from '@/lib/supabase';

interface PlayerCardProps {
  player: Player;
  onDelete: (id: number) => void;
  index?: number;
  isDragging?: boolean;
}

export function PlayerCard({
  player,
  onDelete,
  index,
  isDragging: isDraggingProp,
}: PlayerCardProps) {
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
    transition: isDragging ? 'none' : transition,
  };

  const isActuallyDragging = isDragging || isDraggingProp;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group last:rounded-b-lg relative bg-zinc-900 p-4 border border-zinc-800 hover:border-zinc-700 transition-all duration-200 cursor-grab active:cursor-grabbing touch-none select-none ${
        isActuallyDragging
          ? 'opacity-30 scale-95 z-50'
          : 'opacity-100 scale-100'
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            {index && (
              <span className="bg-zinc-950 text-zinc-500 text-xs font-bold px-2 py-1 min-w-[24px] text-center border border-zinc-800">
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
          className="bg-rose-600 font-bold hover:bg-red-700 text-white px-6 py-1 border border-rose-500 rounded-full text-sm transition-colors"
        >
          Sil
        </button>
      </div>
    </div>
  );
}
