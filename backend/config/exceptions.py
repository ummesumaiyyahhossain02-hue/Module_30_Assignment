from rest_framework.views import exception_handler as drf_exception_handler


def _extract_message(data):
    """Pull a single human-readable headline message out of a DRF error payload."""
    if isinstance(data, dict):
        if "detail" in data and len(data) == 1:
            return str(data["detail"])
        for value in data.values():
            return _extract_message(value)
        return "Validation failed."
    if isinstance(data, list):
        return _extract_message(data[0]) if data else "Validation failed."
    return str(data)


def custom_exception_handler(exc, context):
    """Reshape every DRF-handled error into a consistent envelope:
    {"error": {"status": <code>, "message": <str>, "details": <obj>}}
    """
    response = drf_exception_handler(exc, context)
    if response is None:
        return None

    is_plain_detail = isinstance(response.data, dict) and set(response.data) == {"detail"}
    message = _extract_message(response.data)
    details = None if is_plain_detail else response.data

    response.data = {
        "error": {
            "status": response.status_code,
            "message": message,
            "details": details,
        }
    }
    return response
