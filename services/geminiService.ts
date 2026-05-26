
import { GoogleGenAI, Type, Chat } from "@google/genai";
import type { SkillProficiency, ChatMessage, CareerPath, SimulationTurn, Internship } from '../types';

// Helper function to get AI instance with API key
const getAI = () => {
  if (!process.env.API_KEY) {
    throw new Error("API Key not configured. Please set the GEMINI_API_KEY environment variable.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export interface ResumeAnalysisResult {
    hardSkills: string[];
    softSkills: string[];
    skillProficiencies: SkillProficiency[];
}

const resumeSchema = {
    type: Type.OBJECT,
    properties: {
        hardSkills: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Technical or hard skills mentioned, like 'Python', 'React', 'SQL'."
        },
        softSkills: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Inferred soft skills based on experience, like 'Leadership', 'Teamwork'."
        },
        skillProficiencies: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    skill: { type: Type.STRING },
                    level: { type: Type.STRING, enum: ['Beginner', 'Intermediate', 'Advanced'] }
                },
                required: ['skill', 'level']
            },
            description: "Estimated proficiency for each hard skill."
        }
    },
    required: ['hardSkills', 'softSkills', 'skillProficiencies']
};


export const analyzeResume = async (resumeText: string): Promise<ResumeAnalysisResult> => {
    const ai = getAI();

    const prompt = `You are an expert HR tech analyst. Analyze the following resume text and extract key information.
    Resume:
    ---
    ${resumeText}
    ---
    Based on the text, provide:
    1.  A list of technical/hard skills.
    2.  A list of inferred soft skills (e.g., 'Leadership', 'Communication', 'Teamwork').
    3.  An estimated proficiency level ('Beginner', 'Intermediate', 'Advanced') for each technical skill.
    
    Return the result as a JSON object matching the provided schema.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: resumeSchema
            },
        });

        const jsonText = (response.text ?? '').trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error analyzing resume:", error);
        throw new Error("Could not analyze the resume at this time.");
    }
};

export const analyzeResumeWithFile = async (base64Data: string, mimeType: string): Promise<ResumeAnalysisResult> => {
    const ai = getAI();

    const prompt = `You are an expert HR tech analyst. Analyze the uploaded resume document and extract key information.
    
    Based on the document content, provide:
    1.  A list of technical/hard skills.
    2.  A list of inferred soft skills (e.g., 'Leadership', 'Communication', 'Teamwork').
    3.  An estimated proficiency level ('Beginner', 'Intermediate', 'Advanced') for each technical skill.
    
    Return the result as a JSON object matching the provided schema.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: base64Data
                        }
                    },
                    { text: prompt }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: resumeSchema
            },
        });

        const jsonText = (response.text ?? '').trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error analyzing resume file:", error);
        throw new Error("Could not analyze the resume file. Please ensure it is a valid PDF.");
    }
};


export const generateLearningPlan = async (skill: string): Promise<string> => {
  try {
    const ai = getAI();
    const prompt = `Create a concise, 2-step learning plan for a beginner to learn "${skill}". Suggest one free, high-quality online resource for each step. Format the output as a simple list.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    return response.text ?? '';
  } catch (error) {
    console.error("Error generating learning plan:", error);
    if (error instanceof Error && error.message.includes("API Key not configured")) {
      return "API Key not configured. Please set the GEMINI_API_KEY environment variable to use AI features.";
    }
    return "Could not generate a learning plan at this time. Please try again later.";
  }
};

// --- New AI Coach Service ---
let chat: Chat | null = null;

export const startAICoachSession = (studentName: string, internshipTitle: string, studentSkills: string[]) => {
    const ai = getAI();
    const systemInstruction = `You are an expert career coach for students. Your name is 'Coach Gemini'. You are speaking with a student named ${studentName}.
    They are interested in the '${internshipTitle}' internship.
    Their current skills are: ${studentSkills.join(', ')}.
    Be friendly, encouraging, and provide specific, actionable advice. Keep your responses concise and easy to understand.`;

    chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: systemInstruction,
        },
    });
};

export const getAICoachResponse = async (message: string): Promise<string> => {
    if (!chat) {
        return "Chat session not started. Please start a session first.";
    }
    
    try {
        const response = await chat.sendMessage({ message });
        return response.text ?? '';
    } catch (error) {
        console.error("Error getting AI coach response:", error);
        if (error instanceof Error && error.message.includes("API Key not configured")) {
            return "API Key not configured. Please set the GEMINI_API_KEY environment variable to use AI features.";
        }
        return "I'm having trouble responding right now. Please try again in a moment.";
    }
};


// --- New Career Path Service ---
const careerPathSchema = {
    type: Type.OBJECT,
    properties: {
        paths: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    steps: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['title', 'steps']
            },
            description: "An array of 2-3 potential career paths."
        }
    },
    required: ['paths']
};

export const generateCareerPaths = async (internshipTitle: string, studentInterests: string[]): Promise<CareerPath[]> => {
    const ai = getAI();
    
    const prompt = `A student with interests in [${studentInterests.join(', ')}] is considering an internship titled "${internshipTitle}".
    Based on this, generate 2-3 distinct, long-term career paths this internship could lead to, particularly within the public sector or related fields.
    For each path, provide a clear title and a list of 3-4 sequential steps or roles, starting with the current internship.
    Example step: "1. Succeed in the ${internshipTitle} role to build foundational skills."
    Return the result as a JSON object matching the provided schema.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: careerPathSchema
            },
        });
        const jsonText = (response.text ?? '').trim();
        const result = JSON.parse(jsonText);
        return result.paths || [];
    } catch (error) {
        console.error("Error generating career paths:", error);
        if (error instanceof Error && error.message.includes("API Key not configured")) {
            throw new Error("API Key not configured. Please set the GEMINI_API_KEY environment variable to use AI features.");
        }
        throw new Error("Could not generate career paths at this time.");
    }
};

