package com.expensetracker.dao;

import com.expensetracker.util.DBConnection;
import com.expensetracker.util.PasswordUtil;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class UserDAO {

    // Register a new user
    public boolean registerUser(
            String name, String email, String password)
            throws Exception {

        String sql = "INSERT INTO users "
                + "(name, email, password_hash) "
                + "VALUES (?, ?, ?)";

        String passwordHash =
                PasswordUtil.hashPassword(password);

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, name);
            ps.setString(2, email);
            ps.setString(3, passwordHash);

            return ps.executeUpdate() > 0;
        }
    }

    // Login an existing user
    public int loginUser(String email, String password)
            throws Exception {

        String sql = "SELECT user_id, password_hash "
                + "FROM users WHERE email = ?";

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, email);

            try (ResultSet rs = ps.executeQuery()) {

                if (rs.next()) {

                    String storedHash =
                            rs.getString("password_hash");

                    if (PasswordUtil.verifyPassword(
                            password, storedHash)) {

                        return rs.getInt("user_id");
                    }
                }
            }
        }

        return -1;
    }

    // Get the registered name of a user
    public String getUserName(int userId) throws Exception {
        String sql = "SELECT name FROM users WHERE user_id = ?";

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, userId);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getString("name");
                }
            }
        }

        return null;
    }
}
