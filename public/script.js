const YOUTUBE_API_KEY = "AIzaSyC9Ce8cKbeDz8ZXdx9ZJTIT0EwMrFptl5I"; // remplace ta clé API

const fetchBtn = document.getElementById("fetchBtn");
const videoUrlInput = document.getElementById("videoUrl");
const videoInfoSection = document.getElementById("videoInfo");
const videoTitle = document.getElementById("videoTitle");
const thumbnailImg = document.getElementById("thumbnail");
const transcriptPre = document.getElementById("transcript");
const translateBtn = document.getElementById("translateBtn");
const downloadBtn = document.getElementById("downloadBtn");
const loadingDiv = document.getElementById("loading");
const themeToggle = document.getElementById("themeToggle");

let originalTranscript = "";
let translated = false;

// Extraire l'ID vidéo depuis le lien
function extractVideoID(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// Récupérer infos vidéo via YouTube Data API
async function fetchVideoInfo(videoId) {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Erreur lors de la récupération des infos YouTube.");
  const data = await res.json();
  if (!data.items.length) throw new Error("Vidéo introuvable.");
  return data.items[0].snippet;
}

// Récupérer transcription via backend Vercel
async function fetchTranscript(videoId) {
  try {
    const res = await fetch(`/api/transcript?videoId=${videoId}`);
    if (!res.ok) throw new Error("Erreur transcription");
    const data = await res.json();
    return data.transcript;
  } catch (e) {
    return "Transcription non disponible.";
  }
}

// Traduire texte avec LibreTranslate API gratuite
async function translateText(text, targetLang = "fr") {
  const res = await fetch("https://libretranslate.de/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      q: text,
      source: "auto",
      target: targetLang,
      format: "text"
    })
  });
  if (!res.ok) throw new Error("Erreur lors de la traduction.");
  const data = await res.json();
  return data.translatedText;
}

// Télécharger l’image miniature
function downloadImage(url, filename = "miniature.jpg") {
  fetch(url)
    .then(res => res.blob())
    .then(blob => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      URL.revokeObjectURL(a.href);
    });
}

fetchBtn.addEventListener("click", async () => {
  const url = videoUrlInput.value.trim();
  const videoId = extractVideoID(url);

  if (!videoId) {
    alert("Lien YouTube Short invalide.");
    return;
  }

  videoInfoSection.classList.add("hidden");
  loadingDiv.classList.remove("hidden");
  videoTitle.textContent = "";
  transcriptPre.textContent = "";
  thumbnailImg.src = "";
  translated = false;

  try {
    const snippet = await fetchVideoInfo(videoId);
    videoTitle.textContent = snippet.title;
    thumbnailImg.src = snippet.thumbnails.high.url;
    originalTranscript = await fetchTranscript(videoId);
    transcriptPre.textContent = originalTranscript;
    videoInfoSection.classList.remove("hidden");
  } catch (e) {
    alert(e.message);
  } finally {
    loadingDiv.classList.add("hidden");
  }
});

translateBtn.addEventListener("click", async () => {
  if (translated) {
    transcriptPre.textContent = originalTranscript;
    translateBtn.textContent = "Traduire en français";
    translated = false;
    return;
  }

  translateBtn.textContent = "Traduction en cours...";
  try {
    const translatedText = await translateText(originalTranscript);
    transcriptPre.textContent = translatedText;
    translateBtn.textContent = "Afficher original";
    translated = true;
  } catch {
    alert("Erreur lors de la traduction.");
    translateBtn.textContent = "Traduire en français";
  }
});

downloadBtn.addEventListener("click", () => {
  if (!thumbnailImg.src) return alert("Pas d'image à télécharger.");
  downloadImage(thumbnailImg.src);
});

// Gestion du thème clair/sombre
function loadTheme() {
  if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light");
    themeToggle.textContent = "🌙";
  } else {
    document.body.classList.remove("light");
    themeToggle.textContent = "☀️";
  }
}

themeToggle.addEventListener("click", () => {
  if (document.body.classList.contains("light")) {
    document.body.classList.remove("light");
    localStorage.setItem("theme", "dark");
    themeToggle.textContent = "☀️";
  } else {
    document.body.classList.add("light");
    localStorage.setItem("theme", "light");
    themeToggle.textContent = "🌙";
  }
});

loadTheme();
