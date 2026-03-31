import random
import string
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

FIRST_NAMES = [
    "Alex", "Jordan", "Taylor", "Morgan", "Casey",
    "Riley", "Drew", "Avery", "Quinn", "Blake",
    "Skyler", "Reese", "Dakota", "Peyton", "Cameron",
    "Logan", "Hayden", "Parker", "Emerson", "Finley",
]

LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Brown", "Jones",
    "Garcia", "Miller", "Davis", "Wilson", "Moore",
    "Taylor", "Anderson", "Thomas", "Jackson", "White",
    "Harris", "Martin", "Thompson", "Robinson", "Clark",
]


def random_string(length=8):
    return "".join(random.choices(string.ascii_lowercase + string.digits, k=length))


STATIC_USERS = [
    {"username": f"dbtest{i}", "email": f"dbtest{i}@email.com"}
    for i in range(1, 16)
]


class Command(BaseCommand):
    help = "Seed the database with 15 static (dbtest1–15) and 15 random users"

    def add_arguments(self, parser):
        parser.add_argument(
            "--count",
            type=int,
            default=15,
            help="Number of random users to create (default: 15)",
        )
        parser.add_argument(
            "--password",
            type=str,
            default="Test1234!",
            help="Password for all generated users (default: Test1234!)",
        )

    def handle(self, *args, **options):
        count = options["count"]
        password = options["password"]
        created = 0

        # --- Static users: dbtest1 to dbtest15 ---
        self.stdout.write(self.style.MIGRATE_HEADING("Seeding static users (dbtest1–dbtest15)..."))

        for entry in STATIC_USERS:
            username = entry["username"]
            email = entry["email"]

            if User.objects.filter(username=username).exists():
                self.stdout.write(f"  Skipped (exists): {username}")
                continue

            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
            )
            created += 1
            self.stdout.write(f"  Created: {user.username} ({user.email})")

        # --- Random users ---
        self.stdout.write(self.style.MIGRATE_HEADING(f"\nSeeding {count} random users..."))

        for _ in range(count):
            first = random.choice(FIRST_NAMES)
            last = random.choice(LAST_NAMES)
            suffix = random_string(4)
            username = f"{first.lower()}_{last.lower()}_{suffix}"
            email = f"{username}@example.com"

            if User.objects.filter(username=username).exists():
                self.stdout.write(f"  Skipped (exists): {username}")
                continue

            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first,
                last_name=last,
            )
            created += 1
            self.stdout.write(f"  Created: {user.username} ({user.email})")

        self.stdout.write(
            self.style.SUCCESS(f"\n✓ Done — {created} user(s) created successfully.")
        )
