"""Handler Lambda: ingesta Energy-Charts → PostgreSQL."""

from __future__ import annotations

import json
import logging

from volty.ingestion.job import run_ingestion_sync

logger = logging.getLogger(__name__)


def lambda_handler(event, context):
    try:
        result = run_ingestion_sync()
        return {"statusCode": 200, "body": json.dumps(result)}
    except Exception as exc:
        logger.exception("ingestion failed")
        return {"statusCode": 500, "body": json.dumps({"error": str(exc)})}
