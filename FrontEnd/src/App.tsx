import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate } from 'react-router-dom'
import './App.css'

// Interfaces

interface GameState {
   id : number;
   status: 'InProgress' | 'Won' | 'Lost';
   current_word_state: string;
   incorrect_guesses_made: number;
   remaining_incorrect_guesses: number;
   word_length: number;
}

interface GuessResponse {
   correct: boolean;
   message: string;
   game_state: GameState;
}

const API_BASE = 'http://127.0.0.1:8000/api'

function Game() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [gameId, setGameId] = useState<number | null>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [guess, setGuess] = useState<string>('')
  const [message, setMessage] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [usedLetters, setUsedLetters] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (id) {
      fetchGameState(parseInt(id))
    }
    else{
      startNewGame()
    }
  }, [id] )

  const startNewGame = async () => {

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/game/new`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        const newGameId = data.id

        navigate(`/${newGameId}`,  { replace: true})
        setGameId(newGameId)
        await fetchGameState(newGameId)
        setUsedLetters(new Set())
        setMessage('New game started! Good luck!')
      }
      else{
        setMessage('Failed to start a new game. Please try again.')
      }

    }
    catch (error) {
      setMessage('An error occurred while starting a new game. Make sure the backend server is connected.' + error)
    }
    finally {
      setLoading(false)
    }
  }

  const fetchGameState = async (gid: number) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/game/${gid}`)
      if (response.ok) {
        const data = await response.json()
        setGameState(data)
        setGameId(data.id)
        if (data.current_word_state) {
          const guessed = data.current_word_state.replace(/_/g, '').replace(/ /g, '')
          setUsedLetters(new Set(guessed.split('')))
        }
      }
      else {
        setMessage(`Game #${gid} not found. Click "New Game" to start fresh.`)
        setGameState(null)
        setGameId(null)
      }
    }
    catch (error) {
      setMessage('Error fetching Game State: ' + error)
    }
    finally {
      setLoading(false)
    }
  }

  const makeGuess = async (letter: string) => {
    if (!gameId || !letter) return;

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/game/${gameId}/guess`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({ guess: letter })
      })

      if (response.ok) {
        const data: GuessResponse = await response.json()
        setGameState(data.game_state)
        setMessage(data.message)
        setUsedLetters(prev => new Set(prev).add(letter.toUpperCase()))
        setGuess('')
      }
      else{
        const errorData = await response.json()
        setMessage(errorData.error || 'Failed to make a guess. Please try again.')
      }
    }
    catch (error) {
      setMessage('An error occured in server: ' + error)
    }
    finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    //Prevent form submission from reloading the page
    e.preventDefault()
    makeGuess(guess.toUpperCase())
}

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
        <form onSubmit={handleSubmit} className="guess-form">
          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
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
      <button onClick={startNewGame} disabled={loading} className="new-game-btn">
        {loading ? 'Loading...' : 'New Game'}
      </button>
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/:id" element={<Game />} />
        <Route path="/" element={<Game />} />
      </Routes>
    </Router>
  )
}

export default App