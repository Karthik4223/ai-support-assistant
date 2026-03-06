const OpenAI = require('openai');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

class LLMService {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
        });

        if (process.env.GOOGLE_API_KEY) {
            this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        }

        this.docsPath = path.resolve(__dirname, '../docs.json');
    }

    loadDocs() {
        try {
            const data = fs.readFileSync(this.docsPath, 'utf8');
            return JSON.parse(data);
        } catch (err) {
            console.error('Error loading docs.json', err);
            return [];
        }
    }

    async getChatResponse(sessionId, userMessage, history, mode = 'general', globalHistory = [], image = null, customApiKey = null) {
        if (mode === 'prescription') {
            return this.getPrescriptionExtraction(userMessage, image, customApiKey);
        }

        const docs = this.loadDocs();
        const docsContent = docs.map(doc => `Title: ${doc.title}\nContent: ${doc.content}`).join('\n\n');

        let systemPrompt = '';

        if (mode === 'docs') {
            systemPrompt = `You are Flash Man, a helpful assistant. You MUST answer ONLY using the provided documentation. 
If the information is not in the documentation, say "I'm sorry, my current mode only allows me to answer based on official documentation, and I couldn't find that there."

Documentation:
${docsContent}`;
        } else {
            systemPrompt = `You are Flash Man, a super-fast personal assistant. You have access to documentation but can also use your general knowledge.

Documentation:
${docsContent}

Global Memory (Recent interactions across all sessions):
${globalHistory.map(h => `[Session: ${h.sessionTitle}] ${h.role}: ${h.content}`).join('\n')}

Instructions:
1. Prioritize documentation if relevant.
2. Use your general knowledge for other queries.
3. You have a "Global Memory" of previous chats. If the user asks about past conversations, refer to the Global Memory provided above.`;
        }

        const messages = [
            { role: 'system', content: systemPrompt },
            ...history.map(msg => ({ role: msg.role, content: msg.content })),
            { role: 'user', content: userMessage }
        ];

        try {
            const response = await this.openai.chat.completions.create({
                model: process.env.LLM_MODEL || "gpt-3.5-turbo",
                messages: messages,
                temperature: 0,
            });
            console.log(response);
            return {
                reply: response.choices[0].message.content,
                tokensUsed: response.usage.total_tokens
            };
        } catch (err) {
            console.error('LLM API Error:', err);
            throw new Error('Failed to fetch AI response');
        }
    }

    async getPrescriptionExtraction(message, imageBase64, customApiKey = null) {
        let genAI = this.genAI;
        if (customApiKey) {
            genAI = new GoogleGenerativeAI(customApiKey);
        } else if (!process.env.GOOGLE_API_KEY) {
            throw new Error('GOOGLE_API_KEY_MISSING');
        }

        if (!genAI) {
            genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        }

        try {
            const model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            // If message is provided when image is uploaded, it's a custom prompt override
            const prompt = (imageBase64 && message) ? message : `### SYSTEM ROLE

You are a **Senior Clinical Pharmacist specializing in Indian prescription digitisation and medication safety**.

Your task is to **extract medication data from prescription images with the highest possible accuracy**.

Patient safety is critical. You must **never guess, invent, or infer medication names**.

Your job is **data extraction only**, not medical interpretation.

Return **only structured JSON output**.

---

# PRIMARY OBJECTIVE

Extract **all medications exactly as written in the prescription**.

Medication extraction is **mandatory**.

All other fields are **optional**.

---

# EXTRACTION STRATEGY

You must internally follow this **4-step extraction pipeline**.

---

## STEP 1 — RAW TEXT CAPTURE

Identify the portion of the prescription that contains medications.

Capture the **exact visible medication text lines** without interpretation.

Example:

Tab Amlod 5   1-0-1
Cap Becosules 1 od
Syp Crocin 5ml sos

Preserve the exact wording as 
"Raw_Text".

---

## STEP 2 — STRUCTURED PARSING

Convert each medication line into structured fields.

Extract the following fields **only if visible**:

Drug_Name
Strength
Dosage
Route
Frequency
Duration

If information is missing, return an empty string "".

Never fabricate data.

---

## STEP 3 — DRUG NAME VALIDATION

Validate drug names using known Indian pharmaceutical references such as:

CIMS India
MedIndia
Indian Drug Index

Rules:

• If drug name is **fully legible and matches known drug database**
→ Needs_Verification = false

• If drug name is **partially legible or uncertain**
→ append "(VERIFY)"

Example:

Drug_Name: "Amlodipine (VERIFY)"

• If the visible text cannot be matched to any drug
→ mark Needs_Verification = true

Never expand incomplete words unless fully readable.

Example:

Visible text:

Amlod...

Return:

Drug_Name: "Amlod..."
Needs_Verification: true

Do NOT convert to Amlodipine.

---

## STEP 4 — SELF VERIFICATION PASS

Perform a second internal review before producing the final output.

Verify:

• No drug names were guessed
• Every medication includes Raw_Text
• No missing fields were invented
• Strength units appear realistic
• Duplicate medications are flagged

If any issue exists, mark "Conflict_Flag": true.

---

# MEDICATION SHORTHAND STANDARDIZATION

Convert common prescription shorthand:

1-0-1 → Twice daily (Morning & Night)
1-1-1 → Three times daily
1-0-0 → Once daily (Morning)
0-0-1 → Once daily (Night)
1 od / qd → Once daily
bd → Twice daily
tid → Three times daily
sos → As needed
pc → After food
ac → Before food

---

# DOSAGE FORM NORMALIZATION

Tab → Tablet
Cap → Capsule
Syr → Syrup
Inj → Injection
Drops → Drops
Oint → Ointment
Cream → Cream

---

# IMAGE LEGIBILITY SAFETY CHECK

If **no medication name can be identified with ≥90% confidence**, return:

{
"error": "Medication names are illegible. Please provide a clearer image."
}

---

# PARTIAL DATA RULE

If any field cannot be determined:

"Strength": ""

Do not guess values.

---

# CONFIDENCE SCORING

Confidence values should reflect handwriting clarity.

Guidelines:

95-100 → printed or very clear
80-94 → readable handwriting
60-79 → partially unclear
below 60 → highly uncertain

---

# OUTPUT JSON FORMAT

Return the output strictly using the following JSON structure:

{
"Patient": {
"Name": "",
"Age": "",
"Gender": ""
},

"Doctor": {
"Name": "",
"Specialization": "",
"Clinic_Hospital_Name": ""
},

"Medications": [
{
"Drug_Name": "",
"Strength": "",
"Dosage": "",
"Route": "",
"Frequency": "",
"Duration": "",
"Raw_Text": "",
"Needs_Verification": false,
"Confidence": "0-100"
}
],

"Diagnosis": [],
"Date": "",

"Extraction_Metadata": {
"Total_Medications_Extracted": 0,
"Verification_Required_Count": 0,
"Conflict_Flag": false
},

"Extraction_Confidence": "0-100",
"error": null
}

---

# FINAL VALIDATION CHECKLIST

Before returning the output verify:

1. Every medication has Raw_Text.
2. No medication name was guessed.
3. Uncertain drugs contain "(VERIFY)".
4. Missing values are empty strings "".
5. JSON structure matches exactly.
6. Output contains **only JSON**.

Return the final structured JSON.`;

            const parts = [{ text: prompt }];

            if (imageBase64) {
                const mimeTypeMatch = imageBase64.match(/^data:([^;]+);base64,/);
                const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";
                const base64Data = imageBase64.replace(/^data:[^;]+;base64,/, "");
                parts.push({
                    inlineData: {
                        mimeType: mimeType,
                        data: base64Data
                    }
                });
            } else if (message) {
                parts.push({ text: `User message: ${message}` });
            }

            const genModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const result = await genModel.generateContent(parts);
            const response = await result.response;
            const text = response.text();

            return {
                reply: text,
                tokensUsed: 0
            };
        } catch (err) {
            console.error('Gemini API Error:', err);
            throw new Error("Error try later or tokens limit exceeded");
        }
    }

    async generateTitle(userMessage) {
        try {
            const response = await this.openai.chat.completions.create({
                model: process.env.LLM_MODEL || "gpt-3.5-turbo",
                messages: [
                    {
                        role: 'system',
                        content: 'Generate a very short, catchy title (max 4 words) for a chat conversation that begins with the following user message. Return ONLY the title text.'
                    },
                    { role: 'user', content: userMessage }
                ],
                temperature: 0.7,
                max_tokens: 15
            });

            return response.choices[0].message.content.replace(/["']/g, '').trim();
        } catch (err) {
            console.error('Title Generation Error:', err);
            return 'New Conversation';
        }
    }
}

module.exports = new LLMService();
