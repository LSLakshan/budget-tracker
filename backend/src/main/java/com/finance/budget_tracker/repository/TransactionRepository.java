package com.finance.budget_tracker.repository;

import com.finance.budget_tracker.entity.Transaction;
import com.finance.budget_tracker.enums.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    /** All transactions for a user */
    List<Transaction> findByUserIdOrderByDateDesc(Long userId);

    /** Ownership check on a single transaction */
    Optional<Transaction> findByIdAndUserId(Long id, Long userId);

    /** Filter by date range */
    List<Transaction> findByUserIdAndDateBetweenOrderByDateDesc(Long userId, LocalDate startDate, LocalDate endDate);

    /** Filter by category */
    List<Transaction> findByUserIdAndCategoryIdOrderByDateDesc(Long userId, Long categoryId);

    /** Filter by transaction type (INCOME / EXPENSE) */
    List<Transaction> findByUserIdAndTransactionTypeOrderByDateDesc(Long userId, TransactionType type);

    /** Filter by category + date range (for budget progress calculation) */
    @Query("""
            SELECT t FROM Transaction t
            WHERE t.user.id = :userId
              AND t.category.id = :categoryId
              AND t.date BETWEEN :startDate AND :endDate
            ORDER BY t.date DESC
            """)
    List<Transaction> findByUserIdAndCategoryIdAndDateRange(
            @Param("userId") Long userId,
            @Param("categoryId") Long categoryId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    // ─── Dashboard Aggregation Queries ────────────────────────────────────────

    /** Total income for a user */
    @Query("""
            SELECT COALESCE(SUM(t.amount), 0)
            FROM Transaction t
            WHERE t.user.id = :userId AND t.transactionType = 'INCOME'
            """)
    BigDecimal sumIncomeByUserId(@Param("userId") Long userId);

    /** Total expenses for a user */
    @Query("""
            SELECT COALESCE(SUM(t.amount), 0)
            FROM Transaction t
            WHERE t.user.id = :userId AND t.transactionType = 'EXPENSE'
            """)
    BigDecimal sumExpensesByUserId(@Param("userId") Long userId);

    /** Total spending in a category between dates (for budget progress) */
    @Query("""
            SELECT COALESCE(SUM(t.amount), 0)
            FROM Transaction t
            WHERE t.user.id = :userId
              AND t.category.id = :categoryId
              AND t.transactionType = 'EXPENSE'
              AND t.date BETWEEN :startDate AND :endDate
            """)
    BigDecimal sumExpensesByCategoryAndDateRange(
            @Param("userId") Long userId,
            @Param("categoryId") Long categoryId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}


