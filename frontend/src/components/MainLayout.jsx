import React from "react";
import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";

export default function MainLayout({ children, user, logout, navigate }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <AppBar
        position="sticky"
        color="transparent"
        elevation={1}
        sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}
      >
        <Toolbar sx={{ mx: "auto", width: "100%" }}>
          <Typography
            variant="h6"
            noWrap
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              color: "text.primary",
              userSelect: "none",
            }}
          >
            Kanban Issue Tracker
          </Typography>

          {/* Add Team and Logout buttons here */}
          <Box>
            <Button
              color="primary"
              variant="outlined"
              onClick={() => navigate("/team")}
              sx={{ mr: 2 }}
            >
              Team
            </Button>
            {user && (
              <Button color="secondary" variant="contained" onClick={logout}>
                Logout
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1 }}>{children}</Box>
    </Box>
  );
}
