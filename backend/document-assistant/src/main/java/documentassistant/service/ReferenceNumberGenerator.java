package documentassistant.service;

import documentassistant.model.entity.DailyDocumentRequestCounter;
import documentassistant.repository.DailyDocumentRequestCounterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

// Generates reference numbers in the format REQ-ddMMyyyy-NNN.
// Uses a per-day counter row with a pessimistic write lock so two requests
// submitted at the same time always get different numbers.
@Component
@RequiredArgsConstructor
public class ReferenceNumberGenerator {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("ddMMyyyy");
    private static final String PREFIX = "REQ-";

    private final DailyDocumentRequestCounterRepository counterRepository;

    @Transactional(propagation = Propagation.REQUIRED)
    public String generate() {
        LocalDate today = LocalDate.now();

        DailyDocumentRequestCounter counter = counterRepository.findByDateForUpdate(today)
                .orElseGet(() -> createTodayCounter(today));

        counter.setLastSequence(counter.getLastSequence() + 1);
        counterRepository.save(counter);

        return "%s%s-%05d".formatted(PREFIX, today.format(DATE_FORMAT), counter.getLastSequence());
    }

    private DailyDocumentRequestCounter createTodayCounter(LocalDate date) {
        try {
            return counterRepository.saveAndFlush(new DailyDocumentRequestCounter(date, 0L));
        } catch (DataIntegrityViolationException e) {
            return counterRepository.findByDateForUpdate(date)
                    .orElseThrow(() -> new IllegalStateException(
                            "counter row missing after insert race for " + date, e));
        }
    }
}
