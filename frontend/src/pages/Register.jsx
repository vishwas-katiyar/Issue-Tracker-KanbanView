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

export default function Register() {
  const { login } = useAuth(); // Hook called at top-level

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      
      
      const data = await res.json();
      console.log(data);
      
      if (!res.ok) throw new Error(data.detail);
      // Auto-login if possible, else fallback to login page
      if (data && data.id) {
        login(null, data);
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
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
          Register
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 3, textAlign: "center" }}
        >
          Create your account by filling in the information below.
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ width: "100%", mt: 1 }}
          noValidate
          aria-label="registration form"
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
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            inputProps={{ "aria-label": "email" }}
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
            autoComplete="new-password"
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
              "Register"
            )}
          </Button>
          <Typography variant="body2" align="center" sx={{ mt: 1 }}>
            Already have an account?{" "}
            <Link component={RouterLink} to="/login" underline="hover">
              Sign in
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
