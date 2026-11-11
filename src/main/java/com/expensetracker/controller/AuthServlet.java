package com.expensetracker.controller;

import com.expensetracker.dao.UserDAO;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import java.io.IOException;
import java.sql.SQLException;

@WebServlet("/auth")
public class AuthServlet extends HttpServlet {

    private UserDAO userDAO;

    @Override
    public void init() {
        userDAO = new UserDAO();
    }


    // Return the currently logged-in user's session details
   
@Override
protected void doGet(HttpServletRequest request,
                     HttpServletResponse response)
        throws ServletException, IOException {

    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");

    HttpSession session = request.getSession(false);

    if (session == null || session.getAttribute("userId") == null) {
        response.sendError(HttpServletResponse.SC_UNAUTHORIZED,
                "Please log in first.");
        return;
    }

    String userName = (String) session.getAttribute("userName");

    response.getWriter().write(
            "{\"userName\":\"" + escapeJson(userName) + "\"}");
}

private String escapeJson(String value) {
    if (value == null) {
        return "";
    }

    return value.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\r", "\\r")
                .replace("\n", "\\n")
                .replace("\t", "\\t");
}


    @Override
    protected void doPost(HttpServletRequest request,
                          HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String action = request.getParameter("action");

        try {
            if ("register".equals(action)) {
                registerUser(request, response);

            } else if ("login".equals(action)) {
                loginUser(request, response);

            } else if ("logout".equals(action)) {
                logoutUser(request, response);

            } else {
                response.sendError(400, "Invalid authentication action.");
            }

        } catch (SQLException e) {
            if ("register".equals(action)
                    && "23000".equals(e.getSQLState())) {
                response.sendError(409, "Email already registered.");
            } else {
                throw new ServletException(
                        "Authentication database error.", e);
            }

        } catch (Exception e) {
            throw new ServletException(
                    "Authentication failed.", e);
        }
    }

    // User registration
    private void registerUser(HttpServletRequest request,
                              HttpServletResponse response)
            throws Exception {

        String name = request.getParameter("name");
        String email = request.getParameter("email");
        String password = request.getParameter("password");

        if (name == null || name.trim().isEmpty()
                || email == null || email.trim().isEmpty()
                || password == null || password.length() < 8) {

            response.sendError(
                    400, "Enter valid details. Password must be at least 8 characters.");
            return;
        }

        boolean registered = userDAO.registerUser(
                name.trim(),
                email.trim(),
                password
        );

        if (registered) {
            response.setStatus(HttpServletResponse.SC_CREATED);
            response.getWriter().write(
                    "{\"message\":\"Registration successful. Please log in.\"}");
        } else {
            response.sendError(400, "Registration failed.");
        }
    }

    // User login
    private void loginUser(HttpServletRequest request,
                           HttpServletResponse response)
            throws Exception {

        String email = request.getParameter("email");
        String password = request.getParameter("password");

        if (email == null || email.trim().isEmpty()
                || password == null || password.isEmpty()) {

            response.sendError(400, "Email and password are required.");
            return;
        }

        int userId = userDAO.loginUser(email.trim(), password);

        if (userId > 0) {

            HttpSession oldSession = request.getSession(false);

            if (oldSession != null) {
                oldSession.invalidate();
            }

            HttpSession session = request.getSession(true);
            request.changeSessionId();

            String userName = userDAO.getUserName(userId);

            session.setAttribute("userId", userId);
            session.setAttribute("userEmail", email.trim());
            session.setAttribute("userName", userName);

            response.getWriter().write(
                    "{\"message\":\"Login successful\"}");

        } else {
            response.sendError(
                    401, "Invalid email or password.");
        }
    }

    // User logout
    private void logoutUser(HttpServletRequest request,
                            HttpServletResponse response)
            throws IOException {

        HttpSession session = request.getSession(false);

        if (session != null) {
            session.invalidate();
        }

        response.getWriter().write(
                "{\"message\":\"Logged out successfully\"}");
    }
}
