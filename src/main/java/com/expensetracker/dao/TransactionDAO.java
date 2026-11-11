package com.expensetracker.dao;

import com.expensetracker.model.Transaction;
import com.expensetracker.util.DBConnection;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Date;
import java.util.ArrayList;
import java.util.List;

public class TransactionDAO {

    // Add a new transaction
    public boolean addTransaction(Transaction transaction)
            throws SQLException {

        String sql = "INSERT INTO transactions "
                + "(user_id, amount, category, type, description, transaction_date) "
                + "VALUES (?, ?, ?, ?, ?, ?)";

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, transaction.getUserId());
            ps.setBigDecimal(2, transaction.getAmount());
            ps.setString(3, transaction.getCategory());
            ps.setString(4, transaction.getType());
            ps.setString(5, transaction.getDescription());
            ps.setDate(6, Date.valueOf(transaction.getTransactionDate()));

            return ps.executeUpdate() > 0;
        }
    }

    // Retrieve all transactions for a user
    public List<Transaction> getAllTransactions(int userId)
            throws SQLException {

        List<Transaction> transactions = new ArrayList<>();

        String sql = "SELECT * FROM transactions "
                + "WHERE user_id = ? "
                + "ORDER BY transaction_date DESC, transaction_id DESC";

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, userId);

            try (ResultSet rs = ps.executeQuery()) {

                while (rs.next()) {

                    Transaction transaction = new Transaction();

                    transaction.setTransactionId(
                            rs.getInt("transaction_id"));

                    transaction.setUserId(
                            rs.getInt("user_id"));

                    transaction.setAmount(
                            rs.getBigDecimal("amount"));

                    transaction.setCategory(
                            rs.getString("category"));

                    transaction.setType(
                            rs.getString("type"));

                    transaction.setDescription(
                            rs.getString("description"));

                    transaction.setTransactionDate(
                            rs.getDate("transaction_date").toLocalDate());

                    transactions.add(transaction);
                }
            }
        }

        return transactions;
    }

    // Delete a transaction belonging to a user
    public boolean deleteTransaction(int transactionId, int userId)
            throws SQLException {

        String sql = "DELETE FROM transactions "
                + "WHERE transaction_id = ? AND user_id = ?";

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, transactionId);
            ps.setInt(2, userId);

            return ps.executeUpdate() > 0;
        }
    }
}
