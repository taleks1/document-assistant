package documentassistant.exception;

public class MissingRejectionReasonException extends RuntimeException {
    public MissingRejectionReasonException(String message) {
        super(message);
    }
}
