from volty.core.schemas import NaturalLanguageRequest
from volty.interpreter import parse_natural_language


def test_parse_spanish_ev_request():
    parsed = parse_natural_language(
        NaturalLanguageRequest(
            message="Necesito cargar el vehículo antes de las 7 de la mañana y quiero minimizar el coste."
        )
    )
    assert parsed.loads[0].name == "Vehículo eléctrico"
    assert parsed.loads[0].energy_kwh == 30.0
    assert parsed.preferences.objective.value == "minimize_cost"
    assert parsed.loads[0].deadline.hour == 7
    assert "7" in parsed.explanation
