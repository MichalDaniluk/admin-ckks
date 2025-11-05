# CKKS Admin Panel - Frontend Angular

Panel administracyjny dla systemu zarządzania szkoleniami SaaS CKKS.

## 🚀 Technologie

- **Angular 20** - Framework aplikacji
- **TypeScript** - Język programowania
- **Tailwind CSS** - Style i komponenty UI
- **RxJS** - Zarządzanie stanem i asynchronicznością
- **Angular Router** - Routing aplikacji

## 📁 Struktura Projektu

```
src/app/
├── core/                          # Moduł podstawowy
│   ├── guards/                    # Guards dla ochrony tras
│   │   └── auth.guard.ts         # Auth Guard + Role Guard
│   ├── interceptors/              # HTTP Interceptory
│   │   └── auth.interceptor.ts   # Automatyczne dodawanie tokenów
│   ├── models/                    # Modele TypeScript
│   │   ├── auth.model.ts         # Modele autentykacji
│   │   ├── course.model.ts       # Modele kursów
│   │   ├── session.model.ts      # Modele sesji
│   │   └── enrollment.model.ts   # Modele zapisów
│   └── services/                  # Serwisy API
│       ├── auth.service.ts       # Autentykacja
│       ├── courses.service.ts    # Zarządzanie kursami
│       ├── sessions.service.ts   # Zarządzanie sesjami
│       └── enrollments.service.ts # Zarządzanie zapisami
├── features/                      # Moduły funkcjonalne
│   ├── auth/                     # Moduł autentykacji
│   │   ├── login/                # Komponent logowania
│   │   ├── register/             # Komponent rejestracji
│   │   └── auth.routes.ts        # Routing autentykacji
│   ├── dashboard/                # Panel główny
│   │   ├── main/                 # Główny dashboard
│   │   └── dashboard.routes.ts   # Routing dashboardu
│   ├── courses/                  # Zarządzanie kursami
│   │   ├── list/                 # Lista kursów
│   │   └── courses.routes.ts     # Routing kursów
│   ├── sessions/                 # Zarządzanie sesjami
│   │   ├── list/                 # Lista sesji
│   │   └── sessions.routes.ts    # Routing sesji
│   └── enrollments/              # Zarządzanie zapisami
│       ├── list/                 # Lista zapisów
│       └── enrollments.routes.ts # Routing zapisów
└── shared/                        # Komponenty współdzielone
    ├── components/               # Reusable components
    ├── pipes/                    # Custom pipes
    └── directives/               # Custom directives
```

## 🔧 Instalacja i Uruchomienie

### Wymagania

- Node.js (v18 lub nowszy)
- npm

### Kroki instalacji

1. Przejdź do katalogu frontend:
```bash
cd /Users/miki/Projects/admin-ckks/frontend
```

2. Zainstaluj zależności (już wykonane):
```bash
npm install
```

3. Uruchom serwer deweloperski:
```bash
npm start
```

Aplikacja będzie dostępna pod adresem: `http://localhost:4200`

### Uruchomienie w trybie produkcyjnym

```bash
npm run build
```

Zbudowana aplikacja znajdzie się w katalogu `dist/`

## 🔐 Implementowane Funkcjonalności

### ✅ Zaimplementowane

1. **Autentykacja**
   - ✅ Komponent logowania
   - ✅ Komponent rejestracji
   - ✅ Auth Service z obsługą JWT
   - ✅ Auth Guard dla ochrony tras
   - ✅ Role Guard dla kontroli dostępu
   - ✅ HTTP Interceptor dla automatycznego dodawania tokenów
   - ✅ Odświeżanie tokenów

2. **Dashboard**
   - ✅ Główny panel z nawigacją
   - ✅ Statystyki (placeholder)
   - ✅ Szybkie akcje
   - ✅ Wylogowanie

3. **Kursy**
   - ✅ Lista kursów z paginacją
   - ✅ Integracja z API backend
   - ✅ Service z pełnym CRUD
   - 🔄 Dodawanie/edycja kursów (do implementacji)
   - 🔄 Szczegóły kursu (do implementacji)

4. **Sesje Kursów**
   - ✅ Routing i podstawowy komponent
   - ✅ Service z pełnym CRUD
   - 🔄 Lista sesji (do implementacji)
   - 🔄 Zarządzanie sesjami (do implementacji)

5. **Zapisy (Enrollments)**
   - ✅ Routing i podstawowy komponent
   - ✅ Service z pełnym CRUD
   - 🔄 Lista zapisów (do implementacji)
   - 🔄 Zarządzanie zapisami (do implementacji)

