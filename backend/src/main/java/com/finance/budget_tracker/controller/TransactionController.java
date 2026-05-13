package com.finance.budget_tracker.controller;

import com.finance.budget_tracker.dto.transaction.TransactionRequest;
import com.finance.budget_tracker.dto.transaction.TransactionResponse;
import com.finance.budget_tracker.enums.TransactionType;
import com.finance.budget_tracker.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    /**
     * POST /api/transactions
     * Create a new transaction.
     */
    @PostMapping
    public ResponseEntity<TransactionResponse> createTransaction(
            @Valid @RequestBody TransactionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        TransactionResponse response = transactionService.createTransaction(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/transactions
     * Get all transactions. Supports optional query filters:
     *   - startDate & endDate  (date range filter)
     *   - categoryId           (category filter)
     *   - type                 (INCOME / EXPENSE)
     */
    @GetMapping
    public ResponseEntity<List<TransactionResponse>> getTransactions(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) TransactionType type,
            @AuthenticationPrincipal UserDetails userDetails) {

        String username = userDetails.getUsername();
        List<TransactionResponse> transactions;

        if (startDate != null && endDate != null) {
            transactions = transactionService.getTransactionsByDateRange(startDate, endDate, username);
        } else if (categoryId != null) {
            transactions = transactionService.getTransactionsByCategory(categoryId, username);
        } else if (type != null) {
            transactions = transactionService.getTransactionsByType(type, username);
        } else {
            transactions = transactionService.getAllTransactions(username);
        }

        return ResponseEntity.ok(transactions);
    }

    /**
     * GET /api/transactions/{id}
     * Get a single transaction by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<TransactionResponse> getTransactionById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        TransactionResponse response = transactionService.getTransactionById(id, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/transactions/{id}
     * Update an existing transaction.
     */
    @PutMapping("/{id}")
    public ResponseEntity<TransactionResponse> updateTransaction(
            @PathVariable Long id,
            @Valid @RequestBody TransactionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        TransactionResponse response = transactionService.updateTransaction(id, request, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/transactions/{id}
     * Delete a transaction.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        transactionService.deleteTransaction(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
