package com.finance.budget_tracker.service;

import com.finance.budget_tracker.dto.dashboard.DashboardResponse;
import com.finance.budget_tracker.entity.User;
import com.finance.budget_tracker.repository.TransactionRepository;
import com.finance.budget_tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public DashboardResponse getDashboardSummary(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        BigDecimal totalIncome = transactionRepository.sumIncomeByUserId(user.getId());
        BigDecimal totalExpenses = transactionRepository.sumExpensesByUserId(user.getId());
        BigDecimal currentBalance = totalIncome.subtract(totalExpenses);

        return new DashboardResponse(totalIncome, totalExpenses, currentBalance);
    }
}
