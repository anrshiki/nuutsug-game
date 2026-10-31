import { useState, useEffect } from "react";
import wordsData from "./data/words.json";

function App() {  
  const [guess, setGuess] = useState("");
  const [result, setResult] = useState("");
  const [history, setHistory] = useState(() => { return JSON.parse(localStorage.getItem("history")) || []; });
  useEffect(() => { localStorage.setItem("history", JSON.stringify(history)); }, [history]);

  const [showStats, setShowStats] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(now.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const diff = tomorrow - now;
      const hours = Math.floor(diff / 1000 / 60 / 60);
      const minutes = Math.floor(diff / 1000 / 60) % 60;
      const seconds = Math.floor(diff / 1000) % 60;
      setTimeLeft(
        `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [wins, setWins] = useState(() => { return Number(localStorage.getItem("wins")) || 0; });
  useEffect(() => { localStorage.setItem("wins", wins); }, [wins]);

  const today = new Date();
  const dayNumber = today.getFullYear() * 1000 + today.getMonth() * 100 + today.getDate();

  const [inputFocused, setInputFocused] = useState(false);
  const [gamesPlayed, setGamesPlayed] = useState(() => { return Number(localStorage.getItem("gamesPlayed")) || 0; });
  useEffect(() => { localStorage.setItem("gamesPlayed", gamesPlayed); }, [gamesPlayed]);

  const [streak, setStreak] = useState(() => { return Number(localStorage.getItem("streak")) || 0; });
  useEffect(() => { localStorage.setItem("streak", streak); }, [streak]);

  const [maxStreak, setMaxStreak] = useState(() => { return Number(localStorage.getItem("maxStreak")) || 0; });
  useEffect(() => { localStorage.setItem("maxStreak", maxStreak); }, [maxStreak]);

  const [darkMode, setDarkMode] = useState(() => { return localStorage.getItem("darkMode") === "true"; });
  useEffect(() => { localStorage.setItem("darkMode", darkMode); }, [darkMode]);

  const [tries, setTries] = useState(() => { return Number(localStorage.getItem("tries")) || 0; });
  useEffect(() => { localStorage.setItem("tries", tries); }, [tries]);

  const [isSolved, setIsSolved] = useState(() => { return localStorage.getItem("isSolved") === "true"; });
  useEffect(() => { localStorage.setItem("isSolved", isSolved); }, [isSolved]);

  const todayKey = new Date().toLocaleDateString();
  useEffect(() => { 
    const savedDate = localStorage.getItem("lastPlayedDate");
    if (savedDate !== todayKey) { 
      setIsSolved(false);
      setHistory([]);
      setTries(0);
      localStorage.setItem("lastPlayedDate", todayKey);
    }
  }, [todayKey]);

  const currentWord = wordsData[dayNumber % wordsData.length];

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleGuess();
    }
  };
  
  const handleShare = async () => {
    const shareText = `Нууц Үг\n\nОноо: ${wins}\nStreak: ${streak}\nОролдлого: ${tries}\n\nБи өнөөдрийн нууц үгийг таасан!`;
    await navigator.clipboard.writeText(shareText);
    alert("Амжилттай хууллаа!");
  };

  // Дүрмийн шалгалт (Холбоо үг, үйл үг зэргийг шалгах хэсэг)
  const validateWord = (word) => {
    const trimmed = word.trim();
    
    // 1. Холбоо үг эсэх (Зай орсон эсэх)
    if (trimmed.includes(" ")) {
      return "Холбоо үг оруулах хориотой!";
    }
    
    // 2. Үйл үг төгсгөл шалгах
    const verbEndings = ["эх", "ах", "иг", "өг", "уух", "ийх", "ч"];
    if (verbEndings.some(ending => trimmed.endsWith(ending))) {
      return "Үйл үг оруулах хориотой!";
    }

    return null;
  };

  const handleGuess = () => {
    if (!guess) return;

    // Дүрмийн шалгалт ажиллуулах
    const validationError = validateWord(guess);
    if (validationError) {
      setResult(`⚠️ ${validationError}`);
      return;
    }

    setTries(t => t + 1);

    const score = currentWord?.scores?.[guess.toLowerCase()] || 0; 
    let message = "";

    if (score === 100) {
      message = "Зөв Таалаа!";
      setWins(w => w + 1);
      setStreak(s => {
        const newStreak = s + 1;
        if (newStreak > maxStreak) {
          setMaxStreak(newStreak);
        }
        return newStreak;
      });
      setGamesPlayed(g => g + 1);
      setIsSolved(true);
    } else if (score >= 80) {
      message = `Маш ойр (${score}%)`;
    } else if (score >= 30) {
      message = `Ойртож байна (${score}%)`;
    } else {
      message = `Хол байна даа (${score}%)`;
    }

    setResult(message);

    setHistory([
      {
        word: guess,
        score: score,
      },
      ...history,
    ]);

    setGuess("");
  };

  const winRate = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0;

  return (
    <div style={{ 
      padding: "15px", 
      minHeight: "100vh", 
      backgroundColor: darkMode ? "#121212" : "#ffffff", 
      color: darkMode ? "#ffffff" : "#000000", 
    }}>
      <div style={{
        maxWidth: "600px",
        width: "100%",
        boxSizing: "border-box",
        margin: "0 auto",
        padding: "25px",
        borderRadius: "20px",
        backgroundColor: darkMode ? "#1e1e1e" : "#f8f8f8",
        boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
      }}>
        
        <h1 style={{
          textAlign: "center",
          fontSize: "40px",
          fontWeight: "bold",
          marginBottom: "20px",
          color: "inherit",
        }}> НУУЦ ҮГ</h1>

        {isSolved && (
          <p style={{ textAlign: "center", color: "#4CAF50" }}> Баяр хүргэе! Маргааш шинэ үг өгөгдөнө.</p>
        )}

        <div style={{
          textAlign: "center",
          padding: "10px",
          borderRadius: "12px",
          background: darkMode ? "#333" : "#eee",
          marginBottom: "15px",
          fontSize: "18px",
          fontWeight: "bold",
        }}>Оноо: {wins}</div>
        
        <input
          autoFocus
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          style={{
            width: "100%",
            padding: "14px",
            fontSize: "18px",
            borderRadius: "12px",
            backgroundColor: darkMode ? "#333" : "#fff",
            color: darkMode ? "#fff" : "#000",
            border: "2px solid #4CAF50",
            outline: "none",
            boxSizing: "border-box",
            boxShadow: inputFocused ? "0 0 20px rgba(76, 175, 80, 0.7)" : "none",
          }}
          disabled={isSolved}
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Нэр үг оруулна уу..."
        />
        
        <p style={{ marginTop: "10px" }}>Оролдлогууд: {tries}</p>

        <p style={{
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "18px",
          margin: "15px",
        }}>{result}</p>

        <h3 style={{ marginTop: "20px", marginBottom: "15px" }}>Өмнөх бичигдсэн үгс</h3>
        <ul style={{ listStyle: "none", padding: 0, marginTop: "10px" }}>
          {history.map((item, index) => (
            <li key={index} style={{ marginBottom: "12px" }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "4px",
                fontWeight: "bold",
              }}>
                <span>{item.word}</span>
                <span>{item.score}%</span>
              </div>

              <div style={{
                width: "100%",
                height: "14px",
                background: darkMode ? "#333" : "#ddd",
                borderRadius: "999px",
                overflow: "hidden",
              }}>
                <div style={{
                  width: `${item.score}%`,
                  height: "100%",
                  borderRadius: "999px",
                  background: `hsl(${item.score * 1.2}, 85%, 50%)`,
                  transition: "all 0.5s ease",
                }} />
              </div>
            </li>
          ))}
        </ul>

        {isSolved && (
          <div style={{ 
            textAlign: "center",
            padding: "12px",
            borderRadius: "12px",
            background: darkMode ? "#333" : "#eee",
            marginTop: "15px",
            fontWeight: "bold",
            fontSize: "18px",
          }}>
            <div>Дараагийн үг гарах хүртэл</div>
            <div style={{ fontSize: "22px", fontWeight: "bold", marginTop: "5px" }}>{timeLeft}</div>
          </div>
        )}
        
        <div style={{ display: "flex", gap: "10px", marginTop: "20px", justifyContent: "center" }}>
          <button onClick={() => setDarkMode(!darkMode)} style={{ padding: "10px 15px", borderRadius: "8px", cursor: "pointer" }}>
            {darkMode ? "☀️" : "🌙"}
          </button>
          
          {isSolved && (
            <button onClick={handleShare} style={{ padding: "10px 15px", borderRadius: "8px", cursor: "pointer" }}>
              📤 Хуваалцах
            </button>
          )}

          <button onClick={() => setShowStats(true)} style={{ padding: "10px 15px", borderRadius: "8px", cursor: "pointer" }}>
            📊 Статистик
          </button>
        </div>

        {showStats && (
          <div onClick={() => setShowStats(false)} style={{
            position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
            background: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center",
          }}>
            <div onClick={(e) => e.stopPropagation()} style={{
              background: darkMode ? "#222" : "#fff", color: darkMode ? "#fff" : "#000",
              padding: "25px", borderRadius: "12px", minWidth: "300px", position: "relative",
            }}>
              <h2 style={{ textAlign: "center", marginBottom: "15px" }}>Статистик</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "15px", textAlign: "center" }}> 
                <div><h3>{gamesPlayed}</h3><p>Тоглосон</p></div>
                <div><h3>{wins}</h3><p>Хожсон</p></div>
                <div><h3>{streak}</h3><p>Streak</p></div>
                <div><h3>{winRate}%</h3><p>Win Rate</p></div>
                <div><h3>{tries}</h3><p>Оролдлогууд</p></div>
              </div>
              
              <button onClick={() => setShowStats(false)} style={{
                position: "absolute", top: "10px", right: "10px", border: "none",
                background: "transparent", color: darkMode ? "white" : "black", fontSize: "20px", cursor: "pointer",
              }}>X</button>
            </div>
          </div>
        )}

      </div>
      <p style={{ textAlign: "center", opacity: 0.6, marginTop: "20px", fontSize: "12px" }}>Nuuts Ug BETA v0.1</p>
    </div>
  );
}

export default App;