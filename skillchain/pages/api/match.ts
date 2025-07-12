// pages/api/match.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

interface Profile {
  name: string;
  skillsOffered: string[];
  skillsWanted: string[];
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  const { skillsOffered, skillsWanted, profiles } = req.body;

  try {
    const prompt = `You are an intelligent skill-matching AI.
Find users from this list who best match the needs below.

Skills Offered: ${skillsOffered.join(', ')}
Skills Wanted: ${skillsWanted.join(', ')}

Candidates:
${profiles.map((p: Profile, i: number) => `${i + 1}. ${p.name} (Offers: ${p.skillsOffered.join(', ')}, Wants: ${p.skillsWanted.join(', ')})`).join('\n')}

Give the best 3 matches.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a smart skill-matching assistant.' },
        { role: 'user', content: prompt }
      ],
    });

    const matches = response.choices[0].message.content;
    res.status(200).json({ matches });
  } catch (err) {
    console.error('Match API error:', err);
    res.status(500).json({ message: 'Failed to generate matches' });
  }
}
