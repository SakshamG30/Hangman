from django.db.models import Model, CharField, IntegerField, DateTimeField


class Game(Model):
    STATUS_CHOICES = [
        ("Won", "Won"),
        ("Lost", "Lost"),
        ("InProgress", "InProgress")
    ]
    word_to_guess = CharField(max_length=50)
    guessed_letters = CharField(max_length=26, default='')
    incorrect_guesses = IntegerField(default=0)
    max_incorrect_guesses = IntegerField()
    status = CharField(max_length=20, choices=STATUS_CHOICES, default="InProgress")
    created_at = DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Game {self.id} - {self.status}"
