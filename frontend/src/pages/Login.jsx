import React, { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Box,
  Typography,
  Container,
  Alert,
  Paper,
  CircularProgress,
  Link,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) throw new Error("Invalid credentials");
      const data = await res.json();
      login(data.access_token, data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 12 }}>
      <Paper
        elevation={6}
        sx={{
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          borderRadius: 3,
          boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
          backgroundColor: "background.paper",
        }}
      >
        <Typography component="h1" variant="h4" fontWeight={600} gutterBottom>
          Sign in
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 3, textAlign: "center" }}
        >
          Enter your username and password to access your account.
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ width: "100%", mt: 1 }}
          noValidate
          aria-label="login form"
        >
          <TextField
            margin="normal"
            required
            fullWidth
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            inputProps={{ "aria-label": "username" }}
            sx={{
              "& .MuiOutlinedInput-root.Mui-focused": {
                boxShadow: (theme) =>
                  `0 0 0 2px ${theme.palette.primary.main}33`,
              },
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            inputProps={{ "aria-label": "password" }}
            sx={{
              "& .MuiOutlinedInput-root.Mui-focused": {
                boxShadow: (theme) =>
                  `0 0 0 2px ${theme.palette.primary.main}33`,
              },
            }}
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              mt: 4,
              mb: 1,
              py: 1.5,
              fontWeight: "bold",
              fontSize: "1rem",
              textTransform: "none",
              borderRadius: 2,
              "&:hover": {
                boxShadow: "0 4px 15px rgba(25,118,210,0.4)",
              },
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Sign In"
            )}
          </Button>
          <Typography variant="body2" align="center" sx={{ mt: 1 }}>
            Don't have an account?{" "}
            <Link component={RouterLink} to="/register" underline="hover">
              Register
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
