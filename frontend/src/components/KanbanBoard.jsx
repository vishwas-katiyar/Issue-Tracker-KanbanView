import React from "react";
import { useIssues } from "../hooks/useIssues";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Snackbar,
  IconButton,
  useTheme,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

const STATUS = ["OPEN", "IN_PROGRESS", "CLOSED"];
const statusLabels = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  CLOSED: "Closed",
};
const statusColors = {
  OPEN: "info",
  IN_PROGRESS: "warning",
  CLOSED: "success",
};

export default function KanbanBoard({ onEditIssue }) {
  const { issues = [] } = useIssues();
  const queryClient = useQueryClient();
  const [error, setError] = React.useState("");
  const theme = useTheme();

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }) => {
      const issue = issues.find((i) => i.id === id);
      if (!issue) throw new Error("Issue not found");

      const payload = {
        title: issue.title,
        description: issue.description,
        priority: issue.priority,
        tags: issue.tags,
        team_id: issue.team_id,
        assigned_to: issue.assigned_to ?? null,
        status,
      };

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/issues/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to update issue");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["issues"]);
    },
    onError: (err) => {
      setError(err.message || "Unknown error");
    },
  });

  const handleDrop = React.useCallback(
    (id, newStatus) => {
      const issue = issues.find((i) => i.id === id);
      if (issue && issue.status !== newStatus) {
        updateStatus.mutate({ id, status: newStatus });
      }
    },
    [issues, updateStatus]
  );

  function IssueCard({ issue, onEdit }) {
    const [{ isDragging }, drag] = useDrag(
      () => ({
        type: "ISSUE",
        item: { id: issue.id, status: issue.status },
        collect: (monitor) => ({
          isDragging: monitor.isDragging(),
        }),
      }),
      [issue]
    );

    return (
      <Card
        ref={drag}
        variant="outlined"
        sx={{
          mb: 1.5,
          opacity: isDragging ? 0.6 : 1,
          cursor: "grab",
          borderRadius: 1,
          userSelect: "none",
          transition: "background-color 0.2s ease",
          "&:hover": {
            backgroundColor: theme.palette.action.hover,
          },
          position: "relative",
          boxShadow: "none",
        }}
      >
        <CardContent
          sx={{
            p: 2,
            pr: 6,
            "&:last-child": { pb: 2 },
          }}
        >
          <Typography
            variant="subtitle1"
            fontWeight={600}
            noWrap
            title={issue.title}
            sx={{ color: theme.palette.text.primary }}
          >
            {issue.title}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={issue.description}
          >
            {issue.description}
          </Typography>

          <Chip
            label={issue.priority}
            size="small"
            color={statusColors[issue.status]}
            sx={{ mt: 1 }}
            aria-label={`Priority: ${issue.priority}`}
          />

          <IconButton
            aria-label={`Edit issue ${issue.title}`}
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(issue);
            }}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: theme.palette.grey[600],
              "&:hover": { color: theme.palette.primary.main },
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </CardContent>
      </Card>
    );
  }

  function KanbanColumn({ status, issues, onDropIssue, onEditIssue }) {
    const [{ isOver }, drop] = useDrop(
      () => ({
        accept: "ISSUE",
        drop: (item) => {
          onDropIssue(item.id, status);
        },
        collect: (monitor) => ({
          isOver: monitor.isOver(),
        }),
      }),
      [status, onDropIssue]
    );

    return (
      <Box
        ref={drop}
        sx={{
          p: 2,
          minHeight: 350,
          bgcolor: isOver ? theme.palette.action.selected : "transparent",
          borderRadius: 1,
          border: "1px solid",
          borderColor: isOver
            ? theme.palette.primary.main
            : theme.palette.divider,
          display: "flex",
          flexDirection: "column",
          transition: "background-color 0.2s ease, border-color 0.2s ease",
        }}
      >
        <Typography
          variant="h6"
          sx={{ mb: 2, fontWeight: 600, color: theme.palette.text.primary }}
          component="h2"
        >
          {statusLabels[status]}
        </Typography>

        <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
          {issues.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              No issues here
            </Typography>
          ) : (
            issues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} onEdit={onEditIssue} />
            ))
          )}
        </Box>
      </Box>
    );
  }

  return (
    <>
      <DndProvider backend={HTML5Backend}>
        <Box
          sx={{
            p: { xs: 2, md: 0 },
            bgcolor: theme.palette.background.default,
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 700, color: theme.palette.text.primary }}
          >
            Kanban Board
          </Typography>

          <Grid container spacing={3}>
            {STATUS.map((status) => (
              <Grid item xs={12} md={4} key={status}>
                <KanbanColumn
                  status={status}
                  issues={issues.filter((i) => i.status === status)}
                  onDropIssue={handleDrop}
                  onEditIssue={onEditIssue}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      </DndProvider>

      <Snackbar
        open={Boolean(error)}
        onClose={() => setError("")}
        autoHideDuration={4000}
        message={error}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </>
  );
}
