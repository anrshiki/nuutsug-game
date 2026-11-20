import { useState, useEffect } from "react";
import { words } from "./data/words.js";
import { supabase } from "./supabase";


function App() {  
  const [guess, setGuess] = useState("");
  const [result, setResult] = useState("");
  const [history, setHistory] = useState(() => { return JSON.parse(localStorage.getItem("history")) || []; });
  useEffect(() => { localStorage.setItem("history", JSON.stringify(history)); }, [history]);

  const [showStats, setShowStats] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [leaders, setLeaders] = useState([]);

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

  useEffect (() => { async function test() { const { data, error } = await supabase .from("players") .select("*") .order("wins", { ascending: false }); if (!error) {  setLeaders(data); } console.log(data); console.log(error);} test(); }, []);
  const [wins, setWins] = useState(() => { return Number(localStorage.getItem("wins")) || 0; });
  useEffect(() => { localStorage.setItem("wins", wins); }, [wins]);

  const today = new Date();
  const startDate = new Date("2026-01-01");
  const diffDays = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));

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

  const [hasPlayedToday, setHasPlayedToday] = useState(() => {
    return localStorage.getItem("hasPlayedToday") === "true";  });
    useEffect(() => {
      localStorage.setItem("hasPlayedToday", hasPlayedToday);    }, [hasPlayedToday]);
  const todayKey = new Date().toLocaleDateString();
  useEffect(() => { 
    const savedDate = localStorage.getItem("lastPlayedDate");
    if (savedDate !== todayKey) { 
      setGamesPlayed(g => g + 1);
      setIsSolved(false);
      setHistory([]);
      setTries(0);
      setHasPlayedToday(false);
      localStorage.setItem("lastPlayedDate", todayKey);
    }
  }, [todayKey]);

  const currentWord = words[diffDays% words.length];

  const [username, setUsername] = useState(() => { return localStorage.getItem("username") || ""; });
  const [showNameModal, setShowNameModal] = useState(() => { return !localStorage.getItem("username"); });
  const [showLeaderboard, setShowLeaderboard] = useState(false);


  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleGuess();
    }
  };
  
  const handleShare = async () => {
    const shareText = `🍃 NUUTS UG
✅ Өнөөдрийн нууц үгийг таалаа!
🎯 Оролдлого: ${tries}
🔥 Streak: ${streak}
🏆 Нийт хожил: ${wins}
`;

    await navigator.clipboard.writeText(shareText);
    alert("📋 Үр дүн clipboard-д хууллаа!");
  };

  // Дүрмийн шалгалт (Холбоо үг, үйл үг зэргийг шалгах хэсэг)
  const validateWord = (word) => {
    const trimmed = word.trim();
    
    // 1. Холбоо үг эсэх (Зай орсон эсэх)
    if (trimmed.includes(" ")) {
      return "Холбоо үг оруулах хориотой!";
    }
    
    // 2. Үйл үг төгсгөл шалгах
    const verbEndings = ["эх", "ах", "өг", "уух", "ийх"];
    if (verbEndings.some(ending => trimmed.endsWith(ending))) {
      return "Үйл үг оруулах хориотой!";
    }

    return null;
  };

