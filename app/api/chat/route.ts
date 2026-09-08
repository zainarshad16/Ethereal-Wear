import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractFreeShippingThreshold, STANDARD_SHIPPING_FEE } from "@/lib/shippingUtils";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

// Comprehensive Text Normalizer & Typo Cleaner
function normalizeInput(text: string): string {
  let clean = text.toLowerCase().trim();

  // 1. Collapse 3+ repeated characters (e.g. khareeedna -> khareedna, soooo -> so, plzzz -> plz, pgggl -> pgl)
  clean = clean.replace(/(.)\1{2,}/g, "$1$1");

  // 2. Normalize common Roman Urdu single-letter & typo tokens
  const wordMap: Record<string, string> = {
    "e": "ye",
    "yh": "ye",
    "y": "ye",
    "sb": "sab",
    "sbhi": "sabhi",
    "mujy": "mujhe",
    "mjy": "mujhe",
    "mjhe": "mujhe",
    "mj": "mujhe",
    "mujh": "mujhe",
    "pgl": "pagal",
    "pagl": "pagal",
    "pagaal": "pagal",
    "khridna": "khareedna",
    "kharidna": "khareedna",
    "khreedna": "khareedna",
    "kharedna": "khareedna",
    "khareeedna": "khareedna",
    "kharednaa": "khareedna",
    "chye": "chahiye",
    "chahye": "chahiye",
    "chaye": "chahiye",
    "chaiye": "chahiye",
    "chaheye": "chahiye",
    "btaye": "batao",
    "btaen": "batao",
    "btao": "batao",
    "btain": "batao",
    "bataen": "batao",
    "batayein": "batao",
    "delvry": "delivery",
    "delivry": "delivery",
    "delvery": "delivery",
    "dlvry": "delivery",
    "chrgs": "charges",
    "chrg": "charges",
    "chargis": "charges",
    "wtsap": "whatsapp",
    "watsap": "whatsapp",
    "whastapp": "whatsapp",
    "wtsp": "whatsapp",
    "whatapp": "whatsapp",
    "trck": "track",
    "trak": "track",
    "traking": "track",
    "pesy": "paise",
    "pese": "paise",
    "rupy": "rupaye",
    "bkwas": "bakwas",
    "bwqoof": "bewaqoof",
    "mngwana": "mangwana",
    "mgwana": "mangwana",
    "mngwao": "mangwao",
    "ktna": "kitna",
    "ktne": "kitne",
    "ktnay": "kitnay",
    "kyn": "kyun",
    "kyu": "kyun",
    "kia": "kya",
  };

  const words = clean.split(/\s+/);
  const normalizedWords = words.map((w) => wordMap[w] || w);
  return normalizedWords.join(" ");
}

