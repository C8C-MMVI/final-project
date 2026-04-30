# MongoDB Integration — Technologs

## What was added

| Layer | Files changed | MongoDB collection |
|---|---|---|
| PHP | `mongo_config.php` (new), `api/system_logs.php`, `api/notifications.php`, `api/reviews.php` | `system_logs`, `notifications`, `reviews` |
| Django | `repair_timeline/` app (new) | `repair_timeline` |
| Spring Boot | `mongo/` package (new), `pom.xml`, `application.properties` | `repair_events` |

---

## Setup steps

### 1. Add MongoDB to Docker Compose
Copy the service block from `docker-compose-mongo-addition.yml` into your
existing `docker-compose.yml`, and add the `MONGO_*` environment variables
to the php, django, and springboot services as shown in the comments.

### 2. PHP

```bash
# In your php/ directory:
composer require mongodb/mongodb
```

Copy the three updated files into `php/api/` and `php/mongo_config.php`.
No PostgreSQL tables are dropped — system_logs and notifications are now
**only** in MongoDB. Reviews remain in PostgreSQL AND are mirrored to MongoDB.

### 3. Django

```bash
# In your django_backend/ directory:
pip install pymongo>=4.6
```

Copy the `repair_timeline/` folder into `django_backend/`.
Apply the two additions from `settings_additions.py` to:
  - `technologs/settings.py`  → add `'repair_timeline'` to INSTALLED_APPS
  - `technologs/urls.py`      → add `path('api/timeline/', include('repair_timeline.urls'))`

No new PostgreSQL migrations needed — this app only uses MongoDB.

### 4. Spring Boot

Replace `pom.xml` with the updated version (adds `spring-boot-starter-data-mongodb`).
Replace `application.properties` with the updated version (adds MongoDB config).
Copy the `mongo/` package into:
  `src/main/java/com/system/technologs/mongo/`

### 5. Rebuild

```bash
docker compose down
docker compose up --build
```

---

## API reference

### PHP — system_logs
| Method | URL | Auth | Description |
|---|---|---|---|
| GET | `/api/system_logs` | admin | Last 50 log entries |
| POST | `/api/system_logs` | any logged-in | Write a log entry |

POST body: `{ "action": "User updated profile", "log_type": "info" }`

### PHP — notifications
Same endpoints as before — response shape is identical.
`notification_id` is now a MongoDB ObjectId string instead of an integer.

### PHP — reviews
Same endpoints as before — GET now reads from MongoDB (faster).
POST still validates through PostgreSQL then mirrors to MongoDB.

### Django — repair timeline
| Method | URL | Auth | Description |
|---|---|---|---|
| GET | `/api/timeline/<request_id>/` | owner/customer/tech/admin | Full event history |
| POST | `/api/timeline/<request_id>/` | owner/tech/admin | Append status change |

POST body: `{ "status": "in_progress", "note": "Parts arrived" }`

### Spring Boot — repair events
| Method | URL | Description |
|---|---|---|
| GET | `/api/events/timeline/{requestId}` | Full event history |
| POST | `/api/events/timeline` | Append an event |

POST body:
```json
{
  "requestId": 42,
  "status": "completed",
  "changedBy": 7,
  "changedByUsername": "john_tech",
  "note": "All parts replaced, tested OK"
}
```