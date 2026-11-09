from volty.assistant.off_topic import off_topic_reply


def test_allows_energy_messages() -> None:
    assert off_topic_reply("Coche 12 kWh antes de las 7") is None
    assert off_topic_reply("¿Cómo minimizo el coste en Volty?") is None


def test_redirects_coding_requests() -> None:
    msg = "Escríbeme un script en Python para ordenar una lista"
    out = off_topic_reply(msg)
    assert out is not None
    assert "Volty" in out
    assert "Python" not in out or "cargas" in out


def test_redirects_homework_without_blocking_greetings() -> None:
    assert off_topic_reply("Hola") is None
    assert off_topic_reply("Resuelve este examen de matemáticas") is not None


def test_redirects_cooking_milanesas() -> None:
    out = off_topic_reply("no quiero cocinar milanesas")
    assert out is not None
    assert "Volty" in out or "carga" in out.lower()
