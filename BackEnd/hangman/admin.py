from django.contrib import admin
from .models import Game
# Register your models here.

@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    list_display = ['id', 'word_to_guess', 'status', 'incorrect_guesses', 'created_at']
    list_filter = ['status', 'created_at']
