package documentassistant.exception;

public class NoDocumentRequestsFoundException extends RuntimeException {
    public NoDocumentRequestsFoundException(String message) {
        super(message);
    }
}
