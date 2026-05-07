package documentassistant.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
@RequiredArgsConstructor
public class ChatService {

    private static final String GEMINI_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent";

    private static final String SYSTEM_PROMPT = """
        You are a helpful assistant for the Document Assistant app.
        This app allows users to upload a photo of their ID card, automatically extracts
        the information using OCR, and uses it to fill forms and documents.
        Users can submit document requests, track their status, and manage their profile.
        Answer questions about how the app works, guide users through features,
        and help them understand the document request process.
        Be concise, friendly, and helpful. Do not answer questions unrelated to the app.
        """;

    @Value("${GEMINI_API_KEY}")
    private String geminiApiKey;

    private final ObjectMapper objectMapper;

    public String chat(String userMessage) {
        try {
            ObjectNode body = objectMapper.createObjectNode();

            // System instruction
            ObjectNode systemInstruction = objectMapper.createObjectNode();
            ArrayNode systemParts = objectMapper.createArrayNode();
            ObjectNode systemPart = objectMapper.createObjectNode();
            systemPart.put("text", SYSTEM_PROMPT);
            systemParts.add(systemPart);
            systemInstruction.set("parts", systemParts);
            body.set("systemInstruction", systemInstruction);

            // User message
            ArrayNode contents = objectMapper.createArrayNode();
            ObjectNode userTurn = objectMapper.createObjectNode();
            userTurn.put("role", "user");
            ArrayNode userParts = objectMapper.createArrayNode();
            ObjectNode userPart = objectMapper.createObjectNode();
            userPart.put("text", userMessage);
            userParts.add(userPart);
            userTurn.set("parts", userParts);
            contents.add(userTurn);
            body.set("contents", contents);

            // Serialize to String first
            String jsonBody = objectMapper.writeValueAsString(body);

            RestClient restClient = RestClient.create();
            String responseBody = restClient.post()
                    .uri(GEMINI_URL + "?key=" + geminiApiKey)
                    .header("Content-Type", "application/json")
                    .body(jsonBody)
                    .retrieve()
                    .body(String.class);

            return objectMapper.readTree(responseBody)
                    .path("candidates").get(0)
                    .path("content")
                    .path("parts").get(0)
                    .path("text")
                    .asText("Sorry, I could not generate a response.");

        } catch (Exception e) {
            return "Sorry, something went wrong: " + e.getMessage();
        }
    }
}