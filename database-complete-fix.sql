-- 1. Önce mevcut constraint'i kaldır
ALTER TABLE players 
DROP CONSTRAINT IF EXISTS check_team;

-- 2. Mevcut verileri kontrol et
SELECT id, name, team, created_at FROM players;

-- 3. Geçersiz team değerlerini temizle
UPDATE players 
SET team = 'unassigned' 
WHERE team IS NULL 
   OR team = '' 
   OR team NOT IN ('team_a', 'team_b', 'unassigned');

-- 4. Yeni constraint'i ekle
ALTER TABLE players 
ADD CONSTRAINT check_team 
CHECK (team IN ('team_a', 'team_b', 'unassigned'));

-- 5. Son durumu kontrol et
SELECT team, COUNT(*) as count 
FROM players 
GROUP BY team;

-- 6. Tüm oyuncuları listele
SELECT * FROM players ORDER BY created_at DESC; 