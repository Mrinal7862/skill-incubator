from enum import Enum


class UserRole(str, Enum):
    STUDENT = "STUDENT"
    ORGANIZER = "ORGANIZER"


class HackathonStatus(str, Enum):
    DRAFT = "DRAFT"
    OPEN = "OPEN"
    LIVE = "LIVE"
    ENDED = "ENDED"
    CANCELLED = "CANCELLED"