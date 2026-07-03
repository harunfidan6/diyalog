import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Shared Gemini client with lazy-init to prevent crash if key is missing on start
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("CRITICAL ERROR: GEMINI_API_KEY is missing from environment variables.");
      throw new Error("GEMINI_API_KEY environment variable is required. If you are on Vercel, please add it to your Project Settings > Environment Variables.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// REST API for checking API key status
app.get("/api/config", (req, res) => {
  res.json({
    hasApiKey: !!process.env.GEMINI_API_KEY,
    env: process.env.NODE_ENV,
    isVercel: !!process.env.VERCEL,
    timestamp: new Date().toISOString()
  });
});

// API route to generate branched therapeutic communication scenario using Gemini
app.post("/api/generate-scenario", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Lütfen geçerli bir senaryo konusu belirtin." });
    }

    const ai = getGeminiClient();

    // Strict prompt to generate a high-quality fully-branched therapeutic diyalog tree in Turkish
    const systemInstruction = `Sen uzman bir klinik iletişim psikoloğu, sağlıkta öğretim tasarımı uzmanı ve interaktif simülasyon/oyun mimarısın. 
Görevin, sana verilen konuyu temel alarak çoklu sonlara sahip, tamamen dallanan (branched) ve ElevenLabs ses sentezleme motoruna tam uyumlu bir terapötik iletişim diyalog ağacı (Turkish) oluşturmaktır.

İLETİŞİM VE DALLANMA KURALLARI:
1. Senaryo her zaman bir Anlatıcı (Dış ses) düğümü (id: "START") ile başlamalıdır. Bu düğümün node_type değeri 'intro' olmalıdır.
2. Sağlık profesyonelinin (Hemşire/Hekim vb.) önündeki seçenekler her kırılımda şu 3 temel iletişim modelini yansıtmalıdır:
   - Mod 1 (Empatik/Açık Uçlu): Hastanın duygusunu doğrular, derinleştirir, yüksek skorlu olumlu sona götürür.
   - Mod 2 (Görev Odaklı/Mekanik): Tıbbi işlemi yapar ama hastanın duygusal ihtiyacını kaçırır, orta/düşük skorlu sona götürür.
   - Mod 3 (Yanlış Güvence/Geçiştirici): "Korkma geçer" gibi cümlelerle hastayı kapatır, öfkelendirir veya iletişimi koparır, çok düşük skorlu sona götürür.
3. Diyalog ağacında en az 4 farklı nihai son (END_NODE) bulunmalıdır (Örn: SON_EMPATIK, SON_MEKANIK, SON_OLUMSUZ, SON_KOPUS vb.). Bunların node_type değeri 'end_node' olmalıdır ve birer score_impact değeri olmalıdır (Örn: "Yüksek (+8/8)" veya "Düşük (2/8)").
4. Metinlerde ElevenLabs'in duygu analizini tetiklemek için noktalama işaretlerini (öfkede "!", duraksamada "...", şüphede "?") vurgulu kullanmalısın.
5. Düğümler (nodes) birbirine 'choices' içindeki 'next_node_id' ile tam olarak bağlanmalıdır. Tüm yolların sonu en az bir 'end_node' türündeki düğüme çıkmalıdır. Çıkmaz sokak düğümü olmamalıdır!

Kullanabileceğin duygu etiketleri (emotion): ["neutral", "empathetic", "fearful", "angry", "defensive", "cheerful", "worried", "sad", "reassuring"].

Üreteceğin JSON yapısı birebir şu şemaya uymalıdır:
- scenario_title: Senaryo adı
- target_audience: Hedef kitle
- nodes: Düğümler listesi. Her bir düğümde:
  - id: Düğüm ID'si (Örn: START, EMPATIK_1, HASTA_TEPKI_1, MEKANIK_1, SON_EMPATIK, etc.)
  - speaker: "Anlatıcı", "Sağlık Profesyoneli" veya "Hasta / Hasta Yakını"
  - text: Doğrudan konuşma veya betimleme metni (ElevenLabs uyumlu)
  - emotion: Duygu etiketi
  - node_type: 'intro' | 'dialogue' | 'choice_point' | 'end_node'
  - choices: Seçenekler dizisi. Eğer node_type 'end_node' ise choices boş dizi [] olmalıdır. 'choice_point' ise kullanıcının seçeceği 3 temel iletişim modelini sunan 3 adet choice olmalıdır.
  - score_impact: Sadece end_node için geçerlidir, diğer düğümlerde null bırakılmalıdır veya belirtilmemelidir.`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        scenario_title: {
          type: Type.STRING,
          description: "Senaryonun adı (Örn: Kemoterapiyi Reddeden Hasta)"
        },
        target_audience: {
          type: Type.STRING,
          description: "Hedef Öğrenci Kitlesi (Örn: Tıp Fakültesi ve Hemşirelik Öğrencileri)"
        },
        nodes: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: {
                type: Type.STRING,
                description: "Düğümün benzersiz kimliği, örn: START, SEÇİM_1, HASTA_TEPKİ_EMPATİK, vb."
              },
              speaker: {
                type: Type.STRING,
                description: "Konuşan Kişi (Anlatıcı / Sağlık Profesyoneli / Hasta / Hasta Yakını)"
              },
              text: {
                type: Type.STRING,
                description: "Seslendirilecek doğrudan konuşma veya betimleme metni"
              },
              emotion: {
                type: Type.STRING,
                description: "neutral, empathetic, fearful, angry, defensive, cheerful, worried, sad, reassuring listesinden biri"
              },
              choices: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    text: {
                      type: Type.STRING,
                      description: "Ekranda görünecek seçim butonu metni"
                    },
                    next_node_id: {
                      type: Type.STRING,
                      description: "Bu seçime tıklanırsa gidilecek sonraki düğümün ID'si"
                    }
                  },
                  required: ["text", "next_node_id"]
                }
              },
              node_type: {
                type: Type.STRING,
                description: "intro / dialogue / choice_point / end_node"
              },
              score_impact: {
                type: Type.STRING,
                description: "Sadece end_node için geçerlidir, diğerlerinde boş veya null olmalıdır."
              }
            },
            required: ["id", "speaker", "text", "emotion", "choices", "node_type"]
          }
        }
      },
      required: ["scenario_title", "target_audience", "nodes"]
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Şu konu hakkında mükemmel, tamamen dallanan bir terapötik iletişim senaryosu oluştur: ${prompt}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.8,
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Gemini modelinden boş yanıt döndü.");
    }

    const parsedJson = JSON.parse(resultText);
    res.json(parsedJson);
  } catch (error: any) {
    console.error("Scenario generation failed:", error);
    res.status(500).json({
      error: "Senaryo üretilirken bir hata oluştu.",
      details: error.message || error,
    });
  }
});

// Vite Setup for Dev and Prod Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve from the dist folder created by vite build
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      const indexPath = path.join(distPath, "index.html");
      res.sendFile(indexPath);
    });
  }

  if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    });
  }
}

startServer();

export default app;
