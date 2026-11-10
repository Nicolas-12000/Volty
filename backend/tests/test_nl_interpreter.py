from volty.core.schemas import NaturalLanguageRequest
from volty.interpreter import parse_natural_language

PITCH = """
Tengo que planificar mañana en casa (zona Alemania, hora de Berlín):
1) Coche eléctrico: necesito 12 kWh antes de las 07:00, el cargador no puede pasar de 3,6 kW.
2) Lavadora: 1,2 kWh, máximo 2,2 kW, antes de las 08:00.
3) Secadora: 2,5 kWh, máximo 2,0 kW, antes de las 10:00.
4) Lavavajillas: 1 kWh, máximo 1,8 kW, antes de las 22:00 de hoy; una vez arranque no puede pausarse (must run).
Objetivo: minimizar el coste total. Si dos horarios cuestan parecido, prefiero equilibrio coste-renovables, unos 40% de peso a lo verde.
"""


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


def test_pitch_message_keeps_every_appliance():
    parsed = parse_natural_language(NaturalLanguageRequest(message=PITCH))
    assert [(load.name, load.energy_kwh, load.max_power_kw, load.deadline.hour) for load in parsed.loads] == [
        ("Vehículo eléctrico", 12.0, 3.6, 7),
        ("Lavadora", 1.2, 2.2, 8),
        ("Secadora", 2.5, 2.0, 10),
        ("Lavavajillas", 1.0, 1.8, 22),
    ]
    assert [load.must_run for load in parsed.loads] == [False, False, False, True]
    assert parsed.preferences.objective.value == "balance_cost_renewables"
    assert parsed.preferences.renewable_weight == 0.4


def test_generic_electric_appliance_without_catalog():
    parsed = parse_natural_language(
        NaturalLanguageRequest(message="pelapapas electrico 0.3 kwh antes de las 22")
    )
    assert len(parsed.loads) == 1
    assert "pelapapas" in parsed.loads[0].name.lower()
    assert parsed.loads[0].energy_kwh == 0.3
    assert parsed.loads[0].name != "Vehículo eléctrico"


def test_movil_and_lavadora_in_one_message():
    parsed = parse_natural_language(
        NaturalLanguageRequest(
            message="lavadora en la noche y cargar el celular antes de dormir listo a las 6",
        )
    )
    names = {load.name for load in parsed.loads}
    assert "Lavadora" in names
    assert "Cargador móvil" in names


def test_second_appliance_does_not_inherit_ev_kwh():
    parsed = parse_natural_language(
        NaturalLanguageRequest(
            message=(
                "necesito cargar el coche 59 kwh antes de las 7 de la manana "
                "lavadora esta noche lo mas barato posible"
            )
        )
    )
    assert len(parsed.loads) == 2
    by_name = {load.name: load for load in parsed.loads}
    assert by_name["Vehículo eléctrico"].energy_kwh == 59
    assert by_name["Lavadora"].energy_kwh == 1.2
    assert by_name["Lavadora"].deadline.hour == 23 or by_name["Lavadora"].deadline.hour == 22


def test_power_is_not_read_from_kwh():
    parsed = parse_natural_language(
        NaturalLanguageRequest(message="Coche 12 kWh antes de las 7, máximo 3,6 kW")
    )
    assert parsed.loads[0].energy_kwh == 12.0
    assert parsed.loads[0].max_power_kw == 3.6
