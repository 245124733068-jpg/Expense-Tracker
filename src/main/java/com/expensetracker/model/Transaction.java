package com.expensetracker.model;

import java.math.BigDecimal;
import java.time.LocalDate;

public class Transaction {

    private int transactionId;
    private int userId;
    private BigDecimal amount;
    private String category;
    private String type;
    private String description;
    private LocalDate transactionDate;

    public Transaction() {
    }

    public Transaction(int userId, BigDecimal amount, String category,
                       String type, String description,
                       LocalDate transactionDate) {
        this.userId = userId;
        this.amount = amount;
        this.category = category;
        this.type = type;
        this.description = description;
        this.transactionDate = transactionDate;
    }

    public int getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(int transactionId) {
        this.transactionId = transactionId;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getTransactionDate() {
        return transactionDate;
    }

    public void setTransactionDate(LocalDate transactionDate) {
        this.transactionDate = transactionDate;
    }
}
