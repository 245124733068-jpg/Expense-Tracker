package com.expensetracker.controller;

import com.expensetracker.util.DBConnection;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/db-test")
public class DBTestServlet extends HttpServlet {

    @Override
    protected void doGet(
            HttpServletRequest request,
            HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("text/html;charset=UTF-8");

        try (PrintWriter out = response.getWriter()) {

            try (Connection con = DBConnection.getConnection()) {

                out.println("<h2>Expense Tracker</h2>");
                out.println("<h3>Database Connected Successfully!</h3>");

            } catch (Exception e) {

                response.setStatus(
                    HttpServletResponse.SC_INTERNAL_SERVER_ERROR
                );

                out.println("<h2>Database Connection Failed</h2>");
                out.println("<pre>");
                out.println(e.getMessage());
                out.println("</pre>");

                e.printStackTrace();
            }
        }
    }
}
