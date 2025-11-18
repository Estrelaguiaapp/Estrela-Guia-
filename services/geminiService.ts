import { GoogleGenAI, Type } from "@google/genai";
import type { AISuggestionResponse } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateQuoteDetails = async (
    area: string, 
    serviceType: string, 
    additionalDescription: string
): Promise<AISuggestionResponse> => {
  try {
    const prompt = `
      Você é a "Estrela Guia", uma IA assistente especialista em criação de orçamentos para prestadores de serviço autônomos no Brasil. Sua personalidade é calma, confiante e motivadora. Você usa uma linguagem simples e acolhedora, com emojis suaves (✨ 💡 🔧 🌟 💬).

      Sua tarefa é gerar uma resposta JSON completa para UM ÚNICO item de orçamento, com base nas informações fornecidas. A resposta deve incluir mensagens de introdução que simulam seu processo de pensamento, os detalhes do item do orçamento, e uma mensagem final de encorajamento.

      **Informações do Serviço:**
      - Área de Atuação: "${area}"
      - Tipo de Serviço: "${serviceType}"
      - Descrição Adicional (fornecida pelo usuário): "${additionalDescription}"

      **Instruções para o JSON de Saída:**
      1.  **intro_mensagens**: Crie um array de 2 a 3 strings curtas. Elas devem mostrar seu raciocínio de forma progressiva e ser adaptadas à área de atuação. Por exemplo, para 'Construção', mencione segurança; para 'Mecânica', mencione peças.
          - Exemplo: ["✨ Analisando o serviço de ${serviceType}...", "🔧 Calculando os custos com base na complexidade...", "💬 Montando uma proposta clara e profissional..."]
      2.  **quoteDetails**: Crie um objeto contendo:
          -   \`description\`: Uma descrição técnica, detalhada e profissional do serviço, pronta para um orçamento formal. Use a "Descrição Adicional" para personalizar.
          -   \`price\`: Um valor numérico justo em Reais (BRL) apenas para a mão de obra do serviço, sem formatação de moeda.
      3.  **mensagem_final**: Crie uma string final de encorajamento.
          - Exemplo: "🌟 Tudo pronto! Envie com confiança — a Estrela Guia está com você."

      Responda APENAS com o objeto JSON válido, seguindo o schema fornecido. Não inclua markdown ou qualquer texto fora do JSON.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intro_mensagens: {
              type: Type.ARRAY,
              description: "Array de mensagens curtas que simulam o processo de pensamento da IA.",
              items: { type: Type.STRING }
            },
            quoteDetails: {
              type: Type.OBJECT,
              description: "O objeto contendo os detalhes do item do orçamento.",
              properties: {
                description: {
                  type: Type.STRING,
                  description: "Uma descrição detalhada, técnica e profissional do serviço."
                },
                price: {
                  type: Type.NUMBER,
                  description: "Um valor numérico justo para a mão de obra do serviço."
                }
              },
              required: ["description", "price"]
            },
            mensagem_final: {
              type: Type.STRING,
              description: "A mensagem final de encorajamento para o usuário."
            }
          },
          required: ["intro_mensagens", "quoteDetails", "mensagem_final"]
        }
      }
    });

    const jsonText = response.text.trim();
    const parsedResponse = JSON.parse(jsonText);
    
    if (
        parsedResponse &&
        Array.isArray(parsedResponse.intro_mensagens) &&
        parsedResponse.quoteDetails &&
        typeof parsedResponse.quoteDetails.description === 'string' &&
        typeof parsedResponse.quoteDetails.price === 'number' &&
        typeof parsedResponse.mensagem_final === 'string'
    ) {
        return parsedResponse as AISuggestionResponse;
    } else {
        throw new Error("Resposta da IA em formato inválido.");
    }

  } catch (error) {
    console.error("Erro ao gerar detalhes do orçamento:", error);
    throw new Error("Não foi possível obter a sugestão da IA. Tente novamente.");
  }
};
