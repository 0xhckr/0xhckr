import type { NextRequest } from "next/server";
import { z } from "zod";

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

const resumeDataSchema = z.object({
  profile: z.string(),
  experiences: z.array(
    z.object({
      title: z.string(),
      company: z.string(),
      years: z.object({
        start: z.number(),
        end: z.string(),
      }),
      description: z.array(z.string()),
      address: z.string().optional(),
    }),
  ),
  skills: z.array(
    z.object({
      category: z.string(),
      name: z.string(),
      isExpert: z.boolean(),
    }),
  ),
  education: z.object({
    universityName: z.string(),
    progression: z.string(),
    degreeName: z.string(),
    gpa: z.string().optional(),
    isNull: z.boolean(),
  }),
});

const RESUME_JSON_SCHEMA = {
  type: "object",
  properties: {
    profile: { type: "string" },
    experiences: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          company: { type: "string" },
          years: {
            type: "object",
            properties: {
              start: { type: "number" },
              end: { type: "string" },
            },
            required: ["start", "end"],
          },
          description: {
            type: "array",
            items: { type: "string" },
          },
          address: { type: "string" },
        },
        required: ["title", "company", "years", "description"],
      },
    },
    skills: {
      type: "array",
      items: {
        type: "object",
        properties: {
          category: { type: "string" },
          name: { type: "string" },
          isExpert: { type: "boolean" },
        },
        required: ["category", "name", "isExpert"],
      },
    },
    education: {
      type: "object",
      properties: {
        universityName: { type: "string" },
        progression: { type: "string" },
        degreeName: { type: "string" },
        gpa: { type: "string" },
        isNull: { type: "boolean" },
      },
      required: ["universityName", "progression", "degreeName", "isNull"],
    },
  },
  required: ["profile", "experiences", "skills", "education"],
};

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

  let prompt = `You are a resume generator for Mohammad Al-Ahdal. Given the master resume below${
    jobPosting ? " and the job description" : ""
  }, produce a tailored resume that highlights the most relevant experience and skills${
    jobPosting ? " for this specific role" : ""
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
- Tailor the profile summary to match the target role
- Reorder and emphasize relevant experiences
- Keep all factual information accurate - do not invent experiences, skills, or qualifications
- Adjust the skills section to highlight the most relevant skills for this role, but do not add skills that aren't in the master resume
- Output must match the JSON schema exactly
- For years.end, use a string number like "2024" or "Present"
- For description, always use an array of strings
- For education, set isNull to true if no education should be shown, otherwise provide the fields and set isNull to false`;

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
            name: "resume",
            strict: true,
            schema: RESUME_JSON_SCHEMA,
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

    const parsed = resumeDataSchema.parse(JSON.parse(content));

    const result = {
      profile: parsed.profile,
      experiences: parsed.experiences.map((exp) => ({
        ...exp,
        years: {
          start: exp.years.start,
          end:
            exp.years.end === "Present"
              ? ("Present" as const)
              : Number(exp.years.end),
        },
        description: exp.description,
      })),
      skills: parsed.skills,
      education: parsed.education.isNull
        ? null
        : {
            universityName: parsed.education.universityName,
            progression: parsed.education.progression,
            degreeName: parsed.education.degreeName,
            ...(parsed.education.gpa ? { gpa: parsed.education.gpa } : {}),
          },
    };

    return Response.json(result);
  } catch (err) {
    console.error("Resume generation failed:", err);
    return Response.json(
      { error: "Failed to generate resume" },
      { status: 500 },
    );
  }
}
