export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Content-Type": "application/json; charset=utf-8"
    };
    if (request.method === "OPTIONS") return new Response(null,{headers:cors});
    const url = new URL(request.url);
    if (url.pathname === "/health") return new Response(JSON.stringify({ok:true}),{headers:cors});
    if (url.pathname !== "/chat" || request.method !== "POST")
      return new Response(JSON.stringify({error:"Not found"}),{status:404,headers:cors});

    try {
      const body = await request.json();
      const age = Math.max(2, Math.min(16, Number(body.age || 8)));
      const message = String(body.message || "").trim().slice(0,2000);
      if (!message) return new Response(JSON.stringify({error:"Message required"}),{status:400,headers:cors});

      const system = `أنت مساعد تعليمي آمن لطفل عمره ${age} سنة. أجب بالعربية وبأسلوب مناسب للعمر. لا تطلب أو تكشف العنوان أو الهاتف أو المدرسة أو كلمات المرور أو الموقع الدقيق. لا تقدم محتوى جنسيًا، أو تعليمات لإيذاء النفس، أو الأسلحة والمتفجرات، أو المخدرات، أو مقابلة الغرباء. إذا كان السؤال خطرًا أو حساسًا، قل للطفل أن يتحدث مع شخص بالغ موثوق ثم وجّهه لموضوع آمن. في الواجبات علّم طريقة التفكير ولا تعطِ الإجابة فقط. لا تدّعي أنك إنسان.`;

      const blocked = /(porn|pornography|nude|sex|suicide|self[- ]?harm|kill myself|cocaine|meth|weapon|bomb)/i.test(message);
      if (blocked) return new Response(JSON.stringify({answer:"هذا موضوع يحتاج مساعدة شخص بالغ تثق به. خلّنا نتكلم عن شيء آمن ومفيد 😊",blocked:true}),{headers:cors});

      const r = await fetch("https://openrouter.ai/api/v1/chat/completions",{
        method:"POST",
        headers:{
          "Authorization":`Bearer ${env.OPENROUTER_API_KEY}`,
          "Content-Type":"application/json",
          "HTTP-Referer":env.APP_URL || "https://impxsmarttv-crypto.github.io/kids-world-app/",
          "X-Title":"Kids AI Assistant"
        },
        body:JSON.stringify({
          model:env.OPENROUTER_MODEL || "openrouter/free",
          messages:[{role:"system",content:system},{role:"user",content:message}],
          temperature:0.35,max_tokens:500
        })
      });
      const data=await r.json();
      if(!r.ok) return new Response(JSON.stringify({error:"AI provider error"}),{status:502,headers:cors});
      let answer=data?.choices?.[0]?.message?.content?.trim() || "لم أستطع الإجابة الآن، حاول مرة أخرى 😊";
      if (/(porn|pornography|nude|sex|suicide|self[- ]?harm|kill myself|cocaine|meth|weapon|bomb)/i.test(answer))
        answer="خلّنا نخلي الحديث آمنًا ومفيدًا 😊 وإذا كان سؤالك حساسًا تحدث مع شخص بالغ تثق به.";
      return new Response(JSON.stringify({answer}),{headers:cors});
    } catch(e) {
      return new Response(JSON.stringify({error:"Invalid request"}),{status:400,headers:cors});
    }
  }
};