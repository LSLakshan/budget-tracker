package com.finance.budget_tracker.dto.transaction;

import com.finance.budget_tracker.enums.TransactionType;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class TransactionRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 150, message = "Title must be less than 255 characters")
    private String title;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    @Digits(integer = 13, fraction = 2, message = "Amount must have at most 13 digits and 2 decimal places")
    private BigDecimal amount;

    @NotNull(message = "Date is required")
    private LocalDate date;

    @Size(max = 500, message = "Note must be less than 500 characters")
    private String note;

    @NotNull(message = "Transaction ID is required")
    private TransactionType transactionType;

    @NotNull(message = "Category ID is required")
    private Long categoryId;
}
