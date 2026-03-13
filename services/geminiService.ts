
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Language } from '../types';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
  });
};

export const generateProductImages = async (
    imageFile: File,
    concept: string,
    quality: string,
    customPrompt: string,
    language: Language,
    isObjectLocked: boolean
): Promise<string[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const base64Image = await fileToBase64(imageFile);
  const mimeType = imageFile.type;

  const angles = [
      { en: "front view", vi: "góc nhìn chính diện" },
      { en: "three-quarter view (45 degree angle)", vi: "góc nhìn 3/4 (chéo 45 độ)" },
      { en: "side view", vi: "góc nhìn ngang" },
      { en: "back view", vi: "góc nhìn từ phía sau" },
      { en: "top-down view", vi: "góc nhìn từ trên xuống" },
      { en: "creative close-up shot focusing on texture", vi: "góc chụp cận cảnh sáng tạo tập trung vào chất liệu" },
  ];

  if (isObjectLocked) {
    // High-fidelity path: Use image-to-image generation for object consistency.
    const imagePart = { inlineData: { mimeType, data: base64Image } };

    const imagePromises = angles.map(angle => {
        const promptLang = language === 'vi' ? 'vi' : 'en';
        const imageGenPrompt = `
          Take the primary product from the user-provided image and generate a new, ultra-realistic, professional product photograph.

          **Instructions:**
          1. **Product Fidelity:** The product in the new image MUST be IDENTICAL to the one in the reference image. Preserve all details: color, texture, shape, logos, and markings.
          2. **New Scene:** Place the product in a new scene based on this concept: "${concept}". ${customPrompt}.
          3. **New Camera Angle:** The new image must show the product from a "${angle[promptLang]}" perspective.
          4. **Image Quality:** The output should be of "${quality}" quality, with professional studio lighting suitable for e-commerce.
          5. **Output:** Provide only the final image. Do not include any text or commentary.
        `;
        const textPart = { text: imageGenPrompt };

        return ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
    });

    const imageResults = await Promise.all(imagePromises);
    const base64Images = imageResults.map(response => {
        const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
        return imagePart?.inlineData?.data || null;
    }).filter((img): img is string => img !== null);

    return base64Images;

  } else {
    // Creative path: Use description-to-image generation.
    const describePrompt = language === 'vi' 
      ? "Phân tích hình ảnh sản phẩm này và cung cấp một mô tả chi tiết, có cấu trúc. Tập trung vào mọi khía cạnh hình ảnh: màu sắc chính xác, kết cấu vật liệu, logo hoặc dấu hiệu thương hiệu, hình dạng, kiểu dáng và các tính năng độc đáo. Mô tả phải là một danh sách các thuộc tính thực tế để tái tạo sản phẩm trong một hình ảnh mới. Xuất ra ở định dạng JSON với các khóa bằng tiếng Anh."
      : "Analyze this product image and provide a highly detailed, structured description. Focus on every visual aspect: exact color, material texture, brand logos or markings, shape, form, and unique features. The description should be a factual list of attributes to be used for recreating the product in a new image. Output in JSON format with English keys.";

    const descriptionResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ inlineData: { mimeType, data: base64Image } }, { text: describePrompt }] },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              product_type: { type: Type.STRING },
              main_color: { type: Type.STRING },
              secondary_colors: { type: Type.ARRAY, items: { type: Type.STRING } },
              material: { type: Type.STRING },
              shape: { type: Type.STRING },
              brand_logo: { type: Type.STRING },
              features: { type: Type.ARRAY, items: { type: Type.STRING } },
            }
          }
        }
    });

    const productDescriptionJSON = descriptionResponse.text;

    const imagePromises = angles.map(angle => {
        const promptLang = language === 'vi' ? 'vi' : 'en';
        const imageGenPrompt = `
            Generate a single, ultra-realistic, professional product photograph for e-commerce.
            **Product Description (Strict Adherence Required):** ${productDescriptionJSON}.
            **DO NOT DEVIATE FROM THIS DESCRIPTION.** Every detail must be identical to the description.
            **Concept and Style:** ${concept}. ${customPrompt}.
            **Camera Angle:** ${angle[promptLang]}.
            **Quality:** ${quality}, commercial photography, studio lighting, hyper-detailed.
            The product must be the central focus. The background should be clean and perfectly match the chosen concept.
        `;

        return ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: imageGenPrompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
            },
        });
    });

    const imageResults = await Promise.all(imagePromises);
    const base64Images = imageResults.map(res => res.generatedImages[0].image.imageBytes);
    return base64Images;
  }
};