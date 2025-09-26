from rest_framework import serializers
from .models import Game

class GameSerializer(serializers.ModelSerializer):
    current_word_state = serializers.SerializerMethodField()
    remaining_incorrect_guesses = serializers.SerializerMethodField()
    word_length = serializers.SerializerMethodField()
    incorrect_guesses_made = serializers.SerializerMethodField()

    class Meta:
        model = Game
        fields = [
            'id',
            'status',
            'current_word_state',
            'incorrect_guesses_made',
            'remaining_incorrect_guesses',
            'word_length',
            'guessed_letters'
        ]

    def get_current_word_state(self, obj):
        if not obj.guessed_letters:
            return '_' * len(obj.word_to_guess)

        display = []

        for letter in obj.word_to_guess:
            if letter in obj.guessed_letters:
                display.append(letter)
            else:
                display.append("_")

        return ''.join(display)

    def get_remaining_incorrect_guesses(self, obj):
        return max(0, obj.max_incorrect_guesses - obj.incorrect_guesses)

    def get_word_length(self, obj):
        return len(obj.word_to_guess)

    def get_incorrect_guesses_made(self, obj):
        return obj.incorrect_guesses
