package com.finance.budget_tracker.repository;

import com.finance.budget_tracker.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    // Find all budgets for a specific user
    List<Budget> findByUserId(Long userId);

    // Find a budget by its ID and user ID (to ensure it belongs to the user)
    Optional<Budget> findByIdAndUserId(Long id, Long userId);

    //Find budget for a specific category and user
    Optional<Budget> findByCategoryIdAndUserId(Long categoryId, Long userId);

}