// Comprehensive Roman Urdu and Urdu detection
function detectLanguage(text: string): "urdu_script" | "roman_urdu" | "english" {
  // Check for Arabic/Urdu script Unicode range
  if (/[\u0600-\u06FF]/.test(text)) {
    return "urdu_script";
  }

  // Comprehensive dictionary of Pakistani Roman Urdu words and slang
  const romanUrduPatterns = [
    // Pronouns & Demonstratives
    /\b(ye|yeh|yh|yehi|wo|woh|wohi|sb|sab|sabhi|mera|meri|mere|meray|ap|aap|apka|apki|apke|aapka|aapki|aapke|hum|hm|hmary|hamara|hamari|hamare|tum|tm|tumhara|tumhari|tumhare|mujy|mujhe|mjhe|mjy|mujh|mj|tujhe|tujhy|kisi|koi|kuch|kch|sub|ik|ek|aik|dono|sbko|isko|usko|inhe|unhe|tu|tera|teri|tere)\b/i,
    // Verbs, Actions & Auxiliaries
    /\b(khareedna|kharidna|khareedne|kharidne|khareed|kharid|lena|lene|leni|mangwana|mangwani|mangwane|mangwao|mangwaen|mangwado|bhejo|bhejna|bhej|bhejdein|bhejye|bhejein|karo|kro|karein|karen|krna|karna|krne|karne|kr|kar|ja|rhy|rahe|rahi|rha|rhay|rhey|rhi|h|hai|hain|hn|he|tha|thi|the|thay|hoga|hogi|honge|dekhna|dekho|dikhaye|dikhao|dikhaen|dikhana|batao|bataen|btaen|btao|batayein|bataye|btain|chahiye|chahye|chaye|chaiye|chaheye|milay|milega|milengi|milenge|milta|milti|mil|gaya|gye|gayi|gae|bol|bolna|samjh|smjh|samajh|suno|sun|chup)\b/i,
    // Question & Common conversation words
    /\b(kya|kia|kyun|kyu|kyn|kese|kaise|kesay|kaisay|jesa|jaisa|jese|jaise|kahan|khan|kidhar|kdhr|kab|kitna|kitnay|kitne|kitni|ktna|ktnay|pesay|paise|paisa|rupay|rupaye|salam|assalam|aoa|walaikum|wsalam|shukriya|shukria|theek|thik|thk|sahi|acha|achi|achay|bohot|boht|bht|zyada|ziada|kam|aur|or|lekin|magar|agr|agar|warna|bhai|bhaiya|jani|rabta|kapray|kaprey|kurti|jora|suit|mangwana|khareed|pasand|sasta|sasti|mehnga|mehngi|matlab|mtlb|wajah|waja|isliye|esliye|pagal|pgl|bakwas|chawal|dimagh|dimag|kharab|bewaqoof|bwqoof|fuzool|fazool|musibat)\b/i,
    // Short words and connectives
    /\b(ka|ki|ke|k|ko|se|sy|me|mein|men|mn|pe|par|pr|tak|bhi|b|hi)\b/i,
  ];

  let matches = 0;
  for (const pattern of romanUrduPatterns) {
    if (pattern.test(text)) {
      matches++;
    }
  }

  // If matched 1 or more characteristic patterns
  if (matches >= 1) {
    return "roman_urdu";
  }

  return "english";
}