## 🌐 Integracja z API

### Konfiguracja

Backend API powinien działać na: `http://localhost:3000/api/v1`

Jeśli backend działa na innym porcie, zmień URL w plikach serwisów:
- `src/app/core/services/auth.service.ts`
- `src/app/core/services/courses.service.ts`
- `src/app/core/services/sessions.service.ts`
- `src/app/core/services/enrollments.service.ts`

### Dostępne Endpointy

#### Autentykacja
- `POST /auth/login` - Logowanie
- `POST /auth/register` - Rejestracja
- `POST /auth/logout` - Wylogowanie
- `POST /auth/refresh` - Odświeżanie tokenu

#### Kursy
- `GET /courses` - Lista kursów (z paginacją i filtrowaniem)
- `GET /courses/:id` - Szczegóły kursu
- `POST /courses` - Dodanie kursu
- `PATCH /courses/:id` - Edycja kursu
- `DELETE /courses/:id` - Usunięcie kursu

#### Sesje
- `GET /course-sessions` - Lista sesji
- `GET /course-sessions/:id` - Szczegóły sesji
- `POST /course-sessions` - Dodanie sesji
- `PATCH /course-sessions/:id` - Edycja sesji
- `DELETE /course-sessions/:id` - Usunięcie sesji

#### Zapisy
- `GET /enrollments` - Lista zapisów
- `GET /enrollments/:id` - Szczegóły zapisu
- `POST /enrollments` - Dodanie zapisu
- `PATCH /enrollments/:id` - Edycja zapisu
- `DELETE /enrollments/:id` - Usunięcie zapisu

## 🧪 Testowanie

### Dane testowe

Użyj istniejącego konta testowego:
- Email: `admin@alphacorp.com`
- Hasło: `SecurePass123!`

Lub zarejestruj nową organizację poprzez formularz rejestracji.

### Test integracji

1. Uruchom backend (port 3000)
2. Uruchom frontend (port 4200)
3. Przejdź do http://localhost:4200
4. Zaloguj się
5. Sprawdź listę kursów w menu

## 📝 Dalszy Rozwój

### Priorytetowe funkcjonalności do implementacji

1. **Zarządzanie Kursami**
   - Formularz dodawania kursu
   - Formularz edycji kursu
   - Podgląd szczegółów kursu
   - Publikacja/archiwizacja kursów

2. **Zarządzanie Sesjami**
   - Lista sesji z filtrowaniem
   - Formularz dodawania sesji
   - Kalendarz sesji
   - Zarządzanie uczestnikami

3. **Zarządzanie Zapisami**
   - Lista zapisów z filtrowaniem
   - Zapis uczestnika na sesję
   - Potwierdzanie zapisów
   - Śledzenie płatności
   - Generowanie certyfikatów

4. **Użytkownicy**
   - Lista użytkowników
   - Zarządzanie rolami
   - Profil użytkownika

5. **Raporty i Statystyki**
   - Dashboard ze statystykami
   - Raporty finansowe
   - Raporty uczestnictwa

6. **Ulepszenia UX**
   - Loading states
   - Error handling
   - Toast notifications
   - Konfirmacje akcji
   - Walidacja formularzy

## 🎨 Style i UI

Aplikacja używa **Tailwind CSS** dla stylowania. Główne kolory:

- Primary: Indigo (`bg-indigo-600`, `text-indigo-600`)
- Backgrounds: Gray (`bg-gray-100`, `bg-gray-50`)
- Text: Gray (`text-gray-900`, `text-gray-600`)

### Dodawanie własnych stylów

Edytuj plik `src/styles.scss` dla globalnych stylów.

## 🔒 Bezpieczeństwo

- ✅ JWT tokens w localStorage
- ✅ Automatyczne odświeżanie tokenów
- ✅ Auth Guard dla chronionych tras
- ✅ HTTP Interceptor dodaje tokeny do requestów
- ✅ Logout przy błędzie 401

## 🐛 Debugging

### Angular DevTools

Zainstaluj rozszerzenie Angular DevTools dla Chrome/Firefox aby debugować komponenty i routing.

### Console Logs

Serwisy logują błędy do konsoli przeglądarki. Otwórz DevTools (F12) aby zobaczyć logi.

## 📚 Dodatkowe Zasoby

- [Angular Documentation](https://angular.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [RxJS Documentation](https://rxjs.dev)

## 👥 Autorzy

Implementacja: Claude Code Assistant
Projekt: CKKS SaaS Training Platform