// --- Live Opportunity Scout (Web Search) ---

export interface ScoutResult {
    internships: Internship[];
    groundingMetadata?: any;
}

export const scoutLiveInternships = async (query: string): Promise<ScoutResult> => {
    const ai = getAI();

    const prompt = `Search for currently active, real-world internships matching: "${query}".
    Search across major platforms like LinkedIn, Unstop, Internshala, Google Careers, and other job boards in India.
    
    Find 6-8 distinct, active internships.
    
    For each internship, extract:
    - Job Title
    - Company Name
    - Location
    - Stipend (if available, else 'Not disclosed')
    - Required Skills (infer 2-3 if not explicitly stated)
    - A brief description (max 20 words)
    - The Source Name (e.g., 'LinkedIn', 'Unstop')
    - The Apply Link (URL)

    Format the output as a JSON array of objects. 
    Each object must have these keys: "title", "company", "location", "stipend", "required_skills" (array of strings), "description", "source", "externalLink".
    Do not use markdown code blocks. Just return the raw JSON.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
            },
        });

        let text = (response.text ?? '').trim();
        if (text.startsWith('```json')) {
            text = text.replace(/```json/g, '').replace(/```/g, '');
        } else if (text.startsWith('```')) {
            text = text.replace(/```/g, '');
        }
        
        const rawResults = JSON.parse(text);
        
        // Map to our Internship type
        // We generate negative IDs to distinguish them from database IDs
        const internships: Internship[] = rawResults.map((item: any, index: number) => ({
            internship_id: -1 * (Date.now() + index), // unique negative ID
            title: item.title,
            company: item.company,
            location: item.location,
            stipend: item.stipend || 'Not Disclosed',
            logoColor: 'bg-indigo-600', // Default color for web results
            description: item.description,
            required_skills: item.required_skills || [],
            domain: item.title, // infer domain from title
            postedDate: new Date().toISOString(), // Assume fresh
            externalLink: item.externalLink,
            source: item.source || 'Web Search'
        }));

        return {
            internships,
            groundingMetadata: response.candidates?.[0]?.groundingMetadata
        };
    } catch (error) {
        console.error("Error scouting internships:", error);
        if (error instanceof Error && error.message.includes("API Key not configured")) {
            throw new Error("API Key not configured. Please set the GEMINI_API_KEY environment variable to use AI features.");
        }
        // Return empty array instead of throwing to avoid breaking the UI
        return { internships: [] }; 
    }
};

// --- Internship Simulation Service ---

const simulationScenarioSchema = {
    type: Type.OBJECT,
    properties: {
        scenario: {
            type: Type.STRING,
            description: "A realistic workplace scenario or challenge related to the internship."
        }
    },
    required: ['scenario']
};

export const generateSimulationScenario = async (title: string, description: string): Promise<{ scenario: string }> => {
    const ai = getAI();

    const prompt = `Create a realistic, specific, and challenging "Day 1" workplace scenario for an intern in the role of "${title}".
    Job Description: ${description}
    
    The scenario should require the intern to make a decision or explain their approach to a problem. It should not be a multiple choice question.
    
    Return the result as a JSON object with a single key "scenario".`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: simulationScenarioSchema
            },
        });

        const jsonText = (response.text ?? '').trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating simulation scenario:", error);
        if (error instanceof Error && error.message.includes("API Key not configured")) {
            throw new Error("API Key not configured. Please set the GEMINI_API_KEY environment variable to use AI features.");
        }
        throw new Error("Could not generate simulation scenario.");
    }
};

const simulationEvaluationSchema = {
    type: Type.OBJECT,
    properties: {
        score: {
            type: Type.INTEGER,
            description: "A score from 1 to 10 based on the quality of the response."
        },
        feedback: {
            type: Type.STRING,
            description: "Detailed feedback explaining why the score was given and how to improve."
        }
    },
    required: ['score', 'feedback']
};

export const evaluateSimulationResponse = async (scenario: string, userResponse: string): Promise<SimulationTurn> => {
    const ai = getAI();

    const prompt = `You are a senior mentor.
    Scenario: "${scenario}"
    Intern's Response: "${userResponse}"
    
    Evaluate the intern's response.
    1. Give a score from 1 to 10.
    2. Provide constructive feedback.
    
    Return the result as a JSON object with keys "score" (number) and "feedback" (string).`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: simulationEvaluationSchema
            },
        });

        const jsonText = (response.text ?? '').trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error evaluating simulation response:", error);
        if (error instanceof Error && error.message.includes("API Key not configured")) {
            throw new Error("API Key not configured. Please set the GEMINI_API_KEY environment variable to use AI features.");
        }
        throw new Error("Could not evaluate simulation response.");
    }
};

// --- Content Generation for Resources ---

export const generateLessonContent = async (courseTitle: string, lessonTitle: string): Promise<string> => {
    try {
        const ai = getAI();
        const prompt = `You are an expert instructor for the course: "${courseTitle}".
        Write a comprehensive, engaging, and educational lesson content for the topic: "${lessonTitle}".
        
        Structure the content with:
        1. Introduction to the concept.
        2. Key Principles or Steps.
        3. A real-world example.
        4. A quick summary.
        
        Use Markdown formatting (headings, bullet points, bold text). Keep it concise (approx 300 words).`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text ?? '';
    } catch (error) {
        console.error("Error generating lesson content:", error);
        if (error instanceof Error && error.message.includes("API Key not configured")) {
            return "API Key not configured. Please set the GEMINI_API_KEY environment variable to use AI features.";
        }
        return "Failed to load lesson content. Please try again.";
    }
}

export const generateResourceContent = async (resourceTitle: string, resourceDescription: string): Promise<string> => {
    try {
        const ai = getAI();
        const prompt = `Create a high-quality, professional downloadable resource document.
        Title: "${resourceTitle}"
        Context: ${resourceDescription}
        
        This should be a practical guide, template, or checklist that a student can actually use.
        Format it clearly using Markdown. Make it detailed and valuable.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text ?? '';
    } catch (error) {
        console.error("Error generating resource content:", error);
        if (error instanceof Error && error.message.includes("API Key not configured")) {
            return "API Key not configured. Please set the GEMINI_API_KEY environment variable to use AI features.";
        }
        return "Failed to generate resource.";
    }
}

