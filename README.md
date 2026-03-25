Kurulum ve Çalıştırma Adımları

1. Depoyu Klonlayın
git clone https://github.com/atiksav/atiksav-foodbridge-ai.git
cd atiksav-foodbridge-ai

2. Backend (Python & AI) Kurulumu
# Sanal ortam oluşturma
python -m venv venv

# Sanal ortamı aktif etme (Windows)
venv\Scripts\activate

# Sanal ortamı aktif etme (macOS/Linux)
source venv/bin/activate

# Gerekli kütüphanelerin yüklenmesi
pip install -r requirements.txt

3. Ortam Değişkenlerini Yapılandırın
​Proje kök dizininde .env adlı bir dosya oluşturun ve gerekli anahtarları tanımlayın:

DB_CONNECTION=your_database_url
AI_API_KEY=your_gemini_or_openai_key
GOOGLE_MAPS_API=your_google_maps_key

4. Frontend (Mobil/Web) Kurulumu
cd client
npm install

5. Uygulamayı Başlatın
​Aşağıdaki komutları ayrı terminallerde çalıştırarak sistemi ayağa kaldırabilirsiniz:

Backend Sunucusu:
python main.py

Frontend Uygulaması:
npm start

AI Rota Optimizasyon Testi:
python scripts/optimize_route.py --test




