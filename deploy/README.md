# Деплой urist-zaliv.ru (канон)

**Этот файл — единственная инструкция.** Не импровизировать заново: ссылаться сюда.

| | ЮрАгент | Этот сайт |
|---|---|---|
| Каталог | `/opt/ur-agent` | `/opt/urist-zaliv` |
| Compose project | `ur-agent` | `urist-zaliv` |
| Контейнер app | `ur-agent-web-1` | `urist-zaliv-web` |
| Домен | `ur-agent.ru` | `urist-zaliv.ru` |
| :80/:443 | nginx ЮрАгента | **тот же** nginx + `server_name` |
| App port на хосте | `127.0.0.1:3010` | `127.0.0.1:3020` → контейнер `:3000` |
| Сеть с nginx | `ur-agent_internal` | тот же (через compose `external`) |
| БД | Postgres `:5432` | SQLite `./data/leads.sqlite` |
| GitHub | — | https://github.com/BitaliyS/urist-zaliv.ru |
| SSL | `/opt/ur-agent/deploy/certs/ur-agent.ru/` | `/opt/ur-agent/deploy/certs/urist-zaliv.ru/` (копия LE) |

**Запрещено:** `docker compose down` в `/opt/ur-agent`; второй nginx на 80/443; трогать `.env` / Hermes / порты 5432/8011/3010 ЮрАгента; `upstream hostname` без resolver (см. ниже).

---

## Обычный релиз (код уже в проде)

С локальной машины (после push в GitHub):

```bash
# локально: marketing-landing/
npm ci && npm run check && npm run build
git push origin main
```

На VPS:

```bash
cd /opt/urist-zaliv
git pull
docker compose -p urist-zaliv up -d --build

# сеть к nginx ЮрАгента (если compose ещё не подхватил external — страховка)
docker network connect ur-agent_internal urist-zaliv-web 2>/dev/null || true

curl -sI http://127.0.0.1:3020/ | head -5
curl -sI https://urist-zaliv.ru/ | head -8
curl -sI https://ur-agent.ru/ | head -5
```

`.env` на сервере **не** в git — не перезаписывать при pull.

---

## Архитектура прокси (как работает сейчас)

1. Браузер → `urist-zaliv.ru:443` → контейнер **`ur-agent-nginx-1`**.
2. Conf хоста: `/opt/ur-agent/deploy/nginx.conf` → в контейнере `/etc/nginx/conf.d/default.conf` (bind-mount).
3. Proxy на `http://urist-zaliv-web:3000` через Docker DNS `127.0.0.11`.
4. **Нельзя** писать статический `upstream { server urist-zaliv-web:3000; }` — при старте nginx имя может не резолвиться → **restart loop** всего ЮрАгента.
5. Правильно — `resolver` + переменная:

```nginx
# --- urist-zaliv.ru ---
server {
    listen 80;
    server_name urist-zaliv.ru www.urist-zaliv.ru;
    return 301 https://urist-zaliv.ru$request_uri;
}

server {
    listen 443 ssl;
    http2 on;
    server_name urist-zaliv.ru www.urist-zaliv.ru;

    ssl_certificate     /etc/nginx/certs/urist-zaliv.ru/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/urist-zaliv.ru/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location / {
        resolver 127.0.0.11 ipv6=off valid=10s;
        set $zaliv_upstream http://urist-zaliv-web:3000;
        proxy_pass $zaliv_upstream;
        include /etc/nginx/proxy_common.conf;
    }
}
```

Эталон также в `deploy/nginx/urist-zaliv.ru.conf.example`.

### Правка nginx ЮрАгента — чеклист

1. Бэкап: `cp -a /opt/ur-agent/deploy/nginx.conf /opt/ur-agent/deploy/nginx.conf.bak.$(date +%Y%m%d%H%M)`
2. Править **только** блоки `urist-zaliv.ru` (не `ur-agent.ru`).
3. **Не** дублировать `proxy_read_timeout` / `proxy_send_timeout` после `include proxy_common.conf` — nginx падает с duplicate.
4. После правки файла на хосте mount часто **не** обновляется в уже running контейнере → нужен recreate **только nginx**:

```bash
docker network connect ur-agent_internal urist-zaliv-web 2>/dev/null || true
cd /opt/ur-agent
docker compose up -d --force-recreate nginx
sleep 2
docker ps --filter name=ur-agent-nginx
curl -sI https://urist-zaliv.ru/ | head -8
curl -sI https://ur-agent.ru/ | head -5
```

`nginx -s reload` недостаточен, если conf в контейнере устарел (сравнить `wc -c` / `grep urist-zaliv` на хосте и в `docker exec`).

---

## Первичный деплой (если с нуля)

1. DNS A: `urist-zaliv.ru` / `www` → IP VPS.
2. `mkdir -p /opt/urist-zaliv && cd /opt/urist-zaliv && git clone https://github.com/BitaliyS/urist-zaliv.ru.git .`
3. Скопировать `.env` с секретами (`chmod 600`); образец — `deploy/env.production.example`.
4. `docker compose -p urist-zaliv up -d --build`
5. `docker network connect ur-agent_internal urist-zaliv-web`
6. Дописать блоки zaliv в `/opt/ur-agent/deploy/nginx.conf` (см. выше) → force-recreate nginx.
7. SSL: certbot standalone (краткий даунтайм 80/443) → скопировать в `/opt/ur-agent/deploy/certs/urist-zaliv.ru/` → HTTPS-блок → recreate nginx.
8. Smoke: `/`, `/stati`, форма, Метрика после cookie «Принять», `ur-agent.ru` жив.

Renewal LE: серты живут в `/etc/letsencrypt/live/urist-zaliv.ru/`; после renew копировать в `deploy/certs/urist-zaliv.ru/` и recreate nginx (как при выпуске).

---

## Заявки с формы

1. **SQLite** `/opt/urist-zaliv/data/leads.sqlite` — успех для пользователя.
2. SMTP → почта из `.env`.
3. ntfy — push.

Проверка: `sqlite3 /opt/urist-zaliv/data/leads.sqlite 'SELECT id,phone,created_at FROM leads ORDER BY id DESC LIMIT 5;'`

## Метрика / cookies

`PUBLIC_YANDEX_METRIKA_ID` передаётся как **Docker build ARG** (см. `Dockerfile` / compose) — иначе в клиентский бандл не попадёт (`.env` в `.dockerignore`). Скрипт грузится только после кнопки **«Принять»** в cookie-баннере.

## Верификация

- Google: meta в `src/app.html` → подтвердить в GSC.
- Яндекс: `https://urist-zaliv.ru/yandex_2d62bd3c37d20b9b.html`

## Откат сайта (ЮрАгент не трогать)

```bash
cd /opt/urist-zaliv && docker compose -p urist-zaliv down
# убрать блоки urist-zaliv из nginx.conf → force-recreate nginx
```
