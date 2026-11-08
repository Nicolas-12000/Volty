from volty.core.schemas import MatiasAction, ParsedIntent


def default_actions(intent: ParsedIntent | None) -> list[MatiasAction]:
    if intent is None:
        return []
    return [
        MatiasAction(type="apply_loads", label="Guardar en cargas"),
        MatiasAction(type="open_loads", label="Abrir cargas"),
        MatiasAction(type="run_plan", label="Ir al plan"),
    ]
