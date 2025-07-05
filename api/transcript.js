import { getTranscript } from "youtube-transcript";

export default async function handler(req, res) {
  const { videoId } = req.query;

  if (!videoId) {
    return res.status(400).json({ error: "Missing videoId parameter" });
  }

  try {
    const transcript = await getTranscript(videoId);
    const fullText = transcript.map(item => item.text).join(" ");
    res.status(200).json({ transcript: fullText });
  } catch (error) {
    res.status(404).json({ error: "Transcription non disponible" });
  }
}
