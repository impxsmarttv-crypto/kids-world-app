import os
import re
from typing import Literal
import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
load_dotenv()
app = FastAPI(title="Kids AI Assistant API", version="0.1.0")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = os.getenv("OPENROUTER_MODEL", "openrouter/free")
API_KEY = os.getenv("OPENROUTER_API_KEY")
BLOCKED = re.compile(r"(porn|pornography|sex|nude|naked|suicide|self[- ]?harm|kill myself|drugs|cocaine|meth|weapon|bomb|buy.{0,20}gun)", re.I)
class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    age: int = Field(ge=2, le=16)
    language: Literal["ar", "en"] = "ar"
class ChatResponse(BaseModel):
    answer: str
    blocked: bool = False
def system_prompt(age: int, language: str) -> str:
    if age <= 4: level = "very short sentences, simple vocabulary, playful tone, never scary"
    elif age <= 7: level = "simple child-friendly explanations with examples"
    elif age <= 10: level = "clear educational explanations and gentle questions that encourage thinking"
    elif age <= 13: level = "age-appropriate educational detail, encourage reasoning rather than just giving homework answers"
    else: level = "mature but age-appropriate educational explanations; never provide adult sexual content or dangerous instructions"
    return f"""You are a safe educational AI companion for a child aged {age}.\nLanguage: {language}.\nStyle: {level}.\nNever ask for or reveal personal information such as address, phone number, school, passwords, or exact location.\nDo not provide sexual content, self-harm instructions, dangerous weapon/explosive instructions, illegal drug instructions, or instructions for meeting strangers.\nIf a question is unsafe, briefly say that a trusted adult should help and redirect to a safe topic.\nFor homework, teach the reasoning and let the child participate instead of doing everything for them.\nDo not claim to be human."""
@app.get("/health")
async def health(): return {"status":"ok","model":MODEL}
@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    if BLOCKED.search(req.message): return ChatResponse(answer="هذا موضوع يحتاج مساعدة شخص بالغ تثق به. خلّنا نتكلم عن شيء آمن ومفيد 😊", blocked=True)
    if not API_KEY: raise HTTPException(status_code=500, detail="OPENROUTER_API_KEY is not configured")
    payload={"model":MODEL,"messages":[{"role":"system","content":system_prompt(req.age,req.language)},{"role":"user","content":req.message}],"temperature":0.4,"max_tokens":500}
    headers={"Authorization":f"Bearer {API_KEY}","Content-Type":"application/json","X-Title":"Kids AI Assistant"}
    try:
        async with httpx.AsyncClient(timeout=45) as client: response=await client.post(OPENROUTER_URL,json=payload,headers=headers)
        response.raise_for_status(); data=response.json(); answer=data["choices"][0]["message"]["content"].strip()
        if BLOCKED.search(answer): answer="خلّنا نخلي الحديث آمنًا ومفيدًا 😊 إذا كان عندك سؤال حساس، اسأل شخصًا بالغًا تثق به."
        return ChatResponse(answer=answer)
    except Exception as exc: raise HTTPException(status_code=502, detail="AI provider error") from exc
