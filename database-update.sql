-- Mevcut players tablosunu güncelle
ALTER TABLE players 
ADD COLUMN team TEXT DEFAULT 'unassigned';

-- Eski position sütununu kaldır (eğer varsa)
ALTER TABLE players 
DROP COLUMN IF EXISTS position;

-- Team sütunu için constraint ekle
ALTER TABLE players 
ADD CONSTRAINT check_team 
CHECK (team IN ('team_a', 'team_b', 'unassigned'));

-- Mevcut oyuncuları unassigned olarak güncelle
UPDATE players 
SET team = 'unassigned' 
WHERE team IS NULL; 