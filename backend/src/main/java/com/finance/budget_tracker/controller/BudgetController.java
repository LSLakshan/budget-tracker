package com.finance.budget_tracker.controller;

import com.finance.budget_tracker.dto.budget.BudgetProgressResponse;
import com.finance.budget_tracker.dto.budget.BudgetRequest;
import com.finance.budget_tracker.dto.budget.BudgetResponse;
import com.finance.budget_tracker.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    /**
     * POST /api/budgets
     * Create a new budget for a category.
     */
    @PostMapping
    public ResponseEntity<BudgetResponse> createBudget(
            @Valid @RequestBody BudgetRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        BudgetResponse response = budgetService.createBudget(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/budgets
     * Get all budgets for the authenticated user.
     */
    @GetMapping
    public ResponseEntity<List<BudgetResponse>> getAllBudgets(
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(budgetService.getAllBudgets(userDetails.getUsername()));
    }

    /**
     * GET /api/budgets/{id}
     * Get a single budget by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<BudgetResponse> getBudgetById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(budgetService.getBudgetById(id, userDetails.getUsername()));
    }

    /**
     * PUT /api/budgets/{id}
     * Update an existing budget.
     */
    @PutMapping("/{id}")
    public ResponseEntity<BudgetResponse> updateBudget(
            @PathVariable Long id,
            @Valid @RequestBody BudgetRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        BudgetResponse response = budgetService.updateBudget(id, request, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/budgets/{id}
     * Delete a budget.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        budgetService.deleteBudget(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/budgets/{id}/progress
     * Get budget vs. actual spending progress for the current month.
     * Response includes: budgetAmount, totalSpent, remaining, exceeded (boolean).
     */
    @GetMapping("/{id}/progress")
    public ResponseEntity<BudgetProgressResponse> getBudgetProgress(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        BudgetProgressResponse response = budgetService.getBudgetProgress(id, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }
}