const saveUsername = async () => {
  if (!username.trim()) return;

  const { data, error } = await supabase
    .from("players")
    .upsert({
      username: username,
      wins: 0,
      streak: 0,
      max_streak: 0
    });

  console.log("DATA:", data);
  console.log("ERROR:", error);

  if (!error) {
    localStorage.setItem("username", username);
    setShowNameModal(false);
  }
};

  const handleGuess = async () => {
    if (!guess) return;

    if (!hasPlayedToday) {
      setGamesPlayed(g => g + 1);
      setHasPlayedToday(true);
    }

    const normalizedGuess = guess.trim().toLowerCase();
    const exists = history.some(
      item => item.word.toLowerCase() === guess.toLowerCase()
    );
    if (exists) {
      setResult("⚠️ Энэ үгийг өмнө нь оруулсан байна.");
      return;
    }

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
      //setWins(w => w + 1);
      setStreak(s => {
        const newStreak = s + 1;
        if (newStreak > maxStreak) {
          setMaxStreak(newStreak);
        }
        return newStreak;
      });
      setGamesPlayed(g => g + 1);
      setIsSolved(true);
      
      const newWins = wins + 1;

      setWins(newWins);

      const currentStreak = streak + 1;
      const currentMaxStreak = Math.max(maxStreak, currentStreak);
      const { data, error } = await supabase
      .from("players")
      .update({
        wins: newWins,
        streak: currentStreak,
        max_streak: currentMaxStreak,
      })
      .eq("username", username)
      .select();

      console.log("DATA:", data);
      console.log("ERROR:", error);

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
  const bestGuess =
  history.length > 0
  ? history.reduce((max, item) => 
  item.score > max.score ? item : max )
  : null;
  const sortedHistory = [...history].sort(
    (a, b) => b.score - a.score 
  );

  return (
    <div style={{ 
      padding: "15px", 
      minHeight: "100vh", 
      backgroundColor: darkMode ? "#090909" : "#ffffff", 
      color: darkMode ? "#ffffff" : "#000000", 
    }}>
      {showNameModal && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100vh",
      background: "rgba(0,0,0,0.7)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 999,
    }}
  >
    <div
      style={{
        background: darkMode ? "#222" : "#fff",
        color: darkMode ? "#fff" : "#000",
        padding: "25px",
        borderRadius: "12px",
        width: "320px",
        textAlign: "center",
      }}
    >
      <h2>👋 Тавтай морил</h2>

      <p>Leaderboard-д харагдах нэрээ оруулна уу</p>

      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Жишээ: Bat-Erdene"
        style={{
          width: "100%",
          padding: "10px",
          marginTop: "10px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          boxSizing: "border-box",
        }}
      />

      <button
        onClick={saveUsername}
        style={{
          marginTop: "15px",
          padding: "10px 20px",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Хадгалах
      </button>
    </div>
  </div>
)}

      <div style={{
        maxWidth: "600px",
        width: "100%",
        boxSizing: "border-box",
        margin: "0 auto",
        padding: "25px",
        borderRadius: "20px",
        backgroundColor: darkMode ? "#121212" : "#f8f8f8",
        boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
      }}>
        
        <h1
  style={{
    textAlign: "center",
    fontSize: "42px",
    fontWeight: "900",
    marginBottom: "0px",
    letterSpacing: "2px",
  }}
>
  <span style={{ color: "#F5F5F5" }}>
    НУУЦ
  </span>
  <span style={{ color: "#10B981" }}>
    ҮГ
  </span>
</h1>
<div
style={{
  display: "flex",
  justifyContent: "center",
  marginBottom: "10px",
}}
>
  <img
  src="leaf-logo.png"
  alt="NUUTS UG"
  style={{
    width: "62px",
    height: "62px",
    objectFit: "contain",
    filter: "drop-shadow( 0 0 12px rgba(16,185,129,0.25))",
  }}
  />
</div>
        {isSolved && (
          <p style={{ textAlign: "center", color: "#10B981" }}> Баяр хүргэе! Өнөөдрийн нууц үгийг таалаа. </p>
        )}

        <div
  style={{
    textAlign: "center",
    padding: "10px",
    borderRadius: "12px",
    background: darkMode ? "#181818" : "#eee",
    border: darkMode ? "1px solid #232323" : "none",
    marginBottom: "15px",
    fontSize: "18px",
    fontWeight: "bold",
  }}
>
  👤 {username}
  <br />
  Оноо: {wins}
</div>
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
            border: "2px solid #10B981",
            outline: "none",
            boxSizing: "border-box",
            boxShadow: inputFocused ? "0 0 20px rgba(16, 185, 129, 0.6)" : "none",
          }}
          disabled={isSolved}
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Нэр үг оруулна уу..."
        />
        
      <div
      style={{
        marginTop: "15px",
        padding: "12px",
        borderRadius: "12px",
        background: darkMode ? "#181818" : "#f3f4f6",
        border: darkMode ? "1px solid #232323" : "1px solid #ddd",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        }}
        >
          <span>🎯 {tries} оролдлого</span>
          <span>🏆 {wins} хожил</span>
          </div>


        <p style={{
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "18px",
          margin: "15px",
        }}>{result}</p>

