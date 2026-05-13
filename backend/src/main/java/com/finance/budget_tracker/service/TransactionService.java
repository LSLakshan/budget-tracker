package com.finance.budget_tracker.service;

import com.finance.budget_tracker.dto.transaction.TransactionRequest;
import com.finance.budget_tracker.dto.transaction.TransactionResponse;
import com.finance.budget_tracker.entity.Category;
import com.finance.budget_tracker.entity.Transaction;
import com.finance.budget_tracker.entity.User;
import com.finance.budget_tracker.enums.TransactionType;
import com.finance.budget_tracker.exception.ResourceNotFoundException;
import com.finance.budget_tracker.repository.CategoryRepository;
import com.finance.budget_tracker.repository.TransactionRepository;
import com.finance.budget_tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    private TransactionResponse toResponse(Transaction t) {
        return new TransactionResponse(
                t.getId(),
                t.getTitle(),
                t.getAmount(),
                t.getDate(),
                t.getNote(),
                t.getTransactionType(),
                t.getCategory().getId(),
                t.getCategory().getName()
        );
    }

    // ─── Create ───────────────────────────────────────────────────────────────

    @Transactional
    public TransactionResponse createTransaction(TransactionRequest request, String username) {
        User user = getUser(username);

        // Validate that category belongs to this user
        Category category = categoryRepository.findByIdAndUserId(request.getCategoryId(), user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));

        Transaction transaction = Transaction.builder()
                .title(request.getTitle())
                .amount(request.getAmount())
                .date(request.getDate())
                .note(request.getNote())
                .transactionType(request.getTransactionType())
                .category(category)
                .user(user)
                .build();

        return toResponse(transactionRepository.save(transaction));
    }

    // ─── Read All ─────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<TransactionResponse> getAllTransactions(String username) {
        User user = getUser(username);
        return transactionRepository.findByUserIdOrderByDateDesc(user.getId())
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public TransactionResponse getTransactionById(Long id, String username) {
        User user = getUser(username);
        Transaction t = transactionRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", id));
        return toResponse(t);
    }

    // ─── Filtered Reads ───────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<TransactionResponse> getTransactionsByDateRange(LocalDate startDate, LocalDate endDate, String username) {
        User user = getUser(username);
        return transactionRepository
                .findByUserIdAndDateBetweenOrderByDateDesc(user.getId(), startDate, endDate)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getTransactionsByCategory(Long categoryId, String username) {
        User user = getUser(username);
        // Verify category ownership first
        categoryRepository.findByIdAndUserId(categoryId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", categoryId));
        return transactionRepository
                .findByUserIdAndCategoryIdOrderByDateDesc(user.getId(), categoryId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getTransactionsByType(TransactionType type, String username) {
        User user = getUser(username);
        return transactionRepository
                .findByUserIdAndTransactionTypeOrderByDateDesc(user.getId(), type)
                .stream().map(this::toResponse).toList();
    }

    // ─── Update ───────────────────────────────────────────────────────────────

    @Transactional
    public TransactionResponse updateTransaction(Long id, TransactionRequest request, String username) {
        User user = getUser(username);
        Transaction transaction = transactionRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", id));

        Category category = categoryRepository.findByIdAndUserId(request.getCategoryId(), user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));

        transaction.setTitle(request.getTitle());
        transaction.setAmount(request.getAmount());
        transaction.setDate(request.getDate());
        transaction.setNote(request.getNote());
        transaction.setTransactionType(request.getTransactionType());
        transaction.setCategory(category);

        return toResponse(transactionRepository.save(transaction));
    }

    // ─── Delete ───────────────────────────────────────────────────────────────

    @Transactional
    public void deleteTransaction(Long id, String username) {
        User user = getUser(username);
        Transaction transaction = transactionRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", id));
        transactionRepository.delete(transaction);
    }
}

