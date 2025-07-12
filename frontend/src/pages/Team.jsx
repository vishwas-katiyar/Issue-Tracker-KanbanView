import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Alert,
  CircularProgress,
  Paper,
  Container,
  Divider,
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";

function fetchTeam(token) {
  return fetch(`${import.meta.env.VITE_API_URL}/team`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch team");
    return res.json();
  });
}

function inviteTeammate(token, email) {
  return fetch(`${import.meta.env.VITE_API_URL}/invite`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ email }),
  }).then((res) => {
    if (!res.ok) throw new Error("Invite failed");
    return res.json();
  });
}

export default function Team() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const queryClient = useQueryClient();

  const {
    data: team,
    isLoading,
    error,
  } = useQuery(["team"], () => fetchTeam(token));

  const [email, setEmail] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");

  const mutation = useMutation((email) => inviteTeammate(token, email), {
    onSuccess: () => {
      setInviteSuccess("Invitation sent successfully!");
      setInviteError("");
      setEmail("");
      queryClient.invalidateQueries(["team"]);
    },
    onError: (err) => {
      setInviteError(err.message);
      setInviteSuccess("");
    },
  });

  const handleInvite = (e) => {
    e.preventDefault();
    setInviteError("");
    setInviteSuccess("");
    mutation.mutate(email);
  };

  return (
    <MainLayout user={user} logout={logout} navigate={navigate}>
      <Container maxWidth="sm" sx={{ mt: 8, mb: 8 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Team Management
        </Typography>

        <Paper
          elevation={3}
          sx={{
            p: 3,
            mb: 5,
            borderRadius: 2,
            boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Invite a Teammate
          </Typography>
          <Box component="form" onSubmit={handleInvite} noValidate>
            <TextField
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              required
              size="small"
              sx={{ mb: 2 }}
              placeholder="example@domain.com"
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={mutation.isLoading}
            >
              {mutation.isLoading ? "Sending Invite..." : "Send Invite"}
            </Button>
          </Box>

          {inviteError && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {inviteError}
            </Alert>
          )}
          {inviteSuccess && (
            <Alert severity="success" sx={{ mt: 3 }}>
              {inviteSuccess}
            </Alert>
          )}
        </Paper>

        <Typography variant="h6" fontWeight={600} gutterBottom>
          Team Members
        </Typography>

        {isLoading && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: 4,
              mb: 4,
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error.message}
          </Alert>
        )}

        <Paper
          variant="outlined"
          sx={{
            maxHeight: 400,
            overflowY: "auto",
            borderRadius: 2,
          }}
        >
          <List disablePadding>
            {team && team.length > 0 ? (
              team.map((member) => (
                <React.Fragment key={member.id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>{member.email.charAt(0).toUpperCase()}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={member.email}
                      secondary={
                        member.status.charAt(0).toUpperCase() +
                        member.status.slice(1).toLowerCase()
                      }
                    />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))
            ) : (
              <Typography
                sx={{ p: 3, textAlign: "center", color: "text.secondary" }}
              >
                No team members found.
              </Typography>
            )}
          </List>
        </Paper>
      </Container>
    </MainLayout>
  );
}
