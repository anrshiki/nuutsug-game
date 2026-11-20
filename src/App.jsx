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

  useEffect (() => { async function test() { const { data, error } = await supabase .from("players") .select("*") .order("score", { ascending: false }); if (!error) {  setLeaders(data); } console.log(data); console.log(error);} test(); }, []);
  const [wins, setWins] = useState(() => { return Number(localStorage.getItem("wins")) || 0; });
  useEffect(() => { localStorage.setItem("wins", wins); }, [wins]);

  const today = new Date();
  const startDate = new Date("2026-01-01");
  const diffDays = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));

  const [showProfile, setShowProfile] = useState(false);
  <style> {`
    @keyframes slideUp {
    from { transform: translateY(100%);}
    to { transform: translateY(0%);} } `} </style>

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
  const [showNameModal, setShowNameModal] = useState(() => { return localStorage.getItem("loggedIn") !== "true"; });
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const [pin, setPin] = useState("");
  const [isLogin, setIsLogin] = useState (true);
  const [showEditName, setShowEditName] = useState(false);
  const [newUsername, setNewUsername] = useState("");

  const [score, setScore] = useState(() => {
    return Number(localStorage.getItem("score")) || 0;
  });
  useEffect(() => {
    localStorage.setItem("score", score);
  }, [score]);

  const earnedPoints = Math.max(
    10 - Math.floor(tries / 5),
    5
  );

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
💰 Нийт оноо: ${score}
🏆 Хожил: ${wins}
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
    const verbEndings = [ ];
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
const handleRegister = async () => {
  if (!username.trim() || !pin.trim()) return;

  const { data: existing } = await supabase
    .from("players")
    .select("*")
    .eq("username", username);
    if (existing?.length > 0) {
      alert("⚠️ Энэ нэр бүртгэлтэй байна.");
      return;
  }

  const { error } = await supabase
    .from("players")
    .insert({
      username,
      pin,
      wins: 0,
      score: 0,
      streak: 0,
      max_streak: 0,
    });
    if (!error) {
      localStorage.setItem("username", username);
      localStorage.setItem("loggedIn", "true");
      setShowNameModal(false);
      setWins(data.wins || 0);
      setScore(data.score || 0);
      setStreak(data.streak || 0);
      setMaxStreak(data.max_streak || 0);
    }
  };
  const handleLogin = async () => {
  const { data } = await supabase
    .from("players")
    .select("*")
    .eq("username", username)
    .eq("pin", pin)
    .single();
    if (!data) {
      alert("❌ Username эсвэл PIN буруу байна.");
      return;
     }

  localStorage.setItem("username", data.username);
  localStorage.setItem("loggedIn", "true");
  setShowNameModal(false);
};

