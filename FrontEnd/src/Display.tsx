import React from 'react';

interface GameState {
  id: number;
  status: 'InProgress' | 'Won' | 'Lost';
  current_word_state: string;
  incorrect_guesses_made: number;
  remaining_incorrect_guesses: number;
  word_length: number;
  guessed_letters?: string;
}

interface DisplayProps {
  gameState: GameState | null;
  guess: string;
  message: string;
  loading: boolean;
  usedLetters: Set<string>;
  onGuessChange: (guess: string) => void;
  onGuessSubmit: (e: React.FormEvent) => void;
  onNewGame: () => void;
}

const Display: React.FC<DisplayProps> = ({
  gameState,
  guess,
  message,
  loading,
  usedLetters,
  onGuessChange,
  onGuessSubmit,
  onNewGame
}) => {
  return (
    <div className="app">
      <h1>Hangman Game</h1>
      
      {/* Game Status */}
      <div className="game-status">
        <p><strong>Status:</strong> {gameState?.status || 'Loading...'}</p>
        <p><strong>Wrong Guesses:</strong> {gameState?.incorrect_guesses_made} / {gameState ? gameState.incorrect_guesses_made + gameState.remaining_incorrect_guesses : 0}</p>
        <p><strong>Used Letters:</strong> {Array.from(usedLetters).join(', ') || 'None'}</p>
      </div>

      {/* Word Display */}
      <div className="word-display">
        {gameState?.current_word_state.split('').map((char, index) => (
          <span key={index} className="letter">
            {char}
          </span>
        ))}
      </div>

      {/* Message */}
      <div className="message">{message}</div>

      {/* Guess Input */}
      {gameState?.status === 'InProgress' && (
        <form onSubmit={onGuessSubmit} className="guess-form">
          <input
            type="text"
            value={guess}
            onChange={(e) => onGuessChange(e.target.value)}
            placeholder="Enter a letter"
            disabled={loading}
            className="guess-input"
          />
          <button type="submit" disabled={loading || !guess || usedLetters.has(guess.toUpperCase())}>
            {loading ? '...' : 'Guess'}
          </button>
        </form>
      )}

      {/* New Game Button */}
      <button onClick={onNewGame} disabled={loading} className="new-game-btn">
        {loading ? 'Loading...' : 'New Game'}
      </button>
    </div>
  );
};

export default Display;