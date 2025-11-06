# Instrukcja Wdrożenia na Produkcję

## Wymagane Secrets w GitHub

Aby wdrożenie działało poprawnie, musisz skonfigurować następujące sekrety w GitHub:

1. Przejdź do **Settings** → **Secrets and variables** → **Actions**
2. Kliknij **New repository secret**
3. Dodaj następujące sekrety:

### Wymagane Sekrety

| Nazwa | Opis | Przykład |
|-------|------|----------|
| `PROD_HOST` | Adres serwera produkcyjnego | `s76.mydevil.net` |
| `PROD_USER` | Nazwa użytkownika SSH | `twoja_nazwa_uzytkownika` |
| `PROD_SSH_KEY` | Klucz prywatny SSH | (zawartość pliku ~/.ssh/id_rsa) |
| `PROD_SSH_PORT` | Port SSH | `22` lub inny port |

## Generowanie Klucza SSH

Jeśli nie masz jeszcze klucza SSH:

```bash
# Wygeneruj parę kluczy SSH
ssh-keygen -t rsa -b 4096 -C "github-actions@admin.selpio.com" -f ~/.ssh/flota_deploy_key

# Skopiuj klucz publiczny na serwer
ssh-copy-id -i ~/.ssh/admin_deploy_key.pub twoj_user@s76.mydevil.net

# Wyświetl klucz prywatny (skopiuj całą zawartość do GitHub Secret PROD_SSH_KEY)
cat ~/.ssh/admin_deploy_key
```

## Konfiguracja na Serwerze Produkcyjnym

### 1. Przygotowanie Struktury Katalogów

Połącz się z serwerem i utwórz niezbędne katalogi:

```bash
ssh twoj_user@s76.mydevil.net

# Backend
mkdir -p ~/domains/apiadmin.selpio.com/public_nodejs

# Frontend
mkdir -p ~/domains/admin.selpio.com/public_html
```

### 2. Konfiguracja Backend (.env.production)

Utwórz plik `~/domains/apiadmin.selpio.com/.env.production`:

```bash
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
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_in_production
JWT_REFRESH_EXPIRES_IN=30d

# Frontend URL
FRONTEND_URL=https://admin.selpio.com

# Redis (jeśli używasz)
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 3. Instalacja PM2 (Menedżer Procesów Node.js)

```bash
npm install -g pm2

# Skonfiguruj PM2 do automatycznego uruchamiania
pm2 startup
# Wykonaj polecenie które wyświetli PM2
```

### 4. Konfiguracja Bazy Danych

```bash
# Zaloguj się do PostgreSQL
psql

# Utwórz bazę danych
CREATE DATABASE flota_production;

# Utwórz użytkownika
CREATE USER flota_user WITH PASSWORD 'strong_password';

# Nadaj uprawnienia
GRANT ALL PRIVILEGES ON DATABASE flota_production TO flota_user;
```

### 5. Konfiguracja Domen w Panel MyDevil

1. Przejdź do panelu MyDevil
2. Dodaj domenę `admin.selpio.com`:
   - Typ: **Strona WWW**
   - Katalog: `public_html`
   - SSL: **Włącz Let's Encrypt**

3. Dodaj subdomenę `apiadmin.selpio.com`:
   - Typ: **Proxy do aplikacji Node.js**
   - Port: `3000` (lub inny port z .env)
   - Katalog: `public_nodejs`
   - SSL: **Włącz Let's Encrypt**

## Uruchamianie Wdrożenia

### Automatyczne Wdrożenie

Wdrożenie uruchamia się automatycznie po:
- Push do gałęzi `main` z zmianami w katalogach `backend/` lub `frontend/`

### Manualne Wdrożenie

Możesz również uruchomić wdrożenie ręcznie:

1. Przejdź do zakładki **Actions** w repozytorium GitHub
2. Wybierz workflow:
   - `Deploy Backend to Production` lub
   - `Deploy Frontend to Production`
3. Kliknij **Run workflow**
4. Wybierz gałąź `main`
5. Kliknij **Run workflow**

## Monitorowanie

### Sprawdzanie Logów Backend

```bash
ssh twoj_user@s76.mydevil.net

# Logi PM2
pm2 logs admin-backend

# Ostatnie błędy
pm2 logs admin-backend --err

# Monitor procesów
pm2 monit
```

### Sprawdzanie Statusu

```bash
# Status aplikacji
pm2 status

# Restart aplikacji
pm2 restart admin-backend

# Zatrzymanie aplikacji
pm2 stop admin-backend

# Usunięcie aplikacji z PM2
pm2 delete admin-backend
```

### Health Checks

Backend:
```bash
curl https://apiadmin.selpio.com/api/v1/health
```

Frontend:
```bash
curl https://admin.selpio.com
```

## Rollback (Powrót do Poprzedniej Wersji)

### Backend

```bash
ssh twoj_user@s76.mydevil.net
cd ~/domains/apiadmin.selpio.com/public_nodejs

# Lista dostępnych backupów
ls -lh backup_*

# Przywróć wybrany backup
mv current current_failed
mv backup_20250101_120000 current

# Restart aplikacji
pm2 restart admin-backend
```

### Frontend

```bash
ssh twoj_user@s76.mydevil.net
cd ~/domains/admin.selpio.com

# Lista dostępnych backupów
ls -lh backups/

# Przywróć wybrany backup
rm -rf public_html/*
tar -xzf backups/backup_20250101_120000.tar.gz -C public_html/
```

## Rozwiązywanie Problemów

### Backend nie startuje

1. Sprawdź logi: `pm2 logs flota-backend --err`
2. Sprawdź konfigurację .env
3. Sprawdź połączenie z bazą danych
4. Sprawdź czy port nie jest zajęty: `netstat -tulpn | grep 3000`

### Frontend pokazuje błędy API

1. Sprawdź czy backend działa: `pm2 status`
2. Sprawdź plik `environment.prod.ts` - czy ma prawidłowy URL API
3. Sprawdź CORS w backendzie
4. Sprawdź certyfikat SSL

### Błędy bazy danych

```bash
# Sprawdź czy PostgreSQL działa
ps aux | grep postgres

# Sprawdź połączenie
psql -U admin_user -d admin_production -h localhost

# Sprawdź logi PostgreSQL
tail -f /var/log/postgresql/postgresql-*.log
```

## Aktualizacja Zależności

### Backend

```bash
cd ~/domains/apiadmin.selpio.com/public_nodejs/current
npm update
pm2 restart admin-backend
```

### Migracje Bazy Danych

Jeśli dodajesz nowe migracje, uruchom je ręcznie po wdrożeniu:

```bash
cd ~/domains/apiadmin.selpio.com/public_nodejs/current
npm run migration:run
pm2 restart admin-backend
```

## Kontakt i Wsparcie

W przypadku problemów sprawdź:
1. Logi GitHub Actions
2. Logi PM2 na serwerze
3. Logi błędów w przeglądarce (Console)
4. Panel MyDevil - logi domenowe
