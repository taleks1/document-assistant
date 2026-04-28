package documentassistant.ocr;

import net.sourceforge.tess4j.ITesseract;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;

@Service
public class OcrService {

    @Value("${tesseract.datapath}")
    private String datapath;

    @Value("${tesseract.language}")
    private String language;

    public String extractTextFromImage(String imagePath) throws TesseractException {

        ITesseract tesseract = new Tesseract();

        tesseract.setDatapath(datapath);
        tesseract.setLanguage(language);

        return tesseract.doOCR(new File(imagePath));
    }
}