{bestGuess && (
  <div
  style={{
    marginTop: "15px",
    marginBottom: "15px",
    padding: "12px",
    borderRadius: "12px",
    background: "#10B98122",
    border: "1px SOLID #10b981",
    textAlign: "center",
  }}
  > ХАМГИЙН ОЙР ҮГ <br />
  <strong>{bestGuess.word}</strong>
  {" "}
  ({bestGuess.score}%)
  </div>
)}
<h3 style={{ marginTop: "20px", marginBottom: "15px", color: "#10B981", }}> 🍃 Хамгийн ойр таамгууд </h3>

        <ul style={{ listStyle: "none", padding: 0, marginTop: "10px" }}>
          {sortedHistory.map((item, index) => (
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
                width: "100px",
                height: "14px",
                background: darkMode ? "#333" : "#ddd",
                borderRadius: "999px",
                overflow: "hidden",
              }}>
                <div style={{
                  width: `${item.score}%`,
                  height: "100%",
                  borderRadius: "999px",
                  background:
                  item.score >= 80
                  ? "#10B981"
                  : item.score >= 50
                  ? "#34D399"
                  : item.score >= 25
                  ? "#6EE7B7"
                  : "#374151",
                  transition: "all 0.5s ease",
                }} />
              </div>
            </li>
          ))}
        </ul>
          <div style={{ 
            textAlign: "center",
            padding: "12px",
            borderRadius: "12px",
            background: darkMode ? "#181818" : "#eee",
            border: darkMode ? "1px solid #232323" : "none",
            marginTop: "15px",
            fontWeight: "bold",
            fontSize: "18px",
          }}>
            <div>Дараагийн үг гарах хүртэл</div>
            <div style={{ fontSize: "22px", fontWeight: "bold", marginTop: "5px" }}>{timeLeft}</div>
          </div>
        <div style={{ display: "flex", gap: "10px", marginTop: "1.25rem", justifyContent: "center" }}>
          <button onClick={() => setDarkMode(!darkMode)} style={{ padding: "10px 15px", borderRadius: "8px", cursor: "pointer" }}>
            {darkMode ? "☀️" : "🌙"}
          </button>
          
          {isSolved && (
            <button onClick={handleShare} style={{ padding: "10px 15px", borderRadius: "8px", cursor: "pointer" }}>
              📤 
            </button>
          )}
          
          <button
          onClick={() => setShowLeaderboard(true)}
          style={{
            padding: "10px 15px",
             borderRadius: "8px",
             cursor: "pointer"
             }}
             > 🏆 </button>


          <button onClick={() => setShowStats(true)} style={{ padding: "10px 15px", borderRadius: "8px", cursor: "pointer" }}>
            📊
          </button>
          
          {showLeaderboard && (
            <div
            onClick={() => setShowLeaderboard(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "90%",
              height: "90%",
              background: "rgba(0,0,0,0.7)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            >
              <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: darkMode ? "#121212" : "#fff",
                color: darkMode ? "#fff" : "#000",
                padding: "25px",
                borderRadius: "12px",
                minWidth: "300px",
                maxHeight: "80vh",
                overflowY: "auto",
                position: "relative",
              }}
              >
                <h2 style={{ textAlign: "center" }}> 🏆 Leaderboard </h2>
                {leaders.map((player, index) => (
                  <div
                  key={player.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 0",
                    borderBottom: "1px solid #444"
                  }}
                  >
                    <span>
                      {index === 0
                      ? "🥇"
                      : index === 1
                      ? "🥈"
                      : index === 2
                      ? "🥉"
                      : `${index + 1}.`}{" "}
                      {player.username}
                      </span>
                      <span>{player.wins}</span>
                      </div>
                    ))}
                    <button
                    onClick={() => setShowLeaderboard(false)}
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      border: "none",
                      background: "transparent",
                      color: darkMode ? "white" : "black",
                      fontSize: "20px",
                      cursor: "pointer",
                    }}
                    > X </button>
                    </div>
                    </div>
                  )}

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
      <p style={{ textAlign: "center", opacity: 0.6, marginTop: "20px", fontSize: "12px" }}> 🍃 NUUTS UG • BETA v0.4 </p>
    </div>
  
  );
}

export default App;