-- Önce eski constraint'i kaldır
ALTER TABLE players 
DROP CONSTRAINT IF EXISTS check_team;

-- Yeni constraint'i ekle (doğru değerlerle)
ALTER TABLE players 
ADD CONSTRAINT check_team 
CHECK (team IN ('team_a', 'team_b', 'unassigned'));

-- Mevcut oyuncuları kontrol et ve güncelle
UPDATE players 
SET team = 'unassigned' 
WHERE team IS NULL OR team NOT IN ('team_a', 'team_b', 'unassigned');

-- Tabloyu kontrol et
SELECT team, COUNT(*) as count 
FROM players 
GROUP BY team; 