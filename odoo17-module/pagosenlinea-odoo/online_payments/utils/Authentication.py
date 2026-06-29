import hashlib
import base64
import random
from datetime import datetime, timedelta

class Authentication:

    def __init__(self, config):
        if "login" not in config or "tranKey" not in config:
            raise Exception("No login or tranKey provided on authentication")

        self.login = config["login"]
        self.tranKey = config["tranKey"]
        self.auth = config.get("auth", {})
        self.additional = config.get("authAdditional", [])
        self.overridden = "auth" in config
        self.algorithm = config.get("algorithm", "sha1")

        self.generate()

    def get_nonce(self, encoded=True):
        if self.auth:
            nonce = self.auth["nonce"].encode("utf-8")  # Convert nonce to bytes
        else:
            try:
                nonce = random.getrandbits(128).to_bytes(
                    16, "big"
                )
            except Exception as e:
                print("Error generating nonce:", e)
                nonce = str(random.randint(1, 1000000)).encode(
                    "utf-8"
                )

        if encoded:
            return base64.b64encode(nonce).decode(
                "utf-8"
            )

        return nonce

    def get_seed(self, add=2):
        seed_time = datetime.now() + timedelta(hours=-5, minutes=add)
        seed = seed_time.strftime("%Y-%m-%dT%H:%M:%S-05:00")
        return seed

    def digest(self, encoded=True):
        nonce = self.get_nonce(encoded=False)
        seed = self.get_seed().encode("utf-8")
        tran_key = self.tranKey.encode("utf-8")
        combined = nonce + seed + tran_key
        digest = hashlib.new(self.algorithm, combined).digest()

        if encoded:
            return base64.b64encode(digest).decode(
                "utf-8"
            )
        return digest

    def generate(self):
        if not self.overridden:
            self.auth = {
                "seed": self.get_seed(),
                "nonce": self.get_nonce(),
            }

    def as_dict(self):
        return {
            "login": self.login,
            "tranKey": self.digest(),
            "nonce": self.get_nonce(),
            "seed": self.get_seed(),
            "expiration": self.get_seed(15),
        }
