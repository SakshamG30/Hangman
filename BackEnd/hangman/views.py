from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import GameSerializer
import math
import random

from django.shortcuts import render

from .models import Game

WORDS = ["Hangman", "Python", "Audacix", "Bottle", "Pen"]


# Create your views here.
@api_view(['POST'])
def new_game(request):
    try:
        word = random.choice(WORDS)

        max_incorrect_guesses = max(1, math.ceil(len(word) / 2))

        game = Game.objects.create(
            word_to_guess=word.upper(),
            max_incorrect_guesses=max_incorrect_guesses
        )

        return Response({'id': game.id}, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response(
            {'error': 'Could not create game.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def game_state(request, game_id):
    try:
        game = Game.objects.get(id=game_id)
        serializer = GameSerializer(game)
        return Response(serializer.data)

    except Game.DoesNotExist:
        return Response(
            {'error': 'Game not Found.'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
def make_guess(request, game_id):
    try:
        game = Game.objects.get(id=game_id)

        if game.status != 'InProgress':
            serializer = GameSerializer(game)
            return Response({
                'error': f'Game already {game.status}',
                'game_state': serializer.data
            }, status=status.HTTP_400_BAD_REQUEST)

        guess = request.data.get('guess', '').strip().upper()

        if not guess:
            return Response({'error': 'No guess provided.'}, status=status.HTTP_400_BAD_REQUEST)

        if len(guess) != 1 or not guess.isalpha():
            return Response(
                {'error': 'Invalid guess. Please provide a single letter.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if guess in game.guessed_letters:
            serializer = GameSerializer(game)
            return Response({
                'error': 'Letter already guessed!',
                'game_state': serializer.data
            }, status=status.HTTP_400_BAD_REQUEST
            )

        game.guessed_letters += guess

        correct = guess in game.word_to_guess

        if correct:
            message = "Correct Guess!"
        else:
            game.incorrect_guesses += 1
            message = "Incorrect Guess"

        all_guessed = all(letter in game.guessed_letters for letter in game.word_to_guess)

        if all_guessed:
            game.status = "Won"
            message = "Congratulations! You've Won!"

        elif game.incorrect_guesses >= game.max_incorrect_guesses:
            game.status = "Lost"
            message = f"Game Over! The correct word was {game.word_to_guess}."

        game.save()

        serializer = GameSerializer(game)

        return Response({
            'correct': correct,
            'message': message,
            'game_state': serializer.data
        })

    except Game.DoesNotExist:

        return Response(
            {'error': 'Game not Found.'},
            status=status.HTTP_404_NOT_FOUND
        )
