# ⚽ Hali Saha Takım Yöneticisi

Futbol takımlarını yönetmek için geliştirilmiş modern web uygulaması. Oyuncuları sürükle-bırak ile takımlara atayabilir, 16 kişilik limit ile takım oluşturabilirsiniz.

## 🚀 Özellikler

- ✅ **Sürükle-Bırak**: Oyuncuları takımlar arasında taşıyın
- ✅ **16 Kişilik Limit**: Maksimum oyuncu sayısı kontrolü
- ✅ **Optimistic Updates**: Anında görsel geri bildirim
- ✅ **Responsive Tasarım**: Mobil ve desktop uyumlu
- ✅ **Futbol Teması**: Yeşil gradient arka plan
- ✅ **Takım Numaralandırma**: Her takımda 1'den başlayan index

## 🛠️ Kurulum

### 1. Projeyi Klonlayın

```bash
git clone https://github.com/your-username/hali-saha.git
cd hali-saha
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Environment Variables Ayarlayın

`.env.local` dosyası oluşturun:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 4. Supabase Kurulumu

1. [Supabase](https://supabase.com) hesabı oluşturun
2. Yeni proje oluşturun
3. SQL Editor'de aşağıdaki komutları çalıştırın:

```sql
-- Players tablosunu oluştur
CREATE TABLE players (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  team TEXT DEFAULT 'unassigned',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_team CHECK (team IN ('team_a', 'team_b', 'unassigned'))
);

-- RLS politikalarını ayarla
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Herkes okuyabilir" ON players FOR SELECT USING (true);
CREATE POLICY "Herkes ekleyebilir" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Herkes silebilir" ON players FOR DELETE USING (true);
CREATE POLICY "Herkes güncelleyebilir" ON players FOR UPDATE USING (true);
```

### 5. Uygulamayı Çalıştırın

```bash
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışacak.

## 🎮 Kullanım

1. **Oyuncu Ekleme**: İsim girip Enter tuşuna basın
2. **Takım Atama**: Oyuncuyu sürükleyip istediğiniz takıma bırakın
3. **Oyuncu Silme**: Her karttaki "Sil" butonunu kullanın
4. **Hızlı Giriş**: Enter tuşu ile hızlıca oyuncu ekleyebilirsiniz

## 🛡️ Güvenlik

- Supabase anon key kullanılıyor (public erişim)
- Row Level Security (RLS) aktif
- Environment variables ile güvenli konfigürasyon

## 🛠️ Teknolojiler

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Drag & Drop**: @dnd-kit
- **State Management**: React Hooks

## 📝 Lisans

MIT License

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

---

⚽ **Hali Saha Takım Yöneticisi** - Futbol takımlarınızı kolayca yönetin!
