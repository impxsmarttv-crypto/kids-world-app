# نشر بوابة الذكاء الآمنة

هذه البوابة هي الطريقة الصحيحة لاستخدام OpenRouter مع GitHub Pages بدون كشف المفتاح.

## Cloudflare Worker
1. أنشئ Worker جديدًا في Cloudflare.
2. ارفع محتوى `worker.js`.
3. أضف Secret باسم `OPENROUTER_API_KEY`.
4. أضف المتغيرات الموجودة في `wrangler.toml`.
5. احصل على رابط Worker مثل:
   `https://kids-ai-gateway.<account>.workers.dev`
6. ضع الرابط في الصفحة في المتغير `API_BASE_URL`.

لا تضع OPENROUTER_API_KEY في GitHub أو داخل index.html.

## الصوت
- الميكروفون يعمل عبر Web Speech API في المتصفحات الداعمة، خصوصًا Chrome على Android.
- الإجابات تُقرأ عبر SpeechSynthesis.
- يجب فتح الصفحة عبر HTTPS (GitHub Pages يحقق ذلك).
