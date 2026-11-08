"""Handler Lambda: API pública (FastAPI + Mangum)."""

from mangum import Mangum

from volty.main import app

_mangum = Mangum(app, lifespan="off")


def lambda_handler(event, context):
    return _mangum(event, context)
