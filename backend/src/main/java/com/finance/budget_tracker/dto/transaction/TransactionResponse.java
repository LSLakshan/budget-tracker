package com.finance.budget_tracker.dto.transaction;

import com.finance.budget_tracker.enums.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TransactionResponse {

    private Long id;
    private String title;
    private BigDecimal amount;
    private LocalDate date;
    private String note;
    private TransactionType transactionType;
    private Long categoryId;
    private String categoryName;
}
