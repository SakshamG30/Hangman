import React, { useState, useEffect } from 'react';
import './Display.css';

interface GameState {
  id: number;
  status: 'InProgress' | 'Won' | 'Lost';
  current_word_state: string;
  incorrect_guesses_made: number;
  remaining_incorrect_guesses: number;
  word_length: number;
  guessed_letters: string;
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
  const [poppedBalloons, setPoppedBalloons] = useState<number[]>([]);
  const [manFalling, setManFalling] = useState(false);

  // Reset balloons when new game starts
  useEffect(() => {
    setPoppedBalloons([]);
    setManFalling(false);
  }, [gameState?.id]);

  // Handle balloon popping when incorrect guesses increase
  useEffect(() => {
    if (gameState) {
      const incorrectGuesses = gameState.incorrect_guesses_made;
      const maxGuesses = gameState.incorrect_guesses_made + gameState.remaining_incorrect_guesses;
      
      // Pop balloons based on incorrect guesses
      const newPopped: number[] = [];
      for (let i = 0; i < incorrectGuesses; i++) {
        newPopped.push(i);
      }
      setPoppedBalloons(newPopped);

      // Trigger fall animation when all balloons are popped
      if (incorrectGuesses >= maxGuesses && !manFalling) {
        setManFalling(true);
      }
    }
  }, [gameState?.incorrect_guesses_made, gameState?.remaining_incorrect_guesses, manFalling]);

  const renderBalloons = () => {
    if (!gameState) return null;

    const maxGuesses = gameState.incorrect_guesses_made + gameState.remaining_incorrect_guesses;
    const balloons = [];

    const balloonColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'];

    for (let i = 0; i < maxGuesses; i++) {
      const isPopped = poppedBalloons.includes(i);
      balloons.push(
        <div
          key={i}
          className={`balloon ${isPopped ? 'popped' : ''}`}
          style={{
            '--balloon-color': balloonColors[i % balloonColors.length],
            '--balloon-delay': `${i * 0.2}s`
          } as React.CSSProperties}
        >
          {!isPopped && (
            <>
              <div className="balloon-shine"></div>
              <div className="balloon-string"></div>
            </>
          )}
        </div>
      );
    }

    return <div className="balloons-container">{balloons}</div>;
  };

  const renderHangman = () => {
    const incorrectGuesses = gameState?.incorrect_guesses_made || 0;

    return (
      <div className={`hangman-container ${manFalling ? 'falling' : ''}`}>
        <div className="balloons-anchor"></div>
        <div className="man">
          <div className={`head ${incorrectGuesses >= 1 ? 'show' : ''}`}></div>
          <div className={`body ${incorrectGuesses >= 2 ? 'show' : ''}`}></div>
          <div className={`left-arm ${incorrectGuesses >= 3 ? 'show' : ''}`}></div>
          <div className={`right-arm ${incorrectGuesses >= 4 ? 'show' : ''}`}></div>
          <div className={`left-leg ${incorrectGuesses >= 5 ? 'show' : ''}`}></div>
          <div className={`right-leg ${incorrectGuesses >= 6 ? 'show' : ''}`}></div>
        </div>
      </div>
    );
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🎈 Balloon Hangman 🎈</h1>
        <div className="header-subtitle">Don't pop all the balloons!</div>
      </header>

      <div className="game-container">
        {/* Balloons Section */}
        <div className="balloons-section">
          {renderBalloons()}
          {renderHangman()}
        </div>

        {/* Game Info */}
        <div className="game-info">
          <div className="status-card">
            <h3>Game Status</h3>
            <div className="status-item">
              <span className="label">Status:</span>
              <span className={`value status-${gameState?.status?.toLowerCase()}`}>
                {gameState?.status || 'Loading...'}
              </span>
            </div>
            <div className="status-item">
              <span className="label">Wrong Guesses:</span>
              <span className="value">
                {gameState?.incorrect_guesses_made} / {gameState ? gameState.incorrect_guesses_made + gameState.remaining_incorrect_guesses : 0}
              </span>
            </div>
            <div className="status-item">
              <span className="label">Balloons Left:</span>
              <span className="value balloons-left">
                {gameState?.remaining_incorrect_guesses || 0}
              </span>
            </div>
          </div>

          {/* Used Letters */}
          <div className="used-letters">
            <h3>Used Letters</h3>
            <div className="letters-grid">
              {Array.from(usedLetters).map(letter => (
                <span key={letter} className="used-letter">
                  {letter}
                </span>
              ))}
              {usedLetters.size === 0 && <span className="no-letters">No letters guessed yet</span>}
            </div>
          </div>
        </div>

        {/* Word Display */}
        <div className="word-display-section">
          <div className="word-display">
            {gameState?.current_word_state.split('').map((char, index) => (
              <span key={index} className="letter">
                {char === '_' ? '_' : char}
              </span>
            ))}
          </div>
          <div className="word-length">Word length: {gameState?.word_length} letters</div>
        </div>

        {/* Message */}
        <div className={`message ${message.includes('Congratulations') ? 'success' : message.includes('Game over') ? 'error' : ''}`}>
          {message || 'Guess a letter to start!'}
        </div>

        {/* Guess Input */}
        {gameState?.status === 'InProgress' && (
          <form onSubmit={onGuessSubmit} className="guess-form">
            <div className="input-group">
              <input
                type="text"
                value={guess}
                onChange={(e) => onGuessChange(e.target.value.toUpperCase())}
                placeholder="Enter a letter"
                disabled={loading}
                className="guess-input"
              />
              <button 
                type="submit" 
                disabled={loading || !guess || usedLetters.has(guess.toUpperCase())}
                className="guess-button"
              >
                {loading ? '⏳' : '🎯 Guess'}
              </button>
            </div>
          </form>
        )}

        {/* Game Over Screen */}
        {gameState?.status !== 'InProgress' && gameState && (
          <div className="game-over">
            <h2>{gameState.status === 'Won' ? '🎉 You Won! 🎉' : '💀 Game Over 💀'}</h2>
            {gameState.status === 'Lost' && (
              <p>The word was: <strong>{gameState.current_word_state.replace(/_/g, '')}</strong></p>
            )}
            <button onClick={onNewGame} disabled={loading} className="play-again-btn">
              {loading ? 'Loading...' : '🔄 Play Again'}
            </button>
          </div>
        )}

        {/* New Game Button */}
        {(!gameState || gameState?.status === 'InProgress') && (
          <button onClick={onNewGame} disabled={loading} className="new-game-btn">
            {loading ? 'Loading...' : '🆕 New Game'}
          </button>
        )}
      </div>
    </div>
  );
};

export default Display;