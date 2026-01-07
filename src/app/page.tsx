'use client';

import { TeamColumn } from '@/components/TeamColumn';
import { Player, supabase } from '@/lib/supabase';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Check, Copy } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function Home() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activePlayer, setActivePlayer] = useState<Player | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mobile-friendly sensors with touch support
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    })
  );

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlayers(data || []);
    } catch (error) {
      console.error('Oyuncular yüklenirken hata:', error);
      setError('Oyuncular yüklenirken bir hata oluştu');
    }
  };

  const addPlayer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (players.length >= 14) {
      setError('Takım 14 kişi ile sınırlıdır!');
      return;
    }

    if (!newPlayerName.trim()) {
      setError('Oyuncu adı gereklidir!');
      return;
    }

    setLoading(true);
    setError('');

    // Optimistic update için geçici ID
    const tempId = Date.now();
    const newPlayer: Player = {
      id: tempId,
      name: newPlayerName.trim(),
      team: 'unassigned',
      created_at: new Date().toISOString(),
    };

    // Optimistic update
    setPlayers((prev) => [newPlayer, ...prev]);
    setNewPlayerName('');

    try {
      const { data, error } = await supabase
        .from('players')
        .insert([
          {
            name: newPlayer.name,
            team: 'unassigned',
          },
        ])
        .select();

      if (error) throw error;

      // Gerçek ID ile güncelle
      if (data && data[0]) {
        setPlayers((prev) =>
          prev.map((p) =>
            p.id === tempId
              ? { ...p, id: data[0].id, created_at: data[0].created_at }
              : p
          )
        );
      }
    } catch (error) {
      console.error('Oyuncu eklenirken hata:', error);
      setError('Oyuncu eklenirken bir hata oluştu');
      // Hata durumunda geçici oyuncuyu kaldır
      setPlayers((prev) => prev.filter((p) => p.id !== tempId));
    } finally {
      setLoading(false);
      // Input'a focus ol
      inputRef.current?.focus();
    }
  };

  const deletePlayer = async (id: number) => {
    // Optimistic update
    setPlayers((prev) => prev.filter((p) => p.id !== id));

    try {
      const { error } = await supabase.from('players').delete().eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Oyuncu silinirken hata:', error);
      setError('Oyuncu silinirken bir hata oluştu');
      // Hata durumunda geri yükle
      fetchPlayers();
    }
  };

  const updatePlayerTeam = async (playerId: number, newTeam: string) => {
    // Optimistic update
    setPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, team: newTeam } : p))
    );

    try {
      const { error } = await supabase
        .from('players')
        .update({ team: newTeam })
        .eq('id', playerId);

      if (error) throw error;
    } catch (error) {
      console.error('Oyuncu takımı güncellenirken hata:', error);
      setError('Oyuncu takımı güncellenirken bir hata oluştu');
      // Hata durumunda geri yükle
      fetchPlayers();
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const player = players.find(
      (p) => p.id === parseInt(event.active.id as string)
    );
    setActivePlayer(player || null);
    // Prevent body scroll on mobile while dragging
    document.body.style.overflow = 'hidden';
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (over) {
      const overIdString = over.id as string;
      // Only set overId if it's a valid team dropzone
      if (['team_a', 'team_b', 'unassigned'].includes(overIdString)) {
        setOverId(overIdString);
      } else {
        // If over a player card, get the team of that player
        const targetPlayer = players.find(
          (p) => p.id === parseInt(overIdString)
        );
        if (targetPlayer) {
          setOverId(targetPlayer.team);
        }
      }
    } else {
      setOverId(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActivePlayer(null);
    setOverId(null);
    // Restore body scroll
    document.body.style.overflow = '';

    if (!over) return;

    const playerId = parseInt(active.id as string);
    let newTeam = over.id as string;

    // Eğer başka bir kartın üzerine bırakıldıysa
    if (!['team_a', 'team_b', 'unassigned'].includes(newTeam)) {
      const targetPlayer = players.find((p) => p.id === parseInt(newTeam));
      newTeam = targetPlayer?.team || 'unassigned';
    }

    updatePlayerTeam(playerId, newTeam);
  };

  const handleDragCancel = () => {
    setActivePlayer(null);
    setOverId(null);
    // Restore body scroll
    document.body.style.overflow = '';
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const unassignedPlayers = players.filter((p) => p.team === 'unassigned');
  const teamAPlayers = players.filter((p) => p.team === 'team_a');
  const teamBPlayers = players.filter((p) => p.team === 'team_b');

  return (
    <div className="min-h-screen text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <h1 className="text-3xl font-bold mb-4 tracking-tight text-white">
            Halı Saha Takımı
          </h1>
          <p className="text-zinc-500 text-lg font-medium">
            Oyuncuları sürükleyerek takımlara atayın
          </p>
          <div className="mt-6 bg-zinc-900 border border-zinc-800 rounded-full px-6 py-2 inline-block">
            <span className="text-sm font-semibold text-zinc-400">
              Toplam Oyuncu:{' '}
              <span className="text-zinc-200">{players.length}</span>/14
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}
        {/* Add Player Form */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-3 text-zinc-100 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="32px"
              viewBox="0 -960 960 960"
              width="32px"
              fill="#e3e3e3"
            >
              <path d="m368-4-70-40 120-208-68-40-60 104-70-40 206-356q-38-39-57-89t-19-103q0-36 9-71.5t29-68.5l68 40q-14 23-20 47.5t-6 50.5q0 53 26 99.5t74 74.5l90 52q62 36 91 103.5T740-322q0 38-10 74t-28 68l-70-40q14-24 20-49t6-51q0-32-9-62t-29-56L368-4Zm272-596q-33 0-56.5-23.5T560-680q0-33 23.5-56.5T640-760q33 0 56.5 23.5T720-680q0 33-23.5 56.5T640-600ZM540-800q-26 0-43-18t-17-42q0-26 18-43t42-17q26 0 43 18t17 42q0 26-18 43t-42 17Z" />
            </svg>
            Yeni Oyuncu Ekle
          </h2>
          <form onSubmit={addPlayer} className="flex">
            <input
              ref={inputRef}
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              className="flex-1 px-6 py-4 rounded-l-2xl bg-zinc-900 border border-zinc-800 border-r-0 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors text-lg"
              placeholder="Oyuncu adını girin"
              disabled={loading || players.length >= 14}
            />
            <button
              type="submit"
              disabled={loading || players.length >= 14}
              className="px-8 py-4 bg-zinc-100 text-black font-bold rounded-r-2xl hover:bg-white disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed transition-colors border border-zinc-800"
            >
              {loading
                ? 'Ekleniyor...'
                : players.length >= 14
                ? 'Takım Dolu'
                : 'Ekle'}
            </button>
          </form>
        </div>

        {/* Teams Layout */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Unassigned Players */}
            <TeamColumn
              title="Atanmamış Oyuncular"
              players={unassignedPlayers}
              teamId="unassigned"
              onDeletePlayer={deletePlayer}
              className="bg-zinc-900/30 border border-zinc-800/50"
              isOver={overId === 'unassigned'}
            />

            {/* Team A */}
            <TeamColumn
              title="Takım A"
              players={teamAPlayers}
              teamId="team_a"
              onDeletePlayer={deletePlayer}
              className="bg-zinc-900/30 border border-zinc-800/50"
              isOver={overId === 'team_a'}
            />

            {/* Team B */}
            <TeamColumn
              title="Takım B"
              players={teamBPlayers}
              teamId="team_b"
              onDeletePlayer={deletePlayer}
              className="bg-zinc-900/30 border border-zinc-800/50"
              isOver={overId === 'team_b'}
            />
          </div>

          <DragOverlay
            dropAnimation={{
              duration: 300,
              easing: 'cubic-bezier(0.18, 0.67, 0.6, 1)',
            }}
            style={{
              cursor: 'grabbing',
            }}
            className="z-50 touch-none"
          >
            {activePlayer ? (
              <div className="transform rotate-2 scale-110 shadow-2xl opacity-95 pointer-events-none">
                <div className="bg-zinc-900 p-4 border-2 border-zinc-500 rounded-lg min-w-[200px]">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-white">
                        {activePlayer.name}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
