package com.expensetracker.controller;

import com.expensetracker.dao.TransactionDAO;
import com.expensetracker.model.Transaction;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@WebServlet("/transactions")
public class TransactionServlet extends HttpServlet {

    private TransactionDAO transactionDAO;

    @Override
    public void init() {
        transactionDAO = new TransactionDAO();
    }

    // Get logged-in user ID
    private Integer getUserId(HttpServletRequest request) {

        HttpSession session = request.getSession(false);

        if (session == null) {
            return null;
        }

        return (Integer) session.getAttribute("userId");
    }

    // GET: Retrieve transactions
    @Override
    protected void doGet(HttpServletRequest request,
                         HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        Integer userId = getUserId(request);

        if (userId == null) {
            response.sendError(401, "Please log in first.");
            return;
        }

        try {
            List<Transaction> transactions =
                    transactionDAO.getAllTransactions(userId);

            StringBuilder json = new StringBuilder("[");

            for (int i = 0; i < transactions.size(); i++) {

                Transaction t = transactions.get(i);

                if (i > 0) {
                    json.append(",");
                }

                json.append("{")
                    .append("\"id\":").append(t.getTransactionId()).append(",")
                    .append("\"amount\":").append(t.getAmount()).append(",")
                    .append("\"category\":\"").append(escape(t.getCategory())).append("\",")
                    .append("\"type\":\"").append(escape(t.getType())).append("\",")
                    .append("\"description\":\"").append(escape(t.getDescription())).append("\",")
                    .append("\"date\":\"").append(t.getTransactionDate()).append("\"")
                    .append("}");
            }

            json.append("]");

            response.getWriter().write(json.toString());

        } catch (Exception e) {
            throw new ServletException("Unable to retrieve transactions.", e);
        }
    }

    // POST: Add or delete transactions
    @Override
    protected void doPost(HttpServletRequest request,
                          HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        Integer userId = getUserId(request);

        if (userId == null) {
            response.sendError(401, "Please log in first.");
            return;
        }

        try {
            String action = request.getParameter("action");

            if ("add".equals(action)) {

                BigDecimal amount =
                        new BigDecimal(request.getParameter("amount"));

                String category = request.getParameter("category");
                String type = request.getParameter("type");
                String description = request.getParameter("description");

                LocalDate date =
                        LocalDate.parse(request.getParameter("date"));

                if (amount.compareTo(BigDecimal.ZERO) <= 0
                        || category == null
                        || category.trim().isEmpty()
                        || (!"income".equals(type)
                        && !"expense".equals(type))) {

                    response.sendError(400, "Invalid transaction details.");
                    return;
                }

                Transaction transaction = new Transaction(
                        userId,
                        amount,
                        category,
                        type,
                        description,
                        date
                );

                transactionDAO.addTransaction(transaction);

                response.getWriter().write(
                        "{\"message\":\"Transaction added successfully\"}");

            } else if ("delete".equals(action)) {

                int transactionId = Integer.parseInt(
                        request.getParameter("transactionId"));

                boolean deleted =
                        transactionDAO.deleteTransaction(
                                transactionId, userId);

                if (!deleted) {
                    response.sendError(404, "Transaction not found.");
                    return;
                }

                response.getWriter().write(
                        "{\"message\":\"Transaction deleted successfully\"}");

            } else {
                response.sendError(400, "Invalid action.");
            }

        } catch (NumberFormatException | java.time.DateTimeException e) {
            response.sendError(400, "Invalid transaction data.");

        } catch (Exception e) {
            throw new ServletException(
                    "Transaction operation failed.", e);
        }
    }

    // Escape special characters for JSON
    private String escape(String value) {

        if (value == null) {
            return "";
        }

        return value.replace("\\", "\\\\")
                    .replace("\"", "\\\"")
                    .replace("\n", "\\n")
                    .replace("\r", "\\r")
                    .replace("\t", "\\t");
    }
}
