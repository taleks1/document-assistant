package documentassistant.service;

import documentassistant.model.enums.DocumentRequestStatus;
import documentassistant.model.enums.DocumentRequestType;
import documentassistant.payload.DocumentRequestResponse;
import documentassistant.payload.StatusHistoryResponse;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class PdfGenerationService {

    private static final float MARGIN = 50f;
    private static final float PAGE_WIDTH = PDRectangle.A4.getWidth();
    private static final float PAGE_HEIGHT = PDRectangle.A4.getHeight();
    private static final float CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;

    @Value("${pdf.font.regular.path:C:/Windows/Fonts/arial.ttf}")
    private String regularFontPath;

    @Value("${pdf.font.bold.path:C:/Windows/Fonts/arialbd.ttf}")
    private String boldFontPath;

    private PDFont loadFont(PDDocument document, boolean bold) {
        String path = bold ? boldFontPath : regularFontPath;
        try {
            File fontFile = new File(path);
            if (fontFile.exists()) {
                return PDType0Font.load(document, fontFile);
            }
            log.warn("Font not found at {}, Cyrillic characters may not render correctly", path);
        } catch (IOException e) {
            log.warn("Cannot load font from {}: {}", path, e.getMessage());
        }
        Standard14Fonts.FontName name = bold
                ? Standard14Fonts.FontName.HELVETICA_BOLD
                : Standard14Fonts.FontName.HELVETICA;
        return new PDType1Font(name);
    }

    public byte[] generateConfirmation(DocumentRequestResponse req) {
        try (PDDocument doc = new PDDocument()) {
            PDFont regular = loadFont(doc, false);
            PDFont bold = loadFont(doc, true);

            try (PageWriter pw = new PageWriter(doc, regular)) {
                buildConfirmation(pw, req, bold, regular);
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            doc.save(baos);
            return baos.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate confirmation PDF", e);
        }
    }

    public byte[] generateOfficialDocument(DocumentRequestResponse req) {
        if (req.getStatus() != DocumentRequestStatus.APPROVED) {
            throw new IllegalStateException("Official document can only be generated for APPROVED requests");
        }
        try (PDDocument doc = new PDDocument()) {
            PDFont regular = loadFont(doc, false);
            PDFont bold = loadFont(doc, true);

            try (PageWriter pw = new PageWriter(doc, regular)) {
                buildOfficialDocument(pw, req, bold, regular);
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            doc.save(baos);
            return baos.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate official document PDF", e);
        }
    }

    private void buildConfirmation(PageWriter pw, DocumentRequestResponse req, PDFont bold, PDFont regular) throws IOException {
        pw.centered(bold, 14, "REPUBLIKA SEVERNA MAKEDONIJA");
        pw.space(4);
        pw.centered(bold, 12, "POTVRDA ZA PODNESENO BARANJE");
        pw.space(6);
        pw.line();
        pw.space(8);

        pw.kv(bold, regular, 11, "Ref. broj:", req.getReferenceNumber());
        pw.space(3);
        pw.kv(bold, regular, 11, "Datum:", formatDate(req.getCreatedAt()));
        pw.space(3);
        pw.kv(bold, regular, 11, "Status:", status(req.getStatus()));
        pw.space(8);
        pw.line();
        pw.space(8);

        pw.text(bold, 11, "PODNOSITEL");
        pw.space(4);
        pw.kv(bold, regular, 11, "Ime i prezime:", req.getUserFullName());
        pw.space(3);
        pw.kv(bold, regular, 11, "E-posta:", req.getUserEmail());
        pw.space(8);
        pw.line();
        pw.space(8);

        pw.text(bold, 11, "DETALI NA BARANJETO");
        pw.space(4);
        pw.kv(bold, regular, 11, "Tip:", type(req.getType()));
        pw.space(3);
        pw.kv(bold, regular, 11, "Naslov:", req.getTitle());
        pw.space(4);
        pw.text(bold, 11, "Opis:");
        pw.space(2);
        pw.wrapped(regular, 10, req.getDescription());

        if (req.getNotes() != null && !req.getNotes().isBlank()) {
            pw.space(4);
            pw.text(bold, 11, "Beleski:");
            pw.space(2);
            pw.wrapped(regular, 10, req.getNotes());
        }

        pw.space(8);
        pw.line();
        pw.space(8);

        pw.text(bold, 11, "ISTORIJA NA STATUS");
        pw.space(4);
        for (StatusHistoryResponse h : req.getStatusHistory()) {
            String line = "  * " + status(h.getStatus()) + "  -  " + formatDateTime(h.getTimestamp());
            pw.wrapped(regular, 10, line);
            if (h.getNote() != null && !h.getNote().isBlank()) {
                pw.wrapped(regular, 10, "      " + h.getNote());
            }
            pw.space(2);
        }

        pw.footer("Generirano: " + formatDateTime(Instant.now()));
    }

    private void buildOfficialDocument(PageWriter pw, DocumentRequestResponse req, PDFont bold, PDFont regular) throws IOException {
        pw.centered(bold, 14, "REPUBLIKA SEVERNA MAKEDONIJA");
        pw.space(4);
        pw.centered(bold, 12, "OFICIJALNA ODLUKA");
        pw.space(6);
        pw.line();
        pw.space(8);

        pw.kv(bold, regular, 11, "Ref. broj:", req.getReferenceNumber());
        pw.space(3);
        pw.kv(bold, regular, 11, "Datum na odobruvanje:", formatDate(req.getUpdatedAt()));
        pw.space(14);

        pw.wrapped(regular, 11, "Baranjeto podneseno od " + req.getUserFullName()
                + " (" + req.getUserEmail() + "),");
        pw.space(4);
        pw.wrapped(regular, 11, "za: " + type(req.getType()) + " - " + req.getTitle() + ",");
        pw.space(14);

        pw.centered(bold, 16, "E ODOBRENO");
        pw.space(20);

        if (req.getNotes() != null && !req.getNotes().isBlank()) {
            pw.line();
            pw.space(8);
            pw.text(bold, 11, "BELESKI OD ADMINISTRATOR");
            pw.space(4);
            pw.wrapped(regular, 10, req.getNotes());
            pw.space(8);
        }

        pw.line();
        pw.space(8);
        pw.text(bold, 11, "ISTORIJA NA STATUS");
        pw.space(4);
        for (StatusHistoryResponse h : req.getStatusHistory()) {
            String line = "  * " + status(h.getStatus()) + "  -  " + formatDateTime(h.getTimestamp());
            pw.wrapped(regular, 10, line);
            pw.space(2);
        }

        pw.footer("Generirano: " + formatDateTime(Instant.now()));
    }

    private String status(DocumentRequestStatus s) {
        return switch (s) {
            case SUBMITTED -> "Podneseno";
            case IN_REVIEW -> "Vo obrabotka";
            case REVIEWED -> "Razgledano";
            case APPROVED -> "Odobreno";
            case REJECTED -> "Odbiano";
        };
    }

    private String type(DocumentRequestType t) {
        return switch (t) {
            case REQUEST -> "Baranje";
            case PERMIT -> "Dozvola";
            case COMPLAINT -> "Zalba";
            case APPLICATION -> "Aplikacija";
            case CERTIFICATE -> "Potvrda";
            case OBJECTION -> "Prigovor";
            case STATEMENT -> "Izjava";
            case REPORT -> "Izvestaj";
            case OTHER -> "Drugo";
        };
    }

    private String formatDate(Instant instant) {
        if (instant == null) return "";
        return instant.atZone(ZoneId.of("Europe/Skopje"))
                .format(DateTimeFormatter.ofPattern("dd.MM.yyyy"));
    }

    private String formatDateTime(Instant instant) {
        if (instant == null) return "";
        return instant.atZone(ZoneId.of("Europe/Skopje"))
                .format(DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm"));
    }

    // ── PageWriter ────────────────────────────────────────────────────────────

    private static class PageWriter implements AutoCloseable {
        private final PDDocument doc;
        private PDPageContentStream cs;
        private float y;
        private final PDFont footerFont;

        PageWriter(PDDocument doc, PDFont footerFont) throws IOException {
            this.doc = doc;
            this.footerFont = footerFont;
            newPage();
        }

        private void newPage() throws IOException {
            if (cs != null) cs.close();
            PDPage page = new PDPage(PDRectangle.A4);
            doc.addPage(page);
            cs = new PDPageContentStream(doc, page);
            y = PAGE_HEIGHT - MARGIN;
        }

        private void ensureSpace(float need) throws IOException {
            if (y - need < MARGIN + 30) newPage();
        }

        void centered(PDFont font, float size, String text) throws IOException {
            ensureSpace(size + 4);
            float tw = font.getStringWidth(text) / 1000f * size;
            float x = (PAGE_WIDTH - tw) / 2f;
            cs.beginText();
            cs.setFont(font, size);
            cs.newLineAtOffset(x, y);
            cs.showText(text);
            cs.endText();
            y -= (size + 4f);
        }

        void text(PDFont font, float size, String text) throws IOException {
            ensureSpace(size + 4);
            cs.beginText();
            cs.setFont(font, size);
            cs.newLineAtOffset(MARGIN, y);
            cs.showText(text);
            cs.endText();
            y -= (size + 4f);
        }

        void kv(PDFont kFont, PDFont vFont, float size, String key, String value) throws IOException {
            ensureSpace(size + 4);
            float kw = kFont.getStringWidth(key) / 1000f * size;
            cs.beginText();
            cs.setFont(kFont, size);
            cs.newLineAtOffset(MARGIN, y);
            cs.showText(key);
            cs.setFont(vFont, size);
            cs.newLineAtOffset(kw + 4f, 0);
            cs.showText(value != null ? value : "");
            cs.endText();
            y -= (size + 4f);
        }

        void wrapped(PDFont font, float size, String text) throws IOException {
            if (text == null || text.isBlank()) return;
            for (String line : wrapText(font, size, text)) {
                ensureSpace(size + 3);
                cs.beginText();
                cs.setFont(font, size);
                cs.newLineAtOffset(MARGIN, y);
                cs.showText(line);
                cs.endText();
                y -= (size + 3f);
            }
        }

        void line() throws IOException {
            ensureSpace(4);
            cs.setLineWidth(0.5f);
            cs.moveTo(MARGIN, y);
            cs.lineTo(PAGE_WIDTH - MARGIN, y);
            cs.stroke();
            y -= 4f;
        }

        void space(float pts) {
            y -= pts;
        }

        void footer(String text) throws IOException {
            float fy = MARGIN + 12f;
            cs.setLineWidth(0.5f);
            cs.moveTo(MARGIN, fy + 14f);
            cs.lineTo(PAGE_WIDTH - MARGIN, fy + 14f);
            cs.stroke();
            cs.beginText();
            cs.setFont(footerFont, 9);
            cs.newLineAtOffset(MARGIN, fy);
            cs.showText(text);
            cs.endText();
        }

        @Override
        public void close() throws IOException {
            if (cs != null) {
                cs.close();
                cs = null;
            }
        }

        private List<String> wrapText(PDFont font, float size, String text) throws IOException {
            List<String> result = new ArrayList<>();
            for (String para : text.split("\n", -1)) {
                if (para.isBlank()) {
                    result.add("");
                    continue;
                }
                String[] words = para.split(" ", -1);
                StringBuilder cur = new StringBuilder();
                for (String word : words) {
                    String candidate = cur.isEmpty() ? word : cur + " " + word;
                    float w = font.getStringWidth(candidate) / 1000f * size;
                    if (w > CONTENT_WIDTH && !cur.isEmpty()) {
                        result.add(cur.toString());
                        cur = new StringBuilder(word);
                    } else {
                        cur = new StringBuilder(candidate);
                    }
                }
                if (!cur.isEmpty()) result.add(cur.toString());
            }
            return result;
        }
    }
}
