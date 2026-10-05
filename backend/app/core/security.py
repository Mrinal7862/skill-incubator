from datetime import datetime, timedelta, timezone

from jose import jwt 
from pwdlib import PasswordHash
from app.core.config import settings

#Hashing
password_hash = PasswordHash.recommended()

def hash_password(password: str) -> str: 
    return password_hash.hash(password)

def verify_password(password: str, hashed_password:str) -> bool: 
    return password_hash.verify(
        password,
        hashed_password
    )

def create_access_token(subject:str) -> str:
    current_time = datetime.now(timezone.utc)
    expire_time = current_time + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub" : subject,
        "exp" : expire_time,
    }

    token = jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )

    return token

def decode_access_token(token:str) ->dict:
    payload = jwt.decode(
        token,
        settings.SECRET_KEY,
        algorithms=[settings.ALGORITHM]
    )

    return payload
