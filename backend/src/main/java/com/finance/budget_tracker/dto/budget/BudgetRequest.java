package com.finance.budget_tracker.dto.budget;

import com.finance.budget_tracker.enums.BudgetPeriod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
public class BudgetRequest {

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    @Digits(integer = 13, fraction = 2, message = "Amount must have at most 13 digits and 2 decimal places")
    private BigDecimal amount;

    @NotNull(message = "Period is required")
    private BudgetPeriod period;

    @NotNull(message = "Category ID is required")
    private Long categoryId;
}
