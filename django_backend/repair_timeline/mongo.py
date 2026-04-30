"""
repair_timeline/mongo.py

MongoDB connection helper for Django.
Uses pymongo directly (no ODM) for simplicity.

Add to your .env / docker-compose.yml:
  MONGO_HOST     (default: mongo)
  MONGO_PORT     (default: 27017)
  MONGO_DB       (default: technologs_mongo)
  MONGO_USER     (optional)
  MONGO_PASSWORD (optional)
"""

import os
from functools import lru_cache
from pymongo import MongoClient, DESCENDING
from pymongo.collection import Collection


@lru_cache(maxsize=1)
def _get_client() -> MongoClient:
    host     = os.getenv('MONGO_HOST', 'mongo')
    port     = int(os.getenv('MONGO_PORT', 27017))
    user     = os.getenv('MONGO_USER', '')
    password = os.getenv('MONGO_PASSWORD', '')

    if user and password:
        uri = f"mongodb://{user}:{password}@{host}:{port}/"
    else:
        uri = f"mongodb://{host}:{port}/"

    return MongoClient(uri, serverSelectionTimeoutMS=5000)


def get_db():
    db_name = os.getenv('MONGO_DB', 'technologs_mongo')
    return _get_client()[db_name]


def get_timeline_collection() -> Collection:
    col = get_db()['repair_timeline']
    # Ensure useful indexes exist (idempotent)
    col.create_index([('request_id', DESCENDING)])
    col.create_index([('created_at', DESCENDING)])
    return col