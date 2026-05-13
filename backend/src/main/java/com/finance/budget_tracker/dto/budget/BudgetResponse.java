package com.finance.budget_tracker.dto.budget;

import com.finance.budget_tracker.enums.BudgetPeriod;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BudgetResponse {

    private Long id;
    private BigDecimal amount;
    private BudgetPeriod period;
    private Long categoryId;
    private String categoryName;
}
