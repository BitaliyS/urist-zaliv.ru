# Деплой SEO-сайта urist-zaliv.ru рядом с ЮрАгентом
# =====================================================
# Изоляция обязательна: отдельный каталог, compose-проект, порт, .env, volume.
# Не трогать /opt/ur-agent, Hermes, порты 5432/8011/3010, серты ur-agent.ru.
# Не поднимать второй nginx на 80/443 — только новый server_name в существующем.
#
# |                 | ЮрАгент              | Этот сайт              |
# |-----------------|----------------------|-------------------------|
# | Каталог         | /opt/ur-agent        | /opt/urist-zaliv        |
# | Compose project | ur-agent-*           | urist-zaliv             |
# | Домен           | ur-agent.ru          | urist-zaliv.ru          |
# | :80/:443        | nginx ЮрАгента       | тот же nginx + server   |
# | App port        | 127.0.0.1:3010 (web) | 127.0.0.1:3020 → :3000  |
# | БД              | Postgres :5432       | SQLite-файл (~МБ)       |
# | API             | 127.0.0.1:8011       | нет (формы → Node)      |

## Что уже в репозитории

- `Dockerfile` — multi-stage Node 22, `adapter-node`
- `docker-compose.yml` — project `urist-zaliv`, bind только `127.0.0.1:3020`
- `deploy/nginx/urist-zaliv.ru.conf.example` — server_name для существующего nginx
- `.env.example` / `deploy/env.production.example`
- `static/yandex_2d62bd3c37d20b9b.html` — верификация Яндекс.Вебмастера
- meta `google-site-verification` в `src/app.html`

## Заявки с формы — три канала

1. **SQLite** на сервере (`./data/leads.sqlite`) — основной архив.
2. **Почта** → vitaliisavinskii@yandex.ru (SMTP).
3. **ntfy** — push на телефон (топик в `.env`).

Успех пользователю — если заявка **сохранена в БД**. Письмо и ntfy — дубли.

### SMTP (Яндекс)

В `.env` уже: `SMTP_USER` / `SMTP_PASS` / `LEAD_NOTIFY_TO`.

Если SMTP отвечает ошибкой авторизации — в [id.yandex.ru](https://id.yandex.ru/) → **Пароли приложений** → «Почта» и подставьте новый пароль в `SMTP_PASS` (обычный пароль почты Яндекс часто не принимает для SMTP).

### ntfy

Топик: `urist-zaliv-vitalii-376d5f2b713a` (уже в `.env`). Подписка в приложении ntfy.

### Метрика

`PUBLIC_YANDEX_METRIKA_ID=110920086`, вебвизор включён. Скрипт грузится только после согласия на cookies.

## Верификация поисковиков

### Google Search Console — HTML-тег (выбранный способ)

Уже в `src/app.html` внутри `<head>`:

```html
<meta name="google-site-verification" content="A7LkQ2QBivAGep_W446VcJWTGK9fZHi0j7CY1Vv3Ols" />
```

После деплоя главной: в Search Console нажать **Подтвердить**. TXT в DNS не нужен. Тег не удалять.

### Яндекс.Вебмастер (файл)

После деплоя открыть:

`https://urist-zaliv.ru/yandex_2d62bd3c37d20b9b.html`

и нажать «Подтвердить» в Вебмастере.

## 0. Baseline на VPS (перед любыми правками)

```bash
ss -tlnp | grep -E ':(22|80|443|5432|8011|3010|3020|3000)\s'
cd /opt/ur-agent && docker compose ps
df -h / && free -h
crontab -l
```

Записать вывод. Убедиться, что **3020 свободен**, а 3010/8011/5432/80/443 — у ЮрАгента.

## Локальная проверка перед заливкой

```bash
cd marketing-landing
npm ci
npm run check
npm run build
```

Docker локально:

```bash
docker compose build
docker compose up -d
curl -I http://127.0.0.1:3020/
```

## План на VPS

1. DNS A/AAAA: `urist-zaliv.ru` (+ www) → IP сервера.
2. `sudo mkdir -p /opt/urist-zaliv` — **не** внутрь `/opt/ur-agent`.
3. Скопировать код в `/opt/urist-zaliv` (rsync/git).
4. `.env` на сервер (`chmod 600`), `LEAD_DB_PATH` переопределит compose на `/app/data/leads.sqlite`.
5. Из `/opt/urist-zaliv`: `docker compose -p urist-zaliv up -d --build`
6. `curl -I http://127.0.0.1:3020/` с хоста; снаружи :3020 не открывать.
7. Добавить conf из `deploy/nginx/urist-zaliv.ru.conf.example` в conf.d **nginx ЮрАгента** (не перезаписывать блок ur-agent.ru).
8. `proxy_pass` на `:3020` / `urist-zaliv-web:3000` (см. комментарии в conf).
9. TLS отдельным сертификатом для `urist-zaliv.ru`.
10. `nginx -t` и reload **только** nginx ЮрАгента; сразу smoke `ur-agent.ru` и `urist-zaliv.ru`.

Запрещено: `docker compose down` в `/opt/ur-agent`; второй Hermes; чужой TELEGRAM_BOT_TOKEN; правка `.env` / compose ЮрАгента «заодно».

## Откат

```bash
cd /opt/urist-zaliv && docker compose down
# убрать conf urist-zaliv из nginx и reload
```

ЮрАгент не затрагивается при корректном откате conf.

## Ресурсы

Образ + слой < 1 ГБ, RAM контейнера ~100–250 МБ. Postgres ЮрАгента не используем.