export async function POST(req: Request) {
  try {
    const { message, history = [] }: { message: string; history: ChatMessage[] } = await req.json();

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const rawMsg = message.trim();
    const normalized = normalizeInput(rawMsg);
    const lang = detectLanguage(rawMsg + " " + normalized);

    // 1. Fetch live database context safely (100% Dynamic, nothing hardcoded)
    let products: any[] = [];
    let storeSettings: any = null;

    try {
      [products, storeSettings] = await Promise.all([
        prisma.product.findMany({
          take: 30,
          orderBy: { orderIndex: "asc" },
          select: {
            id: true,
            name: true,
            price: true,
            description: true,
            category: true,
            imageUrl: true,
            stock: true,
            isOnSale: true,
            salePercentage: true,
          },
        }),
        prisma.storeSettings.findUnique({
          where: { id: "global" },
        }),
      ]);
    } catch (dbErr) {
      console.error("CHAT_DB_FETCH_ERROR:", dbErr);
    }

    const freeThreshold = extractFreeShippingThreshold(storeSettings?.topBannerText || "FREE SHIPPING ON ALL ORDERS OVER $100");
    const shippingFee = storeSettings?.shippingFee !== undefined && storeSettings?.shippingFee !== null
      ? Number(storeSettings.shippingFee)
      : STANDARD_SHIPPING_FEE;
    const whatsappNum = (storeSettings as any)?.whatsappNumber || "923001234567";

    // 2. Check if user is asking to track an order (e.g. #ABC123, "order 123456", "track cly...")
    const orderCodeMatch = rawMsg.match(/#([a-zA-Z0-9]{4,30})/) ||
      rawMsg.match(/(?:order|track|tracking|parcel|code|id|آرڈر|ٹریک)\s*(?:is|#|:|-)?\s*([a-zA-Z0-9]{4,30})/i);
    let matchedOrder: any = null;

    if (orderCodeMatch) {
      const code = orderCodeMatch[1].toLowerCase();
      try {
        const foundOrders = await prisma.order.findMany({
          take: 10,
          include: {
            items: {
              include: { product: true },
            },
          },
          orderBy: { createdAt: "desc" },
        });

        matchedOrder = foundOrders.find((o) =>
          o.id.toLowerCase().endsWith(code) || o.id.toLowerCase() === code
        );
      } catch (e) {
        console.error("ORDER_LOOKUP_ERROR:", e);
      }
    }

    // 3. Check for external AI API key (OpenAI or Gemini)
    const openaiKey = process.env.OPENAI_API_KEY;

    if (openaiKey) {
      try {
        const systemPrompt = `You are the Haute Couture Virtual Concierge for Ethereal Wear, a high-end luxury fashion atelier in Pakistan.
IMPORTANT LANGUAGE & TONE RULES:
- If the user writes in Urdu script (اردو), reply ONLY in elegant, natural Urdu script.
- If the user writes in Roman Urdu (e.g., 'mujy e sb khareedna h', 'tu pgl h kia', 'kya delivery charges hain'), reply ONLY in conversational, witty, respectful Roman Urdu. Talk like a friendly human stylist!
- If the user is teasing or frustrated ('tu pgl h kia', 'bakwas'), laugh it off with good humor and ask how you can genuinely help.
- If the user writes in English, reply ONLY in English. Never mix languages or repeat the same text in multiple languages.

Live Store Knowledge:
- Available Catalog: ${JSON.stringify(
          products.map((p) => ({
            id: p.id,
            name: p.name,
            price: `Rs. ${p.price}`,
            category: p.category,
            stock: p.stock > 0 ? "In Stock" : "Sold Out",
            onSale: p.isOnSale ? `${p.salePercentage}% OFF` : "Regular",
          }))
        )}
- Shipping Policy: Standard Shipping is Rs. ${shippingFee}. Orders of Rs. ${freeThreshold.toLocaleString()} or above receive FREE EXPRESS SHIPPING nationwide.
- Payment Method: Cash on Delivery (COD) across Pakistan. Direct Bank & WhatsApp assistance available.
- WhatsApp Concierge: +${whatsappNum}
- Order Tracking: Customers can track via /track-order with their 6-digit Order ID.
${matchedOrder ? `- Order Lookup Found: Order #${matchedOrder.id.slice(-6).toUpperCase()} is currently ${matchedOrder.status}, total Rs. ${matchedOrder.total.toFixed(2)}.` : ""}`;

        const messagesPayload: any[] = [
          { role: "system", content: systemPrompt },
          ...history.slice(-6),
          { role: "user", content: rawMsg },
        ];

        const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: messagesPayload,
            temperature: 0.7,
            max_tokens: 350,
          }),
        });

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          const reply = aiData.choices?.[0]?.message?.content;
          if (reply) {
            const suggested = products
              .filter((p) => reply.toLowerCase().includes(p.name.toLowerCase()))
              .slice(0, 3);

            return NextResponse.json({
              reply,
              suggestedProducts: suggested,
              language: lang,
            });
          }
        }
      } catch (err) {
        console.error("AI_API_FALLBACK_TRIGGERED:", err);
      }
    }

    // 4. Intelligent Dynamic Catalog & Human Conversational Engine (with Typo Normalization)
    let responseText = "";
    let suggestedProducts: any[] = [];
    const searchTarget = (rawMsg + " " + normalized).toLowerCase();

    // Intent 1: Specific Order Tracking Match with Order Code
    if (matchedOrder) {
      const orderRef = `#${matchedOrder.id.slice(-6).toUpperCase()}`;
      const itemsList = matchedOrder.items.map((i: any) => `${i.product.name} (x${i.quantity})`).join(", ");

      if (lang === "urdu_script") {
        responseText = `ہمیں آپ کا آرڈر **${orderRef}** مل گیا ہے۔\n\n🔹 **حالت:** ${matchedOrder.status}\n🔹 **کل رقم:** Rs. ${matchedOrder.total.toFixed(2)}\n🔹 **آئٹمز:** ${itemsList}\n\nہمارا رائڈر جلد آپ کے ایڈریس پر کیش آن ڈیلیوری کے ساتھ پہنچے گا۔ مزید تفصیلات کے لیے آپ [Track Order](/track-order?track=${orderRef.replace("#", "")}) دیکھ سکتے ہیں۔`;
      } else if (lang === "roman_urdu") {
        responseText = `Aapka order **${orderRef}** mil gaya hai!\n\n🔹 **Status:** ${matchedOrder.status}\n🔹 **Total Amount:** Rs. ${matchedOrder.total.toFixed(2)}\n🔹 **Items:** ${itemsList}\n\nAapka parcel jald Cash on Delivery par deliver ho jaye ga. Mazeed details ke liye aap [Track Order](/track-order?track=${orderRef.replace("#", "")}) page check kar sakte hain.`;
      } else {
        responseText = `We found your order **${orderRef}**!\n\n🔹 **Current Status:** ${matchedOrder.status}\n🔹 **Total Amount:** Rs. ${matchedOrder.total.toFixed(2)}\n🔹 **Items:** ${itemsList}\n\nYou can track live milestones on our [Order Tracker](/track-order?track=${orderRef.replace("#", "")}).`;
      }
    }
    // Intent 2A: Service Complaints / Dissatisfaction ("bakwas service", "kharab service", "masla hai")
    else if (/bakwas service|kharab service|late service|ghalat|shikayat|complain|fraud|cheat|dhoka|فراڈ|شکایت|خراب سروس/i.test(searchTarget)) {
      if (lang === "urdu_script") {
        responseText = `ہم آپ کے ناخوشگوار تجربے پر تہہ دل سے معذرت خواہ ہیں! 😔 ہم اپنے کسٹمرز کے اطمینان کو سب سے اہم سمجھتے ہیں۔\n\nبراہ کرم اپنا آرڈر نمبر یا مسئلہ بتائیں، یا براہِ راست ہمارے [WhatsApp Support](https://wa.me/${whatsappNum}?text=Hello%20Ethereal%20Wear) پر رابطہ کریں تاکہ ہم فوری حل پیش کر سکیں۔`;
      } else if (lang === "roman_urdu") {
        responseText = `Hum aapke experience par dil se maazrat chahte hain! 😔 Ethereal Wear quality aur customer satisfaction ko bohot serious leta hai.\n\nBarah-e-karam apna issue ya Order ID share karein, ya direct hamare [WhatsApp Support](https://wa.me/${whatsappNum}?text=Hello%20Ethereal%20Wear) par rabta karein taake hamari team fori masla hal kar sake!`;
      } else {
        responseText = `We sincerely apologize for any inconvenience caused! 😔 Customer satisfaction is our utmost priority.\n\nPlease share your Order ID or issue details, or contact our support team directly via [WhatsApp](https://wa.me/${whatsappNum}?text=Hello%20Ethereal%20Wear) so we can resolve this immediately.`;
      }
    }
    // Intent 2B: Casual Banter, Teasing, Slang, & Humor ("tu pgl h kia", "pagal", "chup kar", "dimagh kharab", etc.)
    else if (/pagal|pgl|dimagh|dimag|bakwas|bkwas|chup|shut up|stupid|idiot|bewaqoof|bwqoof|chawal|loser|kutta|kutti|jahil|badtameez|are you mad|are you crazy|nonsense|useless|fazool|fuzool|hosh kar|kya musibat|tameez|پاگل|بکواس|احمق|فضول/i.test(searchTarget)) {
      if (lang === "urdu_script") {
        responseText = `ارے نہیں جناب، پاگل بالکل نہیں ہوں! 😄 میں آپ کا ورچوئل فیشن کونسئیرج ہوں۔ اگر مجھ سے کوئی غلطی ہوئی ہو تو معذرت!\n\nبتائیں آپ کو کس چیز میں مدد چاہیے (لباس، سائز، کیش آن ڈیلیوری یا واٹس ایپ رابطہ)؟ میں فوری درست رہنمائی کرتا ہوں۔`;
      } else if (lang === "roman_urdu") {
        responseText = `Haha arrey nahi yaar, pagal nahi hoon! 😄 Bas thoda digital assistant hoon aur aapki help karne ki koshish kar raha hoon. Ghussa mat hon!\n\nAap seedha batayein kya masla hai? Agar koi dress order karni hai, size maloom karna hai ya direct hamare [WhatsApp](https://wa.me/${whatsappNum}?text=Hello%20Ethereal%20Wear) par human agent se baat karni hai, main foran help karta hoon!`;
      } else {
        responseText = `Haha, definitely not crazy! 😄 Just an AI concierge doing my best to give you a smooth experience. No hard feelings at all—tell me what you need assistance with, or chat with our human stylists directly on WhatsApp!`;
      }
    }
    // Intent 3: Conversational Feedback / Bot Repetitive complaints ("ik hi jesa kyu reply kr rhy")
    else if (/ik hi jesa|aik jesa|ek jesa|same reply|bar bar|kyu reply|kyun reply|repeat|robot|bot ho|insan|samajh nahi|smjh ni|kya bol|reply do|ایک جیسا|بار بار|کیوں ریپلائی|سمجھ نہیں/i.test(searchTarget)) {
      suggestedProducts = products.slice(0, 3);
      if (lang === "urdu_script") {
        responseText = `معذرت چاہتے ہیں اگر آپ کو جواب یکساں محسوس ہوا! ✨ میں آپ کی مخصوص اور درست رہنمائی کے لیے حاضر ہوں۔\n\nآپ مجھ سے براہِ راست پوچھ سکتے ہیں:\n🔹 کسی خاص لباس، سائز یا قیمت کے بارے میں\n🔹 کیش آن ڈیلیوری اور مفت شپنگ کے اصول\n🔹 اپنے آرڈر کو ٹریک کرنے کا طریقہ\n🔹 یا ہمارے واٹس ایپ [WhatsApp Support](https://wa.me/${whatsappNum}?text=Hello%20Ethereal%20Wear) پر نمائندے سے بات چیت\n\nآپ کیا جاننا چاہتے ہیں؟ بتائیے میں فوری مدد کروں گا!`;
      } else if (lang === "roman_urdu") {
        responseText = `Maazrat chahte hain agar aapko response repetitive laga! ✨ Main aapki specific requirements ke mutabiq behtar guide karne ke liye hazir hoon.\n\nAap mujhse poochna chahein toh batayein:\n🔹 Kisi specific dress, fabric ya price ki detail\n🔹 Cash on Delivery aur shipping time\n🔹 Apna parcel track karne ka tariqa\n🔹 Ya direct hamare [WhatsApp Support](https://wa.me/${whatsappNum}?text=Hello%20Ethereal%20Wear) par human agent se rabta\n\nAapko kis cheez mein help chahiye?`;
      } else {
        responseText = `My apologies if the responses felt repetitive! ✨ I am here to assist you with specific, tailored guidance.\n\nPlease let me know what you need help with:\n🔹 Details on specific dress cuts, sizing, or prices\n🔹 Nationwide Cash on Delivery & Free Shipping thresholds\n🔹 Order tracking & status\n🔹 Direct stylist assistance via [WhatsApp](https://wa.me/${whatsappNum}?text=Hello%20Ethereal%20Wear)\n\nHow can I best assist you right now?`;
      }
    }
    // Intent 4: Order tracking requested with unmatched code or general tracking query
    else if (orderCodeMatch || /track|order status|order kahan|parcel|کورس|ٹریک|آرڈر کہاں|اسٹیٹس|پارسل/i.test(searchTarget)) {
      const requestedCode = orderCodeMatch ? `#${orderCodeMatch[1].toUpperCase()}` : "";
      if (lang === "urdu_script") {
        responseText = requestedCode
          ? `ہمیں **${requestedCode}** کا آرڈر ریکارڈ میں نہیں ملا۔ براہ کرم تصدیقی ایس ایم ایس سے اپنا درست 6 ہندسوں کا آرڈر کوڈ چیک کریں یا ہمارے [Track Order](/track-order?track=${requestedCode.replace("#", "")}) پیج پر دیکھیں۔`
          : `اپنا آرڈر ٹریک کرنے کے لیے اپنا **6 ہندسوں کا آرڈر کوڈ** (مثلاً #ABC123) درج کریں، یا براہِ راست ہمارے [Track Order](/track-order) پیج پر دیکھیں۔`;
      } else if (lang === "roman_urdu") {
        responseText = requestedCode
          ? `Hamein **${requestedCode}** ka record nahi mila. Barah-e-karam apna 6 digits ka sahi Order ID check karein ya [Track Order](/track-order?track=${requestedCode.replace("#", "")}) page visit karein.`
          : `Apna order track karne ke liye apna **6 digits ka Order ID** (jaise #ABC123) yahan enter karein ya hamara [Track Order](/track-order) page visit karein.`;
      } else {
        responseText = requestedCode
          ? `We could not find an active order with ID **${requestedCode}**. Please verify the 6-digit reference from your confirmation message, or search directly on our [Order Tracker](/track-order?track=${requestedCode.replace("#", "")}).`
          : `To track your shipment, please provide your **6-digit Order ID** (e.g. #ABC123) or visit our dedicated [Track Order](/track-order) page.`;
      }
    }
    // Intent 5: How to Buy / Purchase / Order Intent (e.g. "mujy e sb khareedna h", "order kaise karein", "how to buy")
    else if (/khareedna|kharidna|khareedne|kharidne|lena|lene|mangwana|mangwani|mangwao|buy|purchase|order karna|order kais|kaise khareed|kese buy|ye lena|ye chahiye|send karo|pack karo|order book|خریدنا|لینا|منگوانا|آرڈر کیسے|خریدیں|آرڈر کریں/i.test(searchTarget)) {
      suggestedProducts = products.slice(0, 3);
      if (lang === "urdu_script") {
        responseText = `ایتھریل وئیر پر آرڈر دینا بہت آسان ہے! 🛍️\n\n1. جو بھی پراڈکٹ آپ کو پسند ہو اس پر کلک کریں اور **"Add to Cart"** یا **"Buy Now"** دبائیں۔\n2. اپنا نام، موبائل نمبر اور ایڈریس درج کریں۔\n3. **Cash on Delivery (COD)** منتخب کر کے آرڈر مکمل کریں۔\n\nآپ ہمارے [WhatsApp](https://wa.me/${whatsappNum}?text=Hello%20Ethereal%20Wear) پر بھی براہِ راست آرڈر بک کروا سکتے ہیں!`;
      } else if (lang === "roman_urdu") {
        responseText = `Ethereal Wear par order karna bohat aasan hai! 🛍️\n\n1. Jo bhi dress aapko pasand ho, us par click karein aur **"Add to Cart"** ya **"Buy Now"** button dabayein.\n2. Checkout par apna Delivery Address aur Mobile Number enter karein.\n3. **Cash on Delivery (COD)** select karke apna order confirm karein.\n\nAap chahein toh direct hamare [WhatsApp](https://wa.me/${whatsappNum}?text=Hello%20Ethereal%20Wear) par bhi message karke fori order place kar sakte hain!`;
      } else {
        responseText = `Placing an order with Ethereal Wear is quick and seamless! 🛍️\n\n1. Click on any item below, choose your size, and tap **"Add to Cart"** or **"Buy Now"**.\n2. Enter your delivery address and contact information at checkout.\n3. Select **Cash on Delivery (COD)** to confirm your order.\n\nYou can also order directly via our concierge on [WhatsApp](https://wa.me/${whatsappNum}?text=Hello%20Ethereal%20Wear)!`;
      }
    }
    // Intent 6: Specific Pricing, Rates, or Sale Questions
    else if (/price|prices|kitne ka|kitnay ka|rate|rates|cost|keemat|qemat|sasta|sasti|mehnga|mehngi|discount|sale|off|percentage|قیمت|کتنے کا|سیل|ڈسکاؤنٹ/i.test(searchTarget)) {
      const saleProducts = products.filter((p) => p.isOnSale);
      suggestedProducts = (saleProducts.length > 0 ? saleProducts : products).slice(0, 3);

      if (lang === "urdu_script") {
        responseText = `ہماری کلیکشن کے تمام ڈیزائنز کی قیمتیں براہِ راست درج ذیل کارڈز میں دیکھی جا سکتی ہیں:\n\n✨ سیل آئٹمز پر خصوصی رعایت دستیاب ہے۔ پورے پاکستان میں **کیش آن ڈیلیوری** کے ساتھ فوری ڈسپیچ فراہم کی جاتی ہے۔`;
      } else if (lang === "roman_urdu") {
        responseText = `Hamari collection ke tamam dresses ki live prices neeche cards mein mojood hain:\n\n✨ Jo items Sale par hain un par special discount active hai. Aap Cash on Delivery par order kar sakte hain.`;
      } else {
        responseText = `All live catalog prices and active discounts are shown on the piece cards below:\n\n✨ We offer complimentary express delivery across Pakistan on qualifying orders.`;
      }
    }
    // Intent 7: Greetings / Salam / Inquiries (strictly standalone or starting with greetings)
    else if (/^(salam|assalam|aoa|walaikum|hello|hey|good morning|good evening|kese ho|kaise ho|kia hal|kya hal|سلام|وعلیکم|کیسے ہو|کیا حال)(\s|$|!|\?|\.)/i.test(normalized) || /^(hi)(\s|$|!|\?|\.)/i.test(normalized)) {
      suggestedProducts = products.slice(0, 3);
      if (lang === "urdu_script") {
        responseText = `وعلیکم السلام! ایتھریل وئیر میں خوش آمدید ✨\n\nمیں آپ کی کیا مدد کر سکتا ہوں؟ آپ نئی کلیکشن، ڈیلیوری چارجز، یا آرڈر ٹریکنگ کے بارے میں پوچھ سکتے ہیں۔`;
      } else if (lang === "roman_urdu") {
        responseText = `Walaikum Assalam! Ethereal Wear mein khushamdeed ✨\n\nMain aapki kya madad kar sakta hoon? Aap hamari latest collection dekh sakte hain, delivery charges maloom kar sakte hain, ya apna order track kar sakte hain.`;
      } else {
        responseText = `Hello and welcome to Ethereal Wear Atelier ✨\n\nHow may I assist you today? Feel free to explore our signature collections, check delivery details, or track your pending orders.`;
      }
    }
    // Intent 8: Delivery / Shipping / COD / Charges / Timeline Inquiries
    else if (/shipping|delivery|charges|cost|free|cod|cash on delivery|pesay|kitnay|deliver|kharcha|kitne din|kitnay din|kab tak|kab milega|kab aye|lahore|karachi|islamabad|rawalpindi|faisalabad|multan|peshawar|quetta|sialkot|gujranwala|ڈیلیوری|شپنگ|مفت|چارجز|خرچہ|پیسے|سی او ڈی|کتنے دن|کب ملے گا|لاہور|کراچی|اسلام آباد/i.test(searchTarget)) {
      if (lang === "urdu_script") {
        responseText = `ایتھریل وئیر پر پورے پاکستان (بشمول لاہور، کراچی، اسلام آباد) میں **کیش آن ڈیلیوری (Cash on Delivery)** دستیاب ہے۔\n\n📦 **ڈیلیوری چارجز:** Rs. ${shippingFee.toFixed(0)}\n✨ **مفت ڈیلیوری:** Rs. ${freeThreshold.toLocaleString()} یا اس سے زائد کے تمام آرڈرز پر بالکل مفت ایکسپریس شپنگ فراہم کی جاتی ہے!\n⏱ **ڈیلیوری کا وقت:** 2 سے 4 کاروباری دن۔`;
      } else if (lang === "roman_urdu") {
        responseText = `Ethereal Wear par pooray Pakistan (Lahore, Karachi, Islamabad wagera) mein **Cash on Delivery (COD)** available hai!\n\n📦 **Delivery Charges:** Rs. ${shippingFee.toFixed(0)}\n✨ **Free Delivery:** Rs. ${freeThreshold.toLocaleString()} ya us se zyada ke order par FREE Express Shipping hai.\n⏱ **Delivery Time:** 2 se 4 working days mein parcel safely deliver ho jata hai.`;
      } else {
        responseText = `We offer nationwide **Cash on Delivery (COD)** across all cities in Pakistan!\n\n📦 **Standard Delivery Fee:** Rs. ${shippingFee.toFixed(0)}\n✨ **Free Shipping:** Complimentary on all orders over **Rs. ${freeThreshold.toLocaleString()}**.\n⏱ **Delivery Window:** 2–4 business days with full transit insurance.`;
      }
    }
    // Intent 9: WhatsApp / Direct Contact Support
    else if (/whatsapp|contact|phone|number|rabta|call|email|help|madad|واٹس ایپ|رابطہ|نمبر|فون|مدد/i.test(searchTarget)) {
      if (lang === "urdu_script") {
        responseText = `آپ ہمارے واٹس ایپ کونسئیرج سے براہِ راست رابطہ کر سکتے ہیں:\n\n📱 **واٹس ایپ:** [0${whatsappNum.slice(-10)}](https://wa.me/${whatsappNum}?text=Hello%20Ethereal%20Wear)\n📧 **ای میل:** support@etherealwear.com\n\nہمیں آپ کی خدمت کر کے خوشی ہوگی!`;
      } else if (lang === "roman_urdu") {
        responseText = `Aap hamari team se WhatsApp par direct rabta kar sakte hain:\n\n📱 **WhatsApp:** [Click to Chat on WhatsApp](https://wa.me/${whatsappNum}?text=Hello%20Ethereal%20Wear)\n📧 **Email:** support@etherealwear.com\n\nKoi bhi help chahiye ho toh zaroor batayein!`;
      } else {
        responseText = `You can connect directly with our Atelier Concierge on WhatsApp:\n\n📱 **WhatsApp:** [Chat with Us on WhatsApp](https://wa.me/${whatsappNum}?text=Hello%20Ethereal%20Wear)\n📧 **Email:** support@etherealwear.com\n\nOur team is available to assist you with styling, custom sizing, and order queries.`;
      }
    }
    // Intent 10: Return / Exchange / Sizing Policy
    else if (/return|exchange|size|fit|badalna|wapas|size guide|size chart|واپسی|سائز|ایکسچینج|تبدیل|ریٹرن/i.test(searchTarget)) {
      if (lang === "urdu_script") {
        responseText = `✨ **سائز اور واپسی کی پالیسی:**\n\n- ہماری تمام کلیکشنز میں معیاری سائزز (XS سے XL) دستیاب ہیں۔\n- ہم **3 دن کی آسان واپسی اور ایکسچینج (3-Day Returns)** کی سہولت فراہم کرتے ہیں۔\n- مناسب سائز کے انتخاب کے لیے ہر پراڈکٹ پیج پر سائز چارٹ دیکھیں۔`;
      } else if (lang === "roman_urdu") {
        responseText = `✨ **Size aur Return Policy:**\n\n- Hamari tamam collection standard sizes (XS se XL) mein available hai.\n- Agar koi size masla ho toh **3 Days Hassle-Free Exchange & Return** policy available hai.\n- Har product page par detailed size measurements mojood hain.`;
      } else {
        responseText = `✨ **Sizing & Returns Policy:**\n\n- All garments fit true to size with tailored proportions (XS to XL).\n- We offer a **3-Day Hassle-Free Return & Exchange** guarantee on all unworn items.\n- Detailed sizing measurements are available on each product page.`;
      }
    }
    // Intent 11: Dynamic General / Conversational Variety Fallback
    else {
      const searchTerms = normalized.split(/\s+/);
      const matched = products.filter((p) => {
        const text = `${p.name} ${p.category || ""} ${p.description || ""}`.toLowerCase();
        return searchTerms.some((term) => term.length >= 3 && text.includes(term));
      });

      suggestedProducts = (matched.length > 0 ? matched : products).slice(0, 3);

      if (lang === "urdu_script") {
        responseText = `ایتھریل وئیر کے شاندار مجموعے میں سے چند منتخب ڈیزائنز درج ذیل ہیں۔ آپ کسی بھی پراڈکٹ کو دیکھنے یا خریدنے کے لیے کلک کر سکتے ہیں۔ پورے پاکستان میں کیش آن ڈیلیوری دستیاب ہے۔`;
      } else if (lang === "roman_urdu") {
        responseText = `Ethereal Wear par aapka swagat hai! ✨ Neeche hamari latest collection ke signature pieces mojood hain. Aap kisi bhi dress par click karke Cash on Delivery par order kar sakte hain ya direct WhatsApp par rabta kar sakte hain.`;
      } else {
        responseText = `Welcome to Ethereal Wear Atelier. Here are some of our handcrafted signature pieces tailored for you:\n\nAll items are available for express dispatch with nationwide Cash on Delivery.`;
      }
    }

    return NextResponse.json({
      reply: responseText,
      suggestedProducts: suggestedProducts.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        imageUrl: p.imageUrl,
        category: p.category,
      })),
      language: lang,
    });
  } catch (error: any) {
    console.error("CHATBOT_ROUTE_ERROR:", error);
    return NextResponse.json(
      { error: error?.message || "Unknown error", details: String(error) },
      { status: 500 }
    );
  }
}