// --- Personalized Hub Generator ---

export interface AIGeneratedPath {
    title: string;
    level: string;
    description: string;
    modules: string[];
}

export interface AIGeneratedResource {
    title: string;
    description: string;
}

export interface PersonalizedHub {
    paths: AIGeneratedPath[];
    resources: AIGeneratedResource[];
}

const personalizedHubSchema = {
    type: Type.OBJECT,
    properties: {
        paths: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    level: { type: Type.STRING },
                    description: { type: Type.STRING },
                    modules: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['title', 'level', 'description', 'modules']
            },
            description: "6 highly relevant learning paths (courses) for the student."
        },
        resources: {
             type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING }
                },
                required: ['title', 'description']
            },
            description: "4 downloadable resource titles."
        }
    },
    required: ['paths', 'resources']
};

export const generatePersonalizedLearningHub = async (
    skills: string[], 
    interests: string[], 
    resumeSnippet: string
): Promise<PersonalizedHub> => {
    const ai = getAI();

    const prompt = `Analyze this student profile:
    Skills: ${skills.join(', ')}
    Interests: ${interests.join(', ')}
    Resume Snippet: "${resumeSnippet.substring(0, 500)}..."
    
    1. Identify 6 distinct learning paths (Courses). These should range from strengthening existing skills to learning new ones relevant to their interests.
    2. Identify 4 useful downloadable resources (Cheat Sheets, Templates, Guides) relevant to them.
    
    For each Learning Path, provide:
    - Title
    - Level (Beginner/Intermediate/Advanced)
    - Short Description
    - A list of 5-7 short module/lesson titles.
    
    Return JSON matching the schema.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: personalizedHubSchema
            },
        });
        const jsonText = (response.text ?? '').trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating personalized hub:", error);
        if (error instanceof Error && error.message.includes("API Key not configured")) {
            throw new Error("API Key not configured. Please set the GEMINI_API_KEY environment variable to use AI features.");
        }
         throw new Error("Failed to generate personalized content");
    }
}
