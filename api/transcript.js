import { getTranscript } from "youtube-transcript";

export default async function handler(req, res) {
  const { videoId } = req.query;
  if (!videoId) return res.status(400).json({ error: "Missing videoId" });

  try {
    const transcript = await getTranscript(videoId);
    const fullText = transcript.map(entry => entry.text).join(" ");
    res.status(200).json({ transcript: fullText });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch transcript" });
  }
}
