def build_qr_payload(unique_id: str) -> dict[str, str]:
    return {"type": "user-invite", "id": unique_id}
