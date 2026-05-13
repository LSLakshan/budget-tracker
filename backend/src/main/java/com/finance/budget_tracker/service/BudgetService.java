package com.finance.budget_tracker.service;

import com.finance.budget_tracker.dto.budget.BudgetProgressResponse;
import com.finance.budget_tracker.dto.budget.BudgetRequest;
import com.finance.budget_tracker.dto.budget.BudgetResponse;
import com.finance.budget_tracker.entity.Budget;
import com.finance.budget_tracker.entity.Category;
import com.finance.budget_tracker.entity.User;
import com.finance.budget_tracker.exception.ResourceNotFoundException;
import com.finance.budget_tracker.repository.BudgetRepository;
import com.finance.budget_tracker.repository.CategoryRepository;
import com.finance.budget_tracker.repository.TransactionRepository;
import com.finance.budget_tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    private BudgetResponse toResponse(Budget budget) {
        return new BudgetResponse(
                budget.getId(),
                budget.getAmount(),
                budget.getPeriod(),
                budget.getCategory().getId(),
                budget.getCategory().getName()
        );
    }

    // ─── Create ───────────────────────────────────────────────────────────────

    @Transactional
    public BudgetResponse createBudget(BudgetRequest request, String username) {
        User user = getUser(username);

        Category category = categoryRepository.findByIdAndUserId(request.getCategoryId(), user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));

        // Only one budget per category per user
        if (budgetRepository.findByCategoryIdAndUserId(category.getId(), user.getId()).isPresent()) {
            throw new IllegalArgumentException(
                    "A budget already exists for category '" + category.getName() + "'. Please update it instead.");
        }

        Budget budget = Budget.builder()
                .amount(request.getAmount())
                .period(request.getPeriod())
                .category(category)
                .user(user)
                .build();

        return toResponse(budgetRepository.save(budget));
    }

    // ─── Read ─────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<BudgetResponse> getAllBudgets(String username) {
        User user = getUser(username);
        return budgetRepository.findByUserId(user.getId())
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public BudgetResponse getBudgetById(Long id, String username) {
        User user = getUser(username);
        Budget budget = budgetRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Budget", id));
        return toResponse(budget);
    }

    // ─── Update ───────────────────────────────────────────────────────────────

    @Transactional
    public BudgetResponse updateBudget(Long id, BudgetRequest request, String username) {
        User user = getUser(username);
        Budget budget = budgetRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Budget", id));

        Category category = categoryRepository.findByIdAndUserId(request.getCategoryId(), user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));

        budget.setAmount(request.getAmount());
        budget.setPeriod(request.getPeriod());
        budget.setCategory(category);

        return toResponse(budgetRepository.save(budget));
    }

    // ─── Delete ───────────────────────────────────────────────────────────────

    @Transactional
    public void deleteBudget(Long id, String username) {
        User user = getUser(username);
        Budget budget = budgetRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Budget", id));
        budgetRepository.delete(budget);
    }

    // ─── Budget Progress ──────────────────────────────────────────────────────

    /**
     * Calculates how much of the budget has been spent in the current calendar month.
     * Returns budget amount, total spent, remaining, and an exceeded flag.
     */
    @Transactional(readOnly = true)
    public BudgetProgressResponse getBudgetProgress(Long id, String username) {
        User user = getUser(username);
        Budget budget = budgetRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Budget", id));

        // For MONTHLY period: use the first and last day of the current month
        LocalDate now = LocalDate.now();
        LocalDate startDate = now.withDayOfMonth(1);
        LocalDate endDate = now.withDayOfMonth(now.lengthOfMonth());

        BigDecimal totalSpent = transactionRepository.sumExpensesByCategoryAndDateRange(
                user.getId(),
                budget.getCategory().getId(),
                startDate,
                endDate
        );

        BigDecimal budgetAmount = budget.getAmount();
        BigDecimal remaining = budgetAmount.subtract(totalSpent);
        boolean exceeded = totalSpent.compareTo(budgetAmount) > 0;

        return new BudgetProgressResponse(
                budget.getId(),
                budget.getCategory().getName(),
                budget.getPeriod(),
                budgetAmount,
                totalSpent,
                remaining,
                exceeded
        );
    }
}
