const { getTranscript } = require("youtube-transcript");

module.exports = async (req, res) => {
  const videoId = req.query.videoId;

  if (!videoId) {
    return res.status(400).json({ error: "ID de vidéo manquant" });
  }

  try {
    const transcript = await getTranscript(videoId);
    const fullText = transcript.map((entry) => entry.text).join(" ");
    res.status(200).json({ transcript: fullText });
  } catch (error) {
    console.error("Erreur de transcription:", error);
    res.status(500).json({ error: "Impossible de récupérer la transcription." });
  }
};
