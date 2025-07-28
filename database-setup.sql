-- Players tablosunu oluştur
CREATE TABLE players (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) politikalarını ayarla
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Herkesin okuyabilmesi için policy
CREATE POLICY "Herkes okuyabilir" ON players
  FOR SELECT USING (true);

-- Herkesin ekleyebilmesi için policy
CREATE POLICY "Herkes ekleyebilir" ON players
  FOR INSERT WITH CHECK (true);

-- Herkesin silebilmesi için policy
CREATE POLICY "Herkes silebilir" ON players
  FOR DELETE USING (true);

-- Herkesin güncelleyebilmesi için policy
CREATE POLICY "Herkes güncelleyebilir" ON players
  FOR UPDATE USING (true); 