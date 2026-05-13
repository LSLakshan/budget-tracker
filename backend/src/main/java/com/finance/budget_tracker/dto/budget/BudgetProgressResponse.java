package com.finance.budget_tracker.dto.budget;

import com.finance.budget_tracker.enums.BudgetPeriod;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BudgetProgressResponse {

    private Long budgetId;
    private String categoryName;
    private BudgetPeriod period;
    private BigDecimal budgetAmount;
    private BigDecimal totalSpent;
    private BigDecimal remaining;
    private boolean exceeded;
}
