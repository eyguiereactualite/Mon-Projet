import { getTranscript } from "youtube-transcript";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { videoId } = req.query;

  if (!videoId) {
    return res.status(400).json({ error: "Missing videoId parameter" });
  }

  try {
    const transcript = await getTranscript(videoId, { lang: "en" });
    // transcript est un tableau [{ text, duration, offset }]
    const fullText = transcript.map(item => item.text).join(" ");
    res.status(200).json({ transcript: fullText });
  } catch (e) {
    res.status(500).json({ error: "Transcription non disponible" });
  }
}
