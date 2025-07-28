'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase, Player } from '@/lib/supabase';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { PlayerCard } from '@/components/PlayerCard';
import { TeamColumn } from '@/components/TeamColumn';

export default function Home() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activePlayer, setActivePlayer] = useState<Player | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
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

    if (players.length >= 16) {
      setError('Takım 16 kişi ile sınırlıdır!');
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

  const updatePlayerTeam = async (
    playerId: number,
    newTeam: 'team_a' | 'team_b' | 'unassigned'
  ) => {
    // Geçerli team değerlerini kontrol et
    const validTeams = ['team_a', 'team_b', 'unassigned'];
    if (!validTeams.includes(newTeam)) {
      console.error('Geçersiz team değeri:', newTeam);
      return;
    }

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
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActivePlayer(null);

    if (!over) return;

    const playerId = parseInt(active.id as string);
    const newTeam = over.id as 'team_a' | 'team_b' | 'unassigned';

    // Aynı takıma bırakılırsa işlem yapma
    const currentPlayer = players.find((p) => p.id === playerId);
    if (currentPlayer?.team === newTeam) return;

    updatePlayerTeam(playerId, newTeam);
  };

  const unassignedPlayers = players.filter((p) => p.team === 'unassigned');
  const teamAPlayers = players.filter((p) => p.team === 'team_a');
  const teamBPlayers = players.filter((p) => p.team === 'team_b');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">⚽ Hali Saha Takımı</h1>
          <p className="text-green-200">
            Oyuncuları sürükleyerek takımlara atayın
          </p>
          <div className="mt-4 bg-green-800/50 rounded-lg p-4">
            <span className="text-lg font-semibold">
              Toplam Oyuncu: {players.length}/16
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-600 text-white p-4 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        {/* Add Player Form */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Yeni Oyuncu Ekle</h2>
          <form onSubmit={addPlayer} className="flex gap-4">
            <input
              ref={inputRef}
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Oyuncu adını girin"
              disabled={loading || players.length >= 16}
            />
            <button
              type="submit"
              disabled={loading || players.length >= 16}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              {loading
                ? 'Ekleniyor...'
                : players.length >= 16
                ? 'Takım Dolu'
                : 'Ekle'}
            </button>
          </form>
        </div>

        {/* Teams Layout */}
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Unassigned Players */}
            <TeamColumn
              title="Atanmamış Oyuncular"
              players={unassignedPlayers}
              teamId="unassigned"
              onDeletePlayer={deletePlayer}
              className="bg-yellow-900/30"
            />

            {/* Team A */}
            <TeamColumn
              title="Takım A"
              players={teamAPlayers}
              teamId="team_a"
              onDeletePlayer={deletePlayer}
              className="bg-blue-900/30"
            />

            {/* Team B */}
            <TeamColumn
              title="Takım B"
              players={teamBPlayers}
              teamId="team_b"
              onDeletePlayer={deletePlayer}
              className="bg-red-900/30"
            />
          </div>

          <DragOverlay>
            {activePlayer ? (
              <PlayerCard player={activePlayer} onDelete={() => {}} />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
