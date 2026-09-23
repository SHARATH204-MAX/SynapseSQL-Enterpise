from slowapi import Limiter
from slowapi.util import get_remote_address

# Global Limiter instance using client remote IP address
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["120/minute"],
    headers_enabled=False
)

# Specific endpoint rate limit policies
CHAT_STREAM_LIMIT = "25/minute"
DATABASE_API_LIMIT = "60/minute"
AUTH_API_LIMIT = "30/minute"
HEALTH_API_LIMIT = "120/minute"
