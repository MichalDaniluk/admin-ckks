#!/bin/bash
# Skrypt konfiguracyjny serwera produkcyjnego
# Uruchom ten skrypt na serwerze: bash server-setup.sh

set -e

echo "=== Konfiguracja serwera produkcyjnego admin.selpio.com ==="

# Kolory
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}1. Tworzenie struktury katalogów...${NC}"
mkdir -p ~/domains/apifleet.selpio.com/public_nodejs
mkdir -p ~/domains/fleet.selpio.com/public_html
echo -e "${GREEN}✓ Katalogi utworzone${NC}"

echo -e "\n${YELLOW}2. Tworzenie pliku .env.production dla backendu...${NC}"
cat > ~/domains/apifleet.selpio.com/.env.production << 'EOF'
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=twoja_nazwa_bazy
DB_PASSWORD=twoje_haslo
DB_DATABASE=flota_production

# Application
NODE_ENV=production
PORT=3000
API_PREFIX=api/v1

# JWT
JWT_SECRET=ZMIEN_TO_NA_LOSOWY_STRING_MIN_32_ZNAKI
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=ZMIEN_TO_NA_INNY_LOSOWY_STRING_MIN_32_ZNAKI
JWT_REFRESH_EXPIRES_IN=30d

# Frontend URL
FRONTEND_URL=https://admin.selpio.com

# Redis (jeśli używasz)
REDIS_HOST=localhost
REDIS_PORT=6379
EOF
echo -e "${GREEN}✓ Plik .env.production utworzony${NC}"
echo -e "${YELLOW}  WAŻNE: Edytuj ~/domains/apiadmin.selpio.com/.env.production i ustaw właściwe wartości!${NC}"

echo -e "\n${YELLOW}3. Sprawdzanie czy PostgreSQL jest dostępny...${NC}"
if command -v psql &> /dev/null; then
    echo -e "${GREEN}✓ PostgreSQL zainstalowany${NC}"
else
    echo -e "${YELLOW}⚠ PostgreSQL nie znaleziony - sprawdź panel MyDevil${NC}"
fi

echo -e "\n${YELLOW}4. Sprawdzanie czy Node.js jest dostępny...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js $NODE_VERSION zainstalowany${NC}"
else
    echo -e "${YELLOW}⚠ Node.js nie znaleziony - zainstaluj przez panel MyDevil${NC}"
fi

echo -e "\n${YELLOW}5. Sprawdzanie PM2...${NC}"
if command -v pm2 &> /dev/null; then
    echo -e "${GREEN}✓ PM2 zainstalowany${NC}"
else
    echo -e "${YELLOW}⚠ PM2 nie zainstalowany. Instaluję...${NC}"
    npm install -g pm2
    pm2 startup
    echo -e "${GREEN}✓ PM2 zainstalowany${NC}"
fi

echo -e "\n${GREEN}=== Konfiguracja zakończona ===${NC}"
echo -e "\n${YELLOW}Następne kroki:${NC}"
echo "1. Edytuj plik: nano ~/domains/apiadmin.selpio.com/.env.production"
echo "2. Ustaw prawdziwe dane dostępowe do bazy danych"
echo "3. Wygeneruj bezpieczne klucze JWT (min 32 znaki)"
echo "4. Utwórz bazę danych PostgreSQL przez panel MyDevil"
echo "5. Skonfiguruj domeny w panelu MyDevil:"
echo "   - admin.selpio.com -> Strona WWW -> public_html -> SSL"
echo "   - apiadmin.selpio.com -> Proxy Node.js port 3000 -> public_nodejs -> SSL"
echo "6. Uruchom deployment z GitHub Actions"

echo -e "\n${YELLOW}Uprawnienia katalogów:${NC}"
chmod 755 ~/domains/apiadmin.selpio.com/public_nodejs
chmod 755 ~/domains/admin.selpio.com/public_html
chmod 600 ~/domains/apiadmin.selpio.com/.env.production

echo -e "\n${GREEN}Struktura katalogów:${NC}"
tree -L 2 ~/domains/ 2>/dev/null || ls -la ~/domains/

echo -e "\n${YELLOW}Aby wygenerować bezpieczne klucze JWT, użyj:${NC}"
echo "openssl rand -base64 32"
