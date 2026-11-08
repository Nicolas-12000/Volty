"""Handler Lambda: optimización LP (invocación directa desde API en producción)."""

from __future__ import annotations

import asyncio
import json

from volty.application.planning import run_optimization
from volty.core.schemas import OptimizeRequest


def lambda_handler(event, context):
    try:
        body = event if isinstance(event, dict) and "loads" in event else json.loads(event.get("body") or "{}")
        req = OptimizeRequest.model_validate(body)
        result = asyncio.run(run_optimization(req))
        return {"statusCode": 200, "body": result.model_dump_json()}
    except Exception as exc:
        return {"statusCode": 400, "body": json.dumps({"detail": str(exc)})}
