# * For pdf and docx or doc extraction
from huggingface_hub import InferenceClient
from groq import Groq
import json
from django.conf import settings


def extract_text(file):
    try:
        filename = file.name.lower()

        if filename.endswith(".pdf"):
            import fitz

            doc = fitz.open(stream=file.read(), filetype="pdf")

            text = ""

            for page in doc:
                text += page.get_text()

            return text

        elif filename.endswith(".docx"):
            from docx import Document

            doc = Document(file)

            text = ""

            for para in doc.paragraphs:
                text += para.text + "\n"

            return text

        else:
            return "Unsupported file format"

    except Exception as e:
        return str(e)


def generate_questions(resume, role):
    token = settings.GROQ_API_KEY
    client = Groq(api_key=token)

    prompt = f"""
You are an expert technical interviewer with years of experience conducting interviews at top technology companies.

Your task is to generate interview questions based ONLY on the candidate's resume and the target job role.

Resume:
{resume}

Target Job Role:
{role}

Instructions:

1. Generate EXACTLY 10 interview questions.

2. Difficulty distribution MUST be:
- 4 Easy
- 4 Medium
- 2 Hard

3. Questions should be personalized according to:
- Skills mentioned in the resume
- Projects
- Technologies
- Frameworks
- Experience
- Education (if relevant)

4. Every question should test understanding instead of simple definitions.

5. Avoid duplicate or very similar questions.

6. Every question must have a list of 5-10 highly relevant keywords or technical phrases.

7. Keywords should include:
- Important technical terms
- Frameworks
- APIs
- Algorithms
- Concepts
- Best practices
- Libraries
- Tools

8. These keywords will later be used for automatic answer scoring, so they should cover the expected concepts instead of exact sentences.

9. Do NOT include the difficulty level in the output.

10. Return ONLY valid JSON.

11. Do NOT write explanations.

12. Do NOT use markdown.

13. Do NOT use ```json.

Return exactly in this format:

{{
  "Question 1?": [
    "keyword1",
    "keyword2",
    "keyword3"
  ],
  "Question 2?": [
    "keyword1",
    "keyword2"
  ]
}}
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.3
    )

    response_text = response.choices[0].message.content

    print("RAW RESPONSE:")
    print(response_text)
    
    clean_response = response_text.strip()

    if clean_response.startswith("```json"):
        clean_response = clean_response.replace("```json", "", 1)

    if clean_response.startswith("```"):
        clean_response = clean_response.replace("```", "", 1)

    if clean_response.endswith("```"):
        clean_response = clean_response[:-3]

    try:
        return json.loads(clean_response.strip())
    except json.JSONDecodeError:
        print("Failed to decode JSON")
        print(clean_response)
        return {}

def get_score(answer, keywords):
    # score sould be out of 10
    total_keywords = len(keywords)
    score = 0
    for keyword in keywords:
        if keyword.lower() in answer.lower():
            score += 1
    return (score / total_keywords) * 10


def analyze_resume(resume_text, role):
    token = settings.GROQ_API_KEY
    client = Groq(
        api_key=token
    )

    prompt = f"""
You are an expert ATS Resume Analyzer.

Analyze the resume for the given job role.

IMPORTANT:
- Return ONLY a valid JSON object.
- Do NOT include explanations.
- Do NOT include markdown.
- Do NOT use ```json.
- Do NOT write any text before or after the JSON.

Return exactly this format:

{{
  "ats_score": 0,
  "resume_score": 0,
  "skills_found": [],
  "missing_skills": [],
  "strengths": [],
  "weaknesses": []
}}

Resume:
{resume_text}

Job Role:
{role}
"""
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.7
    )

    response_text = response.choices[0].message.content

    print("RAW RESPONSE:")
    print(response_text)

    clean_response = response_text.strip()
    if clean_response.startswith("```json"):
        clean_response = clean_response.replace("```json", "", 1)
    if clean_response.startswith("```"):
        clean_response = clean_response.replace("```", "", 1)
    if clean_response.endswith("```"):
        clean_response = clean_response[:-3]

    try:
        # Convert the raw string JSON response into a Python dictionary
        resume_dict = json.loads(clean_response.strip())
        return resume_dict
    except json.JSONDecodeError:
        # Fallback mechanism if the model outputs malformed JSON
        print("Failed to decode model output into JSON.")
        return {}
    

