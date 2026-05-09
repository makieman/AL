/**
 * Summarise clinical notes into a professional 2-sentence clinical summary
 * Pure client-side text processing — no external API call
 * @param {string} notes - raw clinical notes
 * @returns {string} professional summary
 */
export function summariseNotes(notes) {
  if (!notes || !notes.trim()) return '';

  // Clean up the text
  let cleaned = notes
    .replace(/\b(um|uh|like|you know|basically|just|really|very|so)\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/[!]{2,}/g, '!')
    .replace(/\.{2,}/g, '.')
    .trim();

  // Split into sentences
  const sentences = cleaned
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 5);

  if (sentences.length === 0) {
    return `Patient presents with: ${cleaned.slice(0, 120)}. Timely clinical evaluation and appropriate specialist management recommended.`;
  }

  // Pick the most medically relevant sentence for the first line
  const medicalKeywords = [
    'pain', 'fever', 'swelling', 'blood', 'pressure', 'diabetes', 'infection',
    'fracture', 'cough', 'breathing', 'chest', 'headache', 'injury', 'surgery',
    'cancer', 'tumor', 'heart', 'kidney', 'liver', 'malaria', 'hiv', 'tb',
    'diagnosis', 'condition', 'symptoms', 'treatment', 'medication', 'referred',
    'patient', 'history', 'chronic', 'acute', 'pregnant', 'labour', 'emergency',
  ];

  const scored = sentences.map(s => {
    const lower = s.toLowerCase();
    const score = medicalKeywords.reduce((acc, kw) => acc + (lower.includes(kw) ? 1 : 0), 0);
    return { text: s, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // Capitalise first letter
  const cap = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const mainReason = cap(scored[0].text);

  // Determine urgency hint from notes
  const lowerNotes = notes.toLowerCase();
  let urgencyPhrase = 'Routine specialist consultation recommended';
  if (lowerNotes.includes('urgent') || lowerNotes.includes('emergency') || lowerNotes.includes('critical') || lowerNotes.includes('immediate')) {
    urgencyPhrase = 'Urgent specialist evaluation and intervention required';
  } else if (lowerNotes.includes('follow-up') || lowerNotes.includes('monitor') || lowerNotes.includes('review')) {
    urgencyPhrase = 'Follow-up evaluation and continued monitoring recommended';
  }

  return `${mainReason}. ${urgencyPhrase}.`;
}
