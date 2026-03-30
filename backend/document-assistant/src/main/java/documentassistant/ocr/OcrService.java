package documentassistant.ocr;

import net.sourceforge.tess4j.ITesseract;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.springframework.stereotype.Service;

import java.io.File;

@Service
public class OcrService {

    public String extractTextFromImage(String imagePath) throws TesseractException {
        ITesseract tesseract = new Tesseract();
        tesseract.setDatapath("/usr/share/tesseract-ocr/5/tessdata/"); 
        tesseract.setLanguage("mkd");
        return tesseract.doOCR(new File(imagePath));
    }
}
