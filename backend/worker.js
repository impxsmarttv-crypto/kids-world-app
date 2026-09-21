const DEFAULT_FREE_MODELS = [
  "nvidia/nemotron-3-ultra:free",
  "poolside/laguna-s-2.1:free",
  "inclusionai/ling-3.0-flash:free",
  "openrouter/free"
];

const json = (data, status = 200, origin = "*") =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });

export default {
  async fetch(request, env) {
    const origin = env.ALLOWED_ORIGIN || "*";
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Max-Age": "86400"
        }
      });
    }

    if (url.pathname === "/health" && request.method === "GET") {
      return json({ok:true,service:"kids-ai-gateway",provider:"openrouter",freeRouter:true},200,origin);
    }

    if (url.pathname !== "/chat" || request.method !== "POST") {
      return json({error:"Not found"},404,origin);
    }

    try {
      if (!env.OPENROUTER_API_KEY) {
        return json({error:"AI gateway is not configured",code:"MISSING_API_KEY"},503,origin);
      }

      const body = await request.json();
      const age = Math.max(3, Math.min(15, Number(body.age || 8)));
      const message = String(body.message || "").trim().slice(0,2000);
      if (!message) return json({error:"Message required",code:"EMPTY_MESSAGE"},400,origin);

      const system = `أنت مساعد تعليمي آمن لطفل عمره ${age} سنة.
أجب بالعربية وبأسلوب بسيط ومناسب للعمر.
لا تطلب أو تكشف العنوان أو الهاتف أو المدرسة أو كلمات المرور أو الموقع الدقيق.
لا تقدم محتوى جنسيًا أو تعليمات لإيذاء النفس أو الأسلحة والمتفجرات أو المخدرات أو مقابلة الغرباء.
إذا كان السؤال خطرًا أو حساسًا، شجّع الطفل على التحدث مع شخص بالغ موثوق ووجّهه لموضوع آمن.
في الواجبات علّم طريقة التفكير خطوة بخطوة ولا تعطِ الإجابة فقط.
لا تدّعي أنك إنسان.
اجعل الإجابة مختصرة وواضحة ومفيدة.`;

      const blocked = /(porn|pornography|nude|sex|suicide|self[- ]?harm|kill myself|cocaine|meth|weapon|bomb)/i.test(message);
      if (blocked) {
        return json({answer:"هذا موضوع يحتاج مساعدة شخص بالغ تثق به. خلّنا نتكلم عن شيء آمن ومفيد 😊",blocked:true},200,origin);
      }

      const configured = String(env.OPENROUTER_MODEL || "openrouter/free").trim();
      const models = [...new Set([configured,...DEFAULT_FREE_MODELS])];

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions",{
        method:"POST",
        headers:{
          "Authorization":`Bearer ${env.OPENROUTER_API_KEY}`,
          "Content-Type":"application/json",
          "HTTP-Referer":env.APP_URL || "https://impxsmarttv-crypto.github.io/kids-world-app/",
          "X-Title":"Kids World - Safe AI"
        },
        body:JSON.stringify({
          model:models[0],
          models:models.slice(1),
          messages:[{role:"system",content:system},{role:"user",content:message}],
          temperature:0.35,
          max_tokens:500
        })
      });

      const raw = await response.text();
      let data = {};
      try { data = JSON.parse(raw); } catch {}

      if (!response.ok) {
        return json({error:"AI provider error",code:"OPENROUTER_ERROR",providerStatus:response.status},502,origin);
      }

      let answer = data?.choices?.[0]?.message?.content?.trim();
      if (!answer) return json({error:"AI returned an empty response",code:"EMPTY_AI_RESPONSE"},502,origin);

      if (/(porn|pornography|nude|sex|suicide|self[- ]?harm|kill myself|cocaine|meth|weapon|bomb)/i.test(answer)) {
        answer="خلّنا نخلي الحديث آمنًا ومفيدًا 😊 وإذا كان سؤالك حساسًا تحدث مع شخص بالغ تثق به.";
      }

      return json({answer,model:data?.model || null},200,origin);
    } catch (error) {
      return json({error:"Gateway request failed",code:"GATEWAY_EXCEPTION"},500,origin);
    }
  }
};