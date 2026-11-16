// MOCK: no real API. Replace the body of sendMessage() with a fetch/axios call later.
const REPLIES = [
  { match: /book|appointment/i, text: 'You can book from any doctor profile. Open "All Doctors", pick a doctor and choose a time slot.' },
  { match: /doctor|find|near/i, text: 'Try the "Doctors near me" button on the Doctors page to see nearby doctors on a map.' },
  { match: /symptom|pain|fever|cough|headache/i, text: 'I cannot diagnose, but a General physician is a good first step. Please see a doctor for anything severe.' },
  { match: /report|lab|test/i, text: 'Upload your lab report on the Lab Report page to get a plain-language summary.' },
]
const FALLBACK = 'I am a demo assistant for now. Ask me about booking, finding a doctor or lab reports.'

export const sendMessage = (text) =>
  new Promise((resolve) => {
    const reply = REPLIES.find((r) => r.match.test(text))?.text || FALLBACK
    setTimeout(() => resolve({ role: 'bot', text: reply }), 900)
  })
