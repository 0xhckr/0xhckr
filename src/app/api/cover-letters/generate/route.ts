import type { NextRequest } from "next/server";

const OPENROUTER_API_KEY = process.env.OPEN_ROUTER_API_KEY;
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
}

async function convexQuery(
  functionName: string,
  args: Record<string, unknown>,
) {
  const url = `${CONVEX_URL}/api/query`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: functionName, args }),
  });
  if (!res.ok) {
    throw new Error(`Convex query failed: ${res.status} ${await res.text()}`);
  }
  const { value } = await res.json();
  return value;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { jobPostingId } = body as { jobPostingId?: string };

  const [masterResume, jobPosting] = await Promise.all([
    convexQuery("resumes:getPublic", {}),
    jobPostingId ? convexQuery("jobPostings:get", { id: jobPostingId }) : null,
  ]);

  if (!masterResume) {
    return Response.json({ error: "No master resume found" }, { status: 404 });
  }

  let prompt = `You are a cover letter generator for Mohammad Al-Ahdal. Given the master resume below${
    jobPosting ? " and the job description" : ""
  }, write a professional and compelling cover letter${
    jobPosting ? " tailored for this specific role" : ""
  }.

Master Resume:
${masterResume.content}`;

  if (jobPosting) {
    prompt += `

Job Description:
Title: ${jobPosting.title}
Company: ${jobPosting.company}
${jobPosting.location ? `Location: ${jobPosting.location}` : ""}
${jobPosting.description}`;
  }

  prompt += `

Instructions:
- Write a professional cover letter that highlights the most relevant experience and skills
- Keep all factual information accurate - do not invent experiences, skills, or qualifications
- Use a confident but not arrogant tone
- Keep the cover letter concise - ideally 3-4 paragraphs
- Address the hiring manager if the company is known, otherwise use a general greeting
- Output must be a JSON object with a single "content" field containing the cover letter text as a string`;

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "anthropic/claude-haiku-4.5",
        messages: [{ role: "user", content: prompt }],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "cover_letter",
            strict: true,
            schema: {
              type: "object",
              properties: {
                content: { type: "string" },
              },
              required: ["content"],
            },
          },
        },
      }),
    });

    if (!res.ok) {
      throw new Error(
        `OpenRouter API error: ${res.status} ${await res.text()}`,
      );
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("No content in OpenRouter response");
    }

    const parsed = JSON.parse(content) as { content: string };

    return Response.json({ content: parsed.content });
  } catch (err) {
    console.error("Cover letter generation failed:", err);
    return Response.json(
      { error: "Failed to generate cover letter" },
      { status: 500 },
    );
  }
}
