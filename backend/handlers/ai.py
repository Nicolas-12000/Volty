"""Handler Lambda: interpretación NL (MATIAS) → JSON validado."""

from __future__ import annotations

import json

from volty.application.planning import interpret_message
from volty.core.schemas import NaturalLanguageRequest


def lambda_handler(event, context):
    try:
        body = event if isinstance(event, dict) and "message" in event else json.loads(event.get("body") or "{}")
        req = NaturalLanguageRequest.model_validate(body)
        intent = interpret_message(req)
        return {"statusCode": 200, "body": intent.model_dump_json()}
    except Exception as exc:
        return {"statusCode": 400, "body": json.dumps({"detail": str(exc)})}
