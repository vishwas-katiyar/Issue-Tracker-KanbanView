import React, { useState } from "react";
import {
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import MDEditor from "@uiw/react-md-editor";
import { useIssues } from "../hooks/useIssues";
import KanbanBoard from "../components/KanbanBoard";
import { useAuth } from "../context/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import MainLayout from "../components/MainLayout";

const STATUS_OPTIONS = [
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "CLOSED", label: "Closed" },
];

const PRIORITY_OPTIONS = [
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
];

export default function Dashboard() {
  const { issues, isLoading, error, createIssue } = useIssues();
  const queryClient = useQueryClient();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "OPEN",
    priority: "Medium",
    tags: "",
    assigned_to: "",
  });
  const [formError, setFormError] = useState("");
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [deleteError, setDeleteError] = useState("");
  const theme = useTheme();

  const updateIssue = useMutation(
    async ({ id, ...data }) => {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/issues/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(data),
        }
      );
      if (!res.ok) throw new Error("Issue not found or not owner");
      return res.json();
    },
    { onSuccess: () => queryClient.invalidateQueries(["issues"]) }
  );

  const deleteIssue = useMutation(
    async (id) => {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/issues/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (!res.ok) throw new Error("Failed to delete issue");
      return res.json();
    },
    { onSuccess: () => queryClient.invalidateQueries(["issues"]) }
  );

  const handleOpen = () => {
    setEditMode(false);
    setForm({
      title: "",
      description: "",
      status: "OPEN",
      priority: "Medium",
      tags: "",
      assigned_to: null,
    });
    setFormError("");
    setOpen(true);
  };

  const handleEdit = (issue) => {
    setEditMode(true);
    setEditingId(issue.id);
    setForm({
      title: issue.title,
      description: issue.description,
      status: issue.status,
      priority: issue.priority,
      tags: issue.tags,
      assigned_to: issue.assigned_to || null,
    });
    setFormError("");
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
    setEditingId(null);
    setForm({
      title: "",
      description: "",
      status: "OPEN",
      priority: "Medium",
      tags: "",
      assigned_to: "",
    });
    setFormError("");
    setDeleteError("");
  };

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(user);
    
    setFormError("");
    if (!user || !user.team_id) {
      setFormError(
        "You must be logged in with a valid team to create or update issues."
      );
      return;
    }
    try {
      const payload = { ...form, team_id: user.team_id };
      if (editMode) {
        await updateIssue.mutateAsync({ id: editingId, ...payload });
      } else {
        await createIssue.mutateAsync(payload);
      }
      handleClose();
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleDelete = async () => {
    setDeleteError("");
    try {
      await deleteIssue.mutateAsync(deleteDialog.id);
      setDeleteDialog({ open: false, id: null });
      if (editMode && deleteDialog.id === editingId) {
        handleClose();
      }
    } catch (err) {
      setDeleteError(err.message || "Failed to delete issue");
    }
  };

  return (
    <MainLayout user={user} logout={logout} navigate={navigate}>
      <Box sx={{ mx: "auto", p: { xs: 2, md: 3 } }}>
        <KanbanBoard onEditIssue={handleEdit} />

        <Box sx={{ mt: 3, mb: 3 }}>
          <Button variant="contained" onClick={handleOpen}>
            Add Issue
          </Button>
        </Box>

        {/* Loading and Error */}
        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
            <CircularProgress />
          </Box>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error.message}
          </Alert>
        )}

        {/* Create / Edit Issue Dialog */}
        <Dialog
          open={open}
          onClose={handleClose}
          maxWidth="sm"
          fullWidth
          aria-labelledby="issue-dialog-title"
        >
          <DialogTitle id="issue-dialog-title">
            {editMode ? "Edit Issue" : "Create Issue"}
          </DialogTitle>
          <DialogContent>
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                mt: 1,
                "& .MuiTextField-root": { mb: 2 },
              }}
              noValidate
              autoComplete="off"
            >
              <TextField
                required
                fullWidth
                label="Title"
                name="title"
                value={form.title}
                onChange={handleChange}
                variant="outlined"
                size="small"
              />

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Description
                </Typography>
                <Box
                  sx={{
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                    p: 1,
                  }}
                >
                  <MDEditor
                    value={form.description}
                    onChange={(val) =>
                      setForm((f) => ({ ...f, description: val || "" }))
                    }
                    height={140}
                  />
                </Box>
              </Box>

              <TextField
                select
                fullWidth
                label="Status"
                name="status"
                value={form.status}
                onChange={handleChange}
                variant="outlined"
                size="small"
              >
                {STATUS_OPTIONS.map(({ value, label }) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                fullWidth
                label="Priority"
                name="priority"
                value={form.priority}
                onChange={handleChange}
                variant="outlined"
                size="small"
              >
                {PRIORITY_OPTIONS.map(({ value, label }) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                label="Tags (comma separated)"
                name="tags"
                value={form.tags}
                onChange={handleChange}
                variant="outlined"
                size="small"
              />

              {formError && (
                <Alert severity="error" sx={{ mt: 1, mb: 0 }}>
                  {formError}
                </Alert>
              )}

              <DialogActions
                sx={{
                  px: 0,
                  pt: 1,
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Button onClick={handleClose}>Cancel</Button>
                  {editMode && (
                    <Button
                      color="error"
                      variant="outlined"
                      onClick={() =>
                        setDeleteDialog({ open: true, id: editingId })
                      }
                      sx={{ ml: 2 }}
                    >
                      Delete
                    </Button>
                  )}
                </Box>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={createIssue.isLoading || updateIssue.isLoading}
                >
                  {editMode ? "Update" : "Create"}
                </Button>
              </DialogActions>
            </Box>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog.open}
          onClose={() => {
            setDeleteDialog({ open: false, id: null });
            setDeleteError("");
          }}
          aria-labelledby="delete-dialog-title"
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle id="delete-dialog-title">Delete Issue</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this issue? This action cannot be
              undone.
            </Typography>
            {deleteError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {deleteError}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setDeleteDialog({ open: false, id: null });
                setDeleteError("");
              }}
            >
              Cancel
            </Button>
            <Button
              color="error"
              onClick={handleDelete}
              disabled={deleteIssue.isLoading}
              variant="contained"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MainLayout>
  );
}
