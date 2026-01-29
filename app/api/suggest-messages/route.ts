export const runtime = "edge";

export async function POST() {
    try {
        const prompt = `
            Create exactly three open-ended, friendly questions
            for an anonymous social messaging platform.

            Rules:
            - Avoid personal or sensitive topics
            - Focus on universal, positive themes
            - Separate each question with "||"
            - Do NOT add numbering
            - Do NOT add explanations

            Example format:
            Question one||Question two||Question three
            `;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "openai/gpt-3.5-turbo",
                messages: [
                    { role: "user", content: prompt }
                ],
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("OpenRouter error:", errorText);

            return Response.json(
                { success: false, message: "AI request failed" },
                { status: 500 }
            );
        }

        const data = await response.json();
        const rawText: string =
            data.choices?.[0]?.message?.content ?? "";

        const questions = parseQuestions(rawText);

        return Response.json({
            success: true,
            questions,
        });
    }
    catch (error) {
        console.error("Suggest messages error:", error);

        return Response.json(
            { success: false, message: "Unexpected server error" },
            { status: 500 }
        );
    }
}

function parseQuestions(raw: string): string[] {
    return raw
        .split("||")
        .map(q => q.trim())
        .filter(Boolean)
        .slice(0, 3);
}


// NON STREAMING TEXT 

// export const runtime = "edge";

// export async function POST() {
//     try {
//         const prompt = `
//             Create exactly three open-ended, friendly questions
//             for an anonymous social messaging platform.

//             Rules:
//             - Avoid personal or sensitive topics
//             - Focus on universal, positive themes
//             - Separate each question with "||"
//             - Do NOT add numbering
//             - Do NOT add explanations

//             Example format:
//             Question one||Question two||Question three
//             `;

//     const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
//         method: "POST",
//             headers: {
//                 "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
//                 "Content-Type": "application/json",
//                 // "HTTP-Referer": "http://localhost:3000",
//                 // "X-Title": "Mystery Message ",
//             },
//             body: JSON.stringify({
//                 model: "openai/gpt-3.5-turbo",
//                 messages: [
//                 { role: "user", content: prompt }
//                 ],
//                 //temperature: 0.8,
//             }),
//         });

//         if (!response.ok) {
//         const errorText = await response.text();
//         console.error("OpenRouter error:", errorText);

//         return Response.json(
//             { success: false, message: "AI request failed" },
//             { status: 500 }
//         );
//         }

//         const data = await response.json();
//         const rawText: string =
//         data.choices?.[0]?.message?.content ?? "";

//         const questions = parseQuestions(rawText);

//         return Response.json({
//             success: true,
//             questions,
//         });
//     }
//     catch (error) {
//         console.error("Suggest messages error:", error);

//         return Response.json(
//             { success: false, message: "Unexpected server error" },
//             { status: 500 }
//         );
//     }
// }

// function parseQuestions(raw: string): string[] {
//   return raw
//     .split("||")
//     .map(q => q.trim())
//     .filter(Boolean)
//     .slice(0, 3);
// }