const handleChangeUsername = async () => {
  if (!newUsername.trim()) return;
  const { data: existing } = await supabase
  .from("players")
  .select("*")
  .eq("username", newUsername);
  if (existing?.length > 0) {
    alert ("🚨 Энэ нэр ашиглагдаж байна.");
    return;
  }
  const { error } = await supabase
  .from("players")
  .update({ username: newUsername, })
  .eq("username", username);
  if (!error) {
    localStorage.setItem("username", newUsername);
    setUsername(newUsername);
    setShowEditName(false);
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

    const similarity = currentWord?.scores?.[guess.toLowerCase()] || 0; 
    let message = "";

    if (similarity === 100) {
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

      const newScore = score + earnedPoints;
      setScore(newScore);

      const currentStreak = streak + 1;
      const currentMaxStreak = Math.max(maxStreak, currentStreak);
      const { data, error } = await supabase
      .from("players")
      .update({
        wins: newWins,
        score: newScore,
        streak: currentStreak,
        max_streak: currentMaxStreak,
      })
      .eq("username", username)
      .select();

      console.log("DATA:", data);
      console.log("ERROR:", error);

    } else if (similarity >= 80) {
      message = `Маш ойр (${score}%)`;
    } else if (similarity >= 30) {
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

  const rankIndex =
  leaders.findIndex(
    player => player.username === username
  );
  const myRank = 
  rankIndex >= 0
  ? rankIndex + 1
  : "";
  const playerAbove =
  myRank > 1
  ? leaders[myRank - 2]
  : null;
  const pointNeeded =
  playerAbove
  ? playerAbove.score - score + 1
  : 0;

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
      <h2
      style={{
        color: "#10B981",
        marginBottom: "10px"
      }}>👋 НАЙН УУ👋 </h2>

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

      <input
      type="password"
      value={pin}
      onChange={(e) => setPin(e.target.value)}
      placeholder="4 оронтой PIN"
      style={{
        width: "100%",
        padding: "10px",
        marginTop: "10px",
        borderRadius: "8px",
        border: "1px solid #ccc",
        boxSizing: "border-box",
      }}
      />
      <p
      style={{
        cursor: "pointer",
        marginTop: "10px",
        color: "#10B981",
      }}
      onClick={() => setIsLogin(!isLogin)}
      >
        {isLogin
        ? "Шинэ хэрэглэгч үү? Бүртгүүлэх"
        : "Бүртгэлтэй юу? Нэвтрэх"
      }
      </p>

      <button
        onClick={ isLogin
          ? handleLogin
          : handleRegister
        }
        style={{
          marginTop: "15px",
          padding: "10px 20px",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        {isLogin ? "Нэвтрэх" : " Бүртгүүлэх "}
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
  <span style={{ color: darkMode ? "#F8FAFC" : "#111827", }}>
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
  Оноо: {score}
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
          <span>💰 {score} оноо</span>
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
    border: "1px solid #10b981",
    textAlign: "center",
  }}
  > ХАМГИЙН ОЙР ҮГ <br />
  <strong>{bestGuess.word}</strong>
  {" "}
  ({bestGuess.score}%)
  </div>
)}

<h3 style={{
  marginTop: "20px",
  marginBottom: "15px",
  color: "#10B981",
  fontSize: "14px",
  fontWeight: "700",
  letterSpacing: "1px",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
  }}
  >
    Хамгийн ойр таамгууд
    </h3>

        <ul style={{ listStyle: "none", padding: 0, marginTop: "10px" }}>
          {sortedHistory.map((item, index) => (
            <li key={index} style={{ marginBottom: "12px" }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "6px",
                fontWeight: "bold",
              }}>
                <span
                style={{ color: item.score >= 80 ? "#10B981" : undefined,}}>{item.word}</span>
                <span
                style={{ color: item.score >= 80 ? "#10B981" : undefined,}}>{item.score}%</span>
              </div>

              <div style={{
                width: "100%",
                height: "18px",
                background: darkMode ? "#232323" : "#ddd",
                borderRadius: "999px",
                overflowY: "hidden",
                marginTop: "4px",
              }}>
                <div style={{
                  width: `${item.score}%`,
                  height: "100%",
                  borderRadius: "999px",
                  background:
                  item.score >= 90
                  ? "linear-gradient(90deg, #10B981, #34D399)"
                  : item.score >= 75
                  ? "linear-gradient(90deg, #22C55E, #86EFAC)"
                  : item.score >= 50
                  ? "linear-gradient(90deg, #6EE7B7, #A7F3D0)"
                  : item.score >= 25
                  ? "linear-gradient(90deg, #F59E0B, #FCD34D)"
                  : "#4B5563",
                  transition: "all 0.5s ease",
                  boxShadow:
                  item.score >= 50
                  ? `
                  inset 0 2px 4px rgba(255,255,255,0.35),
                  inset 0 -2px 4px rgba(0,0,0,0.25),
                  0 0 10px rgba(16,185,129,0.4)`
                  : "none",
                  position: "relative",
                  overflowY: "hidden",
                }} >
                  <div
                  style={{
                    position: "absolute",
                    top: "2px",
                    left: "4px",
                    right: "4px",
                    height: "35%",
                    borderRadius: "999px",
                    background: "linear-gradient(180deg, rgba(255,255,255,0.5), rgba(255,255,255,0.05))",
                  }}></div>
              </div>
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

             {showProfile && (
              <div
              onClick={() => setShowProfile(false)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.6)",
                display: "flex",
                alignItems: "flex-end",
                zIndex: 1000,
              }}
              >
                <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: "calc(100% - 24px)",
                  height: "calc(100vh - 24px)",
                  margin: "12px",
                  background: darkMode ? "#121212" : "#fff",
                  color: darkMode ? "#fff" : "#000",
                  borderTopLeftRadius: "24px",
                  borderTopRightRadius: "24px",
                  padding: "30px 24px",
                  boxSizing: "border-box",
                  overflowY: "auto",
                  boxShadow: "0 -10px 40px rgba(16,185,129,0.15)",
                  animation: "slideUp 0.3s ease-out",

                }}
                >
                  <div
                  style={{
                    textAlign: "center",
                    marginBottom: "20px",
                  }}
                  >
                    <div
                    style={{ fontSize: "52px", marginBottom: "50px", }}> 
                    🍃
                    </div>
                    <h3>{username}</h3>
                    <div
                    style={{
                      fontSize: "42px",
                      color: "#10B981",
                      fontWeight: "bold",
                      marginTop: "12px",
                    }}
                    > Rank #{myRank}
                    </div>
                  </div>
                  <div
                style={{
                  textAlign: "center",
                  marginTop: "10px",
                }}
                >
                  
                  <div
  style={{
	textAlign: "center",
	marginBottom: "20px",
  }}
>
</div>

<div
  style={{
	display: "grid",
	gridTemplateColumns: "repeat(2, 1fr)",
	gap: "12px",
	marginTop: "20px",
  }}
>
  <div
	style={{
  	background: darkMode ? "#181818" : "#f8f8f8",
  	padding: "22px",
  	borderRadius: "16px",
  	textAlign: "center",

    boxShadow: "0 4px 20px rgba( 0,0,0,0.25)",
    border: "1px solid rgba(16,185,129,0.1)",
	}}
  >
	<div style={{ fontSize: "28px", marginBottom: "12px" }}>🏆</div>
	<div style={{ fontSize: "22px", fontWeight: "bold" }}>{score}</div>
	<div style={{ opacity: 0.7 }}>Оноо</div>
  </div>
  <div
	style={{
  	background: darkMode ? "#181818" : "#f8f8f8",
  	padding: "22px",
  	borderRadius: "16px",
  	textAlign: "center",
    boxShadow: "0 4px 20px rgba( 0,0,0,0.25)",
    border: "1px solid rgba(16,185,129,0.1)",
	}}
  >
	<div style={{ fontSize: "28px",marginBottom: "12px" }}>✅</div>
	<div style={{ fontSize: "22px", fontWeight: "bold" }}>{wins}</div>
	<div style={{ opacity: 0.7 }}>Хожил</div>
  </div>
  <div
	style={{
  	background: darkMode ? "#181818" : "#f8f8f8",
  	padding: "22px",
  	borderRadius: "16px",
  	textAlign: "center",
    boxShadow: "0 4px 20px rgba( 0,0,0,0.25)",
    border: "1px solid rgba(16,185,129,0.1)",
	}}
  >
	<div style={{ fontSize: "28px", marginBottom: "12px" }}>🔥</div>
	<div style={{ fontSize: "22px", fontWeight: "bold" }}>{streak}</div>
	<div style={{ opacity: 0.7 }}>Streak</div>
  </div>
  <div
	style={{
  	background: darkMode ? "#181818" : "#f8f8f8",
  	padding: "22px",
  	borderRadius: "16px",
  	textAlign: "center",
    boxShadow: "0 4px 20px rgba( 0,0,0,0.25)",
    border: "1px solid rgba(16,185,129,0.1)",
	}}
  >
	<div style={{ fontSize: "28px", marginBottom: "12px" }}>👑</div>
	<div style={{ fontSize: "22px", fontWeight: "bold" }}>{maxStreak}</div>
	<div style={{ opacity: 0.7 }}>Best</div>
  </div>
</div>



              </div>
              {playerAbove && (
                <div
                style={{
                  marginTop: "25px",
                  padding: "15px",
                  borderRadius: "12px",
                  background: "#10B98122",
                  border: "1px solid #10B98155",
                }}
                >
                  <strong>Дараагийн байр:</strong>
                  <br /> {playerAbove.username}<br />
                  Зөрүү: {pointNeeded} оноо
                  </div>
              )}
              <button
              onClick={() => {
                setNewUsername(username);
                setShowEditName(true);
             }}
             style={{
              width: "100%",
              marginTop: "20px",
              padding: "12px",
              borderRadius: "12px",
              border: "none",
              cursor: "pointer",
              background: "#10B981",
              color: "white",
              fontWeight: "bold",
             }}> 🔄 Нэр солих
             </button>

              <button
                onClick={() => {
                  localStorage.removeItem("loggedIn");
                  localStorage.removeItem("username");
                  setShowProfile(false);
                  setShowNameModal(true);
                }}
                style={{
                  width: "100%",
                  marginTop: "20px",
                  padding: "12px",
                  borderRadius: "12px",
                  border: "none",
                  cursor: "pointer",
                  background: "#ef4444",
                  color: "white",
                  fontWeight: "bold",
                }}
                > 🔒 ГАРАХ
              </button>
              </div>
              </div>
             )}
             
             {showEditName && (
              <div
              onClick={() => setShowEditName(false)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.7)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 2000,
              }}>
                <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: darkMode ? "#121212" : "#fff",
                  color: darkMode ? "#fff" : "#000",
                  padding: "24px",
                  borderRadius: "16px",
                  width: "320px",
                }}
                >
                  <h3 style={{ color: "#10B981" }}>
                    ✏️ Нэр солих
                    </h3>
                    <input
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Шинэ нэр"
                    style={{
                      width: "100%",
                      padding: "10px",
                      marginTop: "10px",
                      borderRadius: "8px",
                      boxSizing: "border-box",
                    }}/>
                    <button
                    onClick={handleChangeUsername}
                    style={{
                      width: "100%",
                      marginTop: "15px",
                      padding: "12px",
                      borderRadius: "10px",
                      border: "none",
                      background: "#10B981",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                    >
                      Хадгалах
                      </button>
                      </div>
                      </div>
                    )}
            
            <button
             onClick={() => setShowProfile(true)}
             style={{
              padding: "10px 15px",
              borderRadius: "8px",
              cursor: "pointer"
             }}
             >
              👤
             </button>


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
              width: "100%",
              height: "100%",
              background: "rgba(0,0,0,0.7)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "20px",
              zIndex: 999,
            }}
            >
              <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: darkMode ? "#121212" : "#fff",
                color: darkMode ? "#fff" : "#000",
                width: "90%",
                maxWidth: "420px",
                maxHeight: "70vh",
                padding: "20px",
                borderRadius: "16px",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 0 30px rgba(16,185,129,0.15)",
                border: "1px solid #10B98133",
              }}
              >
                <h2 style={{
                  textAlign: "center",
                  color: "#10B981",
                  marginBottom: "15px",
                  borderBottom: "1px solid #10B98133",
                  paddingBottom: "10px"
                }}
                >
                  🏆 Leaderboard
                </h2>
                <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  marginTop: "15px",
                  maxHeight: "50vh",
                  paddingRight: "6px",
                }}>
                {leaders.map((player, index) => (
                  <div
                  key={player.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 12px",
                    borderBottom: "1px solid #333"
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
                      <span>{player.score}</span>
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
                    </div>
                  )}

        </div> 
        {showStats && (
          <div onClick={() => setShowStats(false)} style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
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
                <div><h3>{score}</h3><p>Оноо</p></div>
              </div>
              
              <button onClick={() => setShowStats(false)} style={{
                position: "absolute", top: "10px", right: "10px", border: "none",
                background: "transparent", color: darkMode ? "white" : "black", fontSize: "20px", cursor: "pointer",
              }}>X</button>
           
           </div>
          </div>
        )}

      </div>
      
      <p style={{ textAlign: "center", opacity: 0.6, marginTop: "20px", fontSize: "12px" }}> 🍃 NUUTS UG • BETA v0.7.1 </p>
    </div>
  
  );
}

export default App;