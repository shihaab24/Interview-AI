//const { GoogleGenAI } = require("@google/genai");
const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,});

const interviewReportSchema = z.object({
    matchScore: z.number().describe(
        "A score between 0 and 100 indicating how well the candidate's profile matches the job description"
    ),

    technicalQuestions: z.array(
        z.object({
            question: z.string().describe(
                "The technical question that can be asked in the interview"
            ),

            intention: z.string().describe(
                "The interviewer's intention behind asking this question"
            ),

            Answer: z.string().describe(
                "A detailed answer explaining how the candidate should answer the question"
            )
        })
    ).describe(
        "Technical questions that can be asked in the interview along with their intention and answers"
    ),

    behavioralQuestions: z.array(
        z.object({
            question: z.string().describe(
                "The behavioral question that can be asked in the interview"
            ),

            intention: z.string().describe(
                "The interviewer's intention behind asking this question"
            ),

            Answer: z.string().describe(
                "A detailed answer explaining how the candidate should answer the question"
            )
        })
    ).describe(
        "Behavioral questions that can be asked in the interview along with their intention and answers"
    ),

    skillGaps: z.array(
        z.object({
            skill: z.string().describe(
                "The skill that the candidate is lacking"
            ),

            severity: z.enum([
                "Low",
                "Medium",
                "High"
            ]).describe(
                "The severity level of the skill gap"
            )
        })
    ).describe(
        "List of skill gaps identified in the candidate profile"
    ),

    preparationPlans: z.array(
        z.object({
            day: z.number().describe(
                "The day number in the preparation plan"
            ),

            focus: z.string().describe(
                "The primary focus area for this day"
            ),

            tasks: z.array(
                z.string()
            ).describe(
                "Tasks that should be completed on this day"
            )
        })
    ).describe(
        "Day-wise preparation plan for interview preparation"
    ),

    title: z.string().describe(
        "The title of the target job role"
    )
});

// console.log("Schema Test Starting");

// const schema = zodToJsonSchema(interviewReportSchema);

// console.log("Schema Test Success");
// console.log(schema);

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {


    const prompt = `Generate an interview report for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}
`

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
         config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(interviewReportSchema),
        } 
    })
    
    return JSON.parse(response.text)

    // const report = JSON.parse(response.text);

    // console.log(JSON.stringify(report, null, 2));

    // return report;
}              



module.exports = generateInterviewReport;