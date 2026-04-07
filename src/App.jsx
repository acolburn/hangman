import { useState } from "react";
import { cast } from "./cast";
import { clsx } from "clsx";
import { words } from "./words.js";
import Confetti from "react-confetti";

function App() {
  // State variables
  const [secretWord, setSecretWord] = useState(() => {
    return words[Math.floor(Math.random() * words.length)].toUpperCase();
  });
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [guessResults, setGuessResults] = useState({});
  const [soundIndex, setSoundIndex] = useState(0); // To keep track of which 'ew' sound to play next

  // Static variables
  const row1 = "QWERTYUIOP".split("");
  const row2 = "ASDFGHJKL".split("");
  const row3 = "ZXCVBNM".split("");
  const sounds = [
    "ew1.mp3",
    "ew3.mp3",
    "ew2.mp3",
    "ew4.mp3",
    "ew5.mp3",
    "ew6.mp3",
    "ew7.mp3",
    "ew8.mp3",
  ];

  // Derived variables
  const wrongGuessesCount = guessedLetters.filter(
    (letter) => guessResults[letter] === false,
  ).length;
  const castGone = wrongGuessesCount > 0 ? cast.slice(-wrongGuessesCount) : []; // Get the last N actors based on the number of wrong guesses
  const isGameWon = secretWord
    .split("")
    .every((letter) => guessedLetters.includes(letter));
  const isGameLost = wrongGuessesCount >= cast.length;
  const isGameOver = isGameWon || isGameLost;
  const isLastGuessCorrect =
    guessResults &&
    guessResults[guessedLetters[guessedLetters.length - 1]] === true;

  function newGame() {
    // Reset the game state
    setGuessedLetters([]);
    setGuessResults({});
    // Pick a new random word from the words array
    const randomWord =
      words[Math.floor(Math.random() * words.length)].toUpperCase();
    setSecretWord(randomWord);
  }

  function addGuessedLetter(letter) {
    // if user already guessed the letter, do nothing
    if (guessedLetters.includes(letter)) {
      return;
    }
    // add the letter to the guessed letters array
    setGuessedLetters([...guessedLetters, letter]);

    // check if the letter is in the secret word and update guess results
    let correctGuess = false;
    if (secretWord.includes(letter)) {
      correctGuess = true;
    }
    setGuessResults({ ...guessResults, [letter]: correctGuess });
    // Play 'ew' if guess is wrong
    if (!correctGuess) {
      const audio = new Audio(
        sounds[soundIndex % sounds.length], // Cycle through the 'ew' sounds
      );
      audio.play();
      setSoundIndex(soundIndex + 1); // Increment the sound index for the next wrong guess
    }
  }

  function statusMsgHeading() {
    if (isGameWon) {
      return "You win! 🎉 ";
    }
    if (isGameLost) {
      return "Rose Apothecary has closed. 😢 ";
    }
    if (isLastGuessCorrect) {
      return "Good guess! 🌟 ";
    }
    return cast[cast.length - castGone.length]?.msgHeading || "";
  }

  function statusMsg() {
    if (isGameWon) {
      return "The town is safe!";
    }
    if (isGameLost) {
      return "There are no happy endings, for Schitt's Creek is no more.";
    }
    if (isLastGuessCorrect) {
      return "Keep hope alive!";
    }
    return cast[cast.length - castGone.length]?.msg || "";
  }

  return (
    <main className="border-box m-0 text-[#D9D9D9] font-hanken-grotesk p-5 h-screen flex flex-col items-center">
      {/* Render confetti if game is won */}
      {isGameWon && <Confetti recycle={false} numberOfPieces={1000} />}
      <header className="text-center space-y-3">
        <h1 className="text-3xl font-bold text-amber-100">
          Schitt's Creek Hangman
        </h1>
        <p className="max-w-87.5">
          Can you keep everyone in town? With every incorrect guess, someone
          leaves!
        </p>
      </header>
      {/* Game Status Section */}
      <div
        className={clsx(
          "flex flex-col items-center justify-center min-h-30 my-5 w-90 py-3 rounded",
          { "bg-red-700": isGameLost },
          { "bg-red-400": !isLastGuessCorrect && !isGameOver },
          { "bg-green-400": isLastGuessCorrect && !isGameOver },
          // { "bg-[#7A5EA7]": !isGameOver },
          { "bg-green-700!": isGameWon },
          { "bg-slate-800": guessedLetters.length === 0 }, // start of game
        )}
      >
        <h2 className="text-2xl font-bold text-amber-100">
          {statusMsgHeading()}
        </h2>
        <p className="font-bold text-center text-slate-800">{statusMsg()}</p>
      </div>
      {/* Images Section */}
      <div className="flex flex-wrap max-w-90 justify-center mb-4">
        {cast.map((actor) => (
          <div key={actor.name}>
            {/* Container for layered images */}
            <div className="relative w-18 h-18 md:w-22 md:h-22 m-2">
              {/* Base image */}
              <img
                src={actor.image}
                alt={actor.name}
                className="w-full h-full object-cover rounded-full"
              />

              {/* Centered overlay image */}
              {/* Display the red X overlay if the actor is not in town */}
              {castGone.includes(actor) && (
                <img
                  // src={actor.overlayImage}
                  src="red-x.jpg"
                  alt={`${actor.name} overlay`}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 object-cover rounded-full"
                />
              )}
            </div>

            <p className="text-center text-sm">{actor.name}</p>
          </div>
        ))}
      </div>
      {/* Display Word Section  */}
      <div className="flex justify-center space-x-2 mt-5 ">
        {secretWord.split("").map((letter, index) => (
          /* clsx is there so if player loses, unplayed letters in the word are displayed in red  */
          <div
            key={index}
            className={clsx(
              "w-9 h-9 sm:w-12 sm:h-12 bg-slate-600 border-b-2 border-slate-300 text-sm sm:text-2xl flex items-center justify-center",
              {
                "text-red-400": isGameOver && !guessedLetters.includes(letter),
              },
            )}
          >
            {/* If guess is correct, show the letter. If not, show an empty string. But, if game is over, show the letter no matter what. */}
            {guessedLetters.includes(letter) || isGameOver ? letter : ""}
          </div>
        ))}
      </div>
      {/* Keyboard Section */}
      {/* Top row (QWERTY...) */}
      <div className="mt-7 space-y-3">
        <div className="flex space-x-1 md:space-x-2 justify-center">
          {row1.map((key) => (
            <button
              key={key}
              onClick={() => addGuessedLetter(key)}
              disabled={isGameOver}
              className={clsx(
                "w-7 md:w-10 h-7 md:h-10 text-md md:text-xl rounded text-black font-bold border border-white disabled:opacity-50",
                {
                  "bg-amber-400": !guessedLetters.includes(key),
                  "bg-green-400": guessResults[key] === true,
                  "bg-red-400": guessResults[key] === false,
                },
              )}
            >
              {key}
            </button>
          ))}
        </div>
        {/* Middle row (ASDFG...) */}
        <div className="flex space-x-1 md:space-x-2 justify-center">
          {row2.map((key) => (
            <button
              key={key}
              onClick={() => addGuessedLetter(key)}
              disabled={isGameOver}
              className={clsx(
                "w-7 md:w-10 h-7 md:h-10 text-md md:text-xl rounded text-black font-bold border border-white disabled:opacity-50",
                { "bg-amber-400": !guessedLetters.includes(key) },
                { "bg-green-400": guessResults[key] === true },
                { "bg-red-400": guessResults[key] === false },
              )}
            >
              {key}
            </button>
          ))}
        </div>
        {/* Bottom row (ZXC...) */}
        <div className="flex space-x-1 md:space-x-2 justify-center pb-3">
          {row3.map((key) => (
            <button
              key={key}
              onClick={() => addGuessedLetter(key)}
              disabled={isGameOver}
              className={clsx(
                "w-7 md:w-10 h-7 md:h-10 text-md md:text-xl rounded text-black font-bold border border-white disabled:opacity-50",
                { "bg-amber-400": !guessedLetters.includes(key) },
                { "bg-green-400": guessResults[key] === true },
                { "bg-red-400": guessResults[key] === false },
              )}
            >
              {key}
            </button>
          ))}
        </div>
        {/* New game button  */}
        {/* Conditionally render the "New Game" button if the game is over */}
        {isGameOver && (
          <div className="flex justify-center mt-4">
            <button
              className="bg-green-400 text-black py-2 px-12 rounded border border-white"
              onClick={newGame}
            >
              New Game
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default App;
