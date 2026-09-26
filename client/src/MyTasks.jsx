import { useEffect, useState } from "react";
import "./MyTasks.css";

const API_URL = "https://taskflow-lzcg.onrender.com/api";

function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    projectID: "",
    priority: "Medium",
    dueDate: "",
    status: "To Do",
  });

  // =====================================================
  // COMMENTS STATE
  // =====================================================

  const [expandedComments, setExpandedComments] = useState({});
  const [comments, setComments] = useState({});
  const [commentsLoading, setCommentsLoading] = useState({});
  const [commentText, setCommentText] = useState({});
  const [commentSaving, setCommentSaving] = useState({});

  // =====================================================
  // GET TOKEN
  // =====================================================

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // =====================================================
  // FETCH PROJECTS
  // =====================================================

  const fetchProjects = async () => {
    try {
      const token = getToken();

      if (!token) {
        return;
      }

      const response = await fetch(`${API_URL}/projects`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch projects"
        );
      }

      setProjects(data.projects || []);
    } catch (err) {
      console.error("Fetch projects error:", err);
      setError(err.message);
    }
  };

  // =====================================================
  // FETCH MY TASKS
  // =====================================================

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError("Please login again.");
        return;
      }

      const response = await fetch(`${API_URL}/tasks`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch tasks"
        );
      }

      setTasks(data.tasks || []);
    } catch (err) {
      console.error("Fetch tasks error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, []);

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  // =====================================================
  // CREATE TASK
  // =====================================================

  const createTask = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      setError("Task title is required.");
      return;
    }

    if (!form.projectID) {
      setError("Please select a project.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError("Please login again.");
        return;
      }

      const response = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          projectID: form.projectID,
          priority: form.priority,
          dueDate: form.dueDate || null,
          status: form.status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create task"
        );
      }

      setTasks((previousTasks) => [
        data.task,
        ...previousTasks,
      ]);

      setForm({
        title: "",
        description: "",
        projectID: "",
        priority: "Medium",
        dueDate: "",
        status: "To Do",
      });

      setShowModal(false);
    } catch (err) {
      console.error("Create task error:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // UPDATE STATUS
  // =====================================================

  const updateStatus = async (id, status) => {
    try {
      setError("");

      const token = getToken();

      if (!token) {
        setError("Please login again.");
        return;
      }

      const response = await fetch(
        `${API_URL}/tasks/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update task"
        );
      }

      setTasks((previousTasks) =>
        previousTasks.map((task) =>
          task._id === id ? data.task : task
        )
      );
    } catch (err) {
      console.error("Update task error:", err);
      setError(err.message);
    }
  };

  // =====================================================
  // DELETE TASK
  // =====================================================

  const deleteTask = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const token = getToken();

      if (!token) {
        setError("Please login again.");
        return;
      }

      const response = await fetch(
        `${API_URL}/tasks/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete task"
        );
      }

      setTasks((previousTasks) =>
        previousTasks.filter(
          (task) => task._id !== id
        )
      );

      setComments((previousComments) => {
        const updated = { ...previousComments };
        delete updated[id];
        return updated;
      });
    } catch (err) {
      console.error("Delete task error:", err);
      setError(err.message);
    }
  };

  // =====================================================
  // FETCH COMMENTS
  // =====================================================

  const fetchComments = async (taskID) => {
    try {
      setCommentsLoading((previous) => ({
        ...previous,
        [taskID]: true,
      }));

      setError("");

      const token = getToken();

      if (!token) {
        setError("Please login again.");
        return;
      }

      const response = await fetch(
        `${API_URL}/comments/task/${taskID}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch comments"
        );
      }

      setComments((previous) => ({
        ...previous,
        [taskID]: data.comments || [],
      }));
    } catch (err) {
      console.error("Fetch comments error:", err);
      setError(err.message);
    } finally {
      setCommentsLoading((previous) => ({
        ...previous,
        [taskID]: false,
      }));
    }
  };

  // =====================================================
  // TOGGLE COMMENTS
  // =====================================================

  const toggleComments = async (taskID) => {
    const isOpen = expandedComments[taskID];

    setExpandedComments((previous) => ({
      ...previous,
      [taskID]: !isOpen,
    }));

    if (!isOpen && !comments[taskID]) {
      await fetchComments(taskID);
    }
  };

  // =====================================================
  // ADD COMMENT
  // =====================================================

  const addComment = async (taskID) => {
    const text = (commentText[taskID] || "").trim();

    if (!text) {
      setError("Comment cannot be empty.");
      return;
    }

    try {
      setCommentSaving((previous) => ({
        ...previous,
        [taskID]: true,
      }));

      setError("");

      const token = getToken();

      if (!token) {
        setError("Please login again.");
        return;
      }

      const response = await fetch(
        `${API_URL}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            taskID,
            commentText: text,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to add comment"
        );
      }

      setComments((previous) => ({
        ...previous,
        [taskID]: [
          ...(previous[taskID] || []),
          data.comment,
        ],
      }));

      setCommentText((previous) => ({
        ...previous,
        [taskID]: "",
      }));
    } catch (err) {
      console.error("Add comment error:", err);
      setError(err.message);
    } finally {
      setCommentSaving((previous) => ({
        ...previous,
        [taskID]: false,
      }));
    }
  };

  // =====================================================
  // DELETE COMMENT
  // =====================================================

  const deleteComment = async (commentID, taskID) => {
    const confirmed = window.confirm(
      "Delete this comment?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const token = getToken();

      if (!token) {
        setError("Please login again.");
        return;
      }

      const response = await fetch(
        `${API_URL}/comments/${commentID}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete comment"
        );
      }

      setComments((previous) => ({
        ...previous,
        [taskID]: (previous[taskID] || []).filter(
          (comment) => comment._id !== commentID
        ),
      }));
    } catch (err) {
      console.error("Delete comment error:", err);
      setError(err.message);
    }
  };

  // =====================================================
  // HANDLE COMMENT ENTER
  // =====================================================

  const handleCommentKeyDown = (e, taskID) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      addComment(taskID);
    }
  };

  // =====================================================
  // FILTER TASKS
  // =====================================================

  const filteredTasks =
    filter === "All"
      ? tasks
      : tasks.filter(
          (task) => task.status === filter
        );

  // =====================================================
  // PRIORITY CLASS
  // =====================================================

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "High":
        return "priority-high";

      case "Medium":
        return "priority-medium";

      default:
        return "priority-low";
    }
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return null;
    }

    const dateObject = new Date(date);

    return dateObject.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // =====================================================
  // GET PROJECT NAME
  // =====================================================

  const getProjectName = (task) => {
    if (
      task.projectID &&
      typeof task.projectID === "object"
    ) {
      return (
        task.projectID.projectName ||
        "Project"
      );
    }

    const project = projects.find(
      (item) => item._id === task.projectID
    );

    return project
      ? project.projectName
      : "Project";
  };

  // =====================================================
  // GET CURRENT USER
  // =====================================================

  const getCurrentUserId = () => {
    try {
      const user = JSON.parse(
        localStorage.getItem("user")
      );

      return user?._id || user?.id || null;
    } catch {
      return null;
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="tasks-page">
        <div className="empty-tasks">
          <h2>Loading tasks...</h2>

          <p>
            Please wait while we load your tasks.
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="tasks-page">

      {/* HEADER */}

      <div className="tasks-header">

        <div>
          <h1>My Tasks</h1>

          <p>
            View and manage tasks assigned to you.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => {
            setError("");
            fetchProjects();
            setShowModal(true);
          }}
        >
          + New Task
        </button>

      </div>

      {/* ERROR */}

      {error && (
        <div className="login-error">
          {error}
        </div>
      )}

      {/* FILTERS */}

      <div className="task-filters">

        {[
          "All",
          "To Do",
          "In Progress",
          "Done",
        ].map((item) => (

          <button
            key={item}
            className={`filter ${
              filter === item ? "active" : ""
            }`}
            onClick={() => setFilter(item)}
          >
            {item}
          </button>

        ))}

      </div>

      {/* TASK LIST */}

      {filteredTasks.length === 0 ? (

        <div className="empty-tasks">

          <div className="empty-icon">
            ✓
          </div>

          <h2>
            No tasks found
          </h2>

          <p>
            {filter === "All"
              ? "You don't have any tasks yet."
              : `You don't have any ${filter.toLowerCase()} tasks.`}
          </p>

          <button
            className="primary-button"
            onClick={() => {
              setError("");
              fetchProjects();
              setShowModal(true);
            }}
          >
            + Create Task
          </button>

        </div>

      ) : (

        <div className="task-list">

          {filteredTasks.map((task) => {

            const taskComments =
              comments[task._id] || [];

            const isCommentsOpen =
              expandedComments[task._id];

            const currentUserId =
              getCurrentUserId();

            return (
              <div
                className="task-card-wrapper"
                key={task._id}
              >

                <div className="task-card">

                  {/* CHECKBOX */}

                  <button
                    className={`task-checkbox ${
                      task.status === "Done"
                        ? "completed"
                        : ""
                    }`}
                    onClick={() =>
                      updateStatus(
                        task._id,
                        task.status === "Done"
                          ? "To Do"
                          : "Done"
                      )
                    }
                    title={
                      task.status === "Done"
                        ? "Mark as incomplete"
                        : "Mark as complete"
                    }
                  >
                    {task.status === "Done" && "✓"}
                  </button>

                  {/* CONTENT */}

                  <div className="task-content">

                    <div className="task-title-row">

                      <h3
                        className={
                          task.status === "Done"
                            ? "task-completed"
                            : ""
                        }
                      >
                        {task.title}
                      </h3>

                      <span
                        className={`priority ${getPriorityClass(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>

                    </div>

                    {task.description && (
                      <p className="task-description">
                        {task.description}
                      </p>
                    )}

                    <div className="task-meta">

                      <span>
                        📁 {getProjectName(task)}
                      </span>

                      {task.dueDate && (
                        <span>
                          📅 {formatDate(task.dueDate)}
                        </span>
                      )}

                      <select
                        value={task.status}
                        onChange={(e) =>
                          updateStatus(
                            task._id,
                            e.target.value
                          )
                        }
                      >
                        <option value="To Do">
                          To Do
                        </option>

                        <option value="In Progress">
                          In Progress
                        </option>

                        <option value="Done">
                          Done
                        </option>
                      </select>

                    </div>

                    {/* COMMENTS BUTTON */}

                    <button
                      className="comments-toggle"
                      onClick={() =>
                        toggleComments(task._id)
                      }
                    >
                      💬{" "}
                      {isCommentsOpen
                        ? "Hide Comments"
                        : "Comments"}

                      {comments[task._id] && (
                        <span className="comment-count">
                          {taskComments.length}
                        </span>
                      )}
                    </button>

                  </div>

                  {/* DELETE */}

                  <button
                    className="delete-task"
                    onClick={() =>
                      deleteTask(task._id)
                    }
                    title="Delete task"
                  >
                    ×
                  </button>

                </div>

                {/* =================================================
                    COMMENTS SECTION
                ================================================= */}

                {isCommentsOpen && (

                  <div className="comments-section">

                    <div className="comments-header">
                      <h3>
                        Comments
                      </h3>

                      <span>
                        {taskComments.length}{" "}
                        {taskComments.length === 1
                          ? "comment"
                          : "comments"}
                      </span>
                    </div>

                    {/* LOADING */}

                    {commentsLoading[task._id] ? (

                      <div className="comments-loading">
                        Loading comments...
                      </div>

                    ) : taskComments.length === 0 ? (

                      <div className="no-comments">
                        No comments yet. Be the first
                        to comment.
                      </div>

                    ) : (

                      <div className="comments-list">

                        {taskComments.map(
                          (comment) => {

                            const commentUser =
                              comment.userID;

                            const commentUserId =
                              typeof comment.userID ===
                              "object"
                                ? comment.userID?._id
                                : comment.userID;

                            const isOwner =
                              currentUserId &&
                              commentUserId &&
                              String(
                                commentUserId
                              ) ===
                                String(
                                  currentUserId
                                );

                            return (
                              <div
                                className="comment-card"
                                key={comment._id}
                              >

                                <div className="comment-avatar">
                                  {commentUser?.name
                                    ? commentUser.name
                                        .split(" ")
                                        .map(
                                          (word) =>
                                            word[0]
                                        )
                                        .join("")
                                        .substring(
                                          0,
                                          2
                                        )
                                        .toUpperCase()
                                    : "U"}
                                </div>

                                <div className="comment-body">

                                  <div className="comment-top">

                                    <strong>
                                      {commentUser?.name ||
                                        "User"}
                                    </strong>

                                    <span>
                                      {comment.createdAt
                                        ? new Date(
                                            comment.createdAt
                                          ).toLocaleString(
                                            "en-IN",
                                            {
                                              dateStyle:
                                                "medium",
                                              timeStyle:
                                                "short",
                                            }
                                          )
                                        : ""}
                                    </span>

                                  </div>

                                  <p>
                                    {comment.commentText}
                                  </p>

                                </div>

                                {isOwner && (
                                  <button
                                    className="delete-comment"
                                    onClick={() =>
                                      deleteComment(
                                        comment._id,
                                        task._id
                                      )
                                    }
                                    title="Delete comment"
                                  >
                                    ×
                                  </button>
                                )}

                              </div>
                            );
                          }
                        )}

                      </div>

                    )}

                    {/* ADD COMMENT */}

                    <div className="add-comment">

                      <textarea
                        value={
                          commentText[task._id] || ""
                        }
                        onChange={(e) =>
                          setCommentText(
                            (previous) => ({
                              ...previous,
                              [task._id]:
                                e.target.value,
                            })
                          )
                        }
                        onKeyDown={(e) =>
                          handleCommentKeyDown(
                            e,
                            task._id
                          )
                        }
                        placeholder="Write a comment..."
                        rows="2"
                      />

                      <button
                        className="comment-submit"
                        onClick={() =>
                          addComment(task._id)
                        }
                        disabled={
                          commentSaving[task._id]
                        }
                      >
                        {commentSaving[task._id]
                          ? "Adding..."
                          : "Add Comment"}
                      </button>

                    </div>

                  </div>

                )}

              </div>
            );
          })}

        </div>

      )}

      {/* =====================================================
          CREATE TASK MODAL
      ===================================================== */}

      {showModal && (

        <div
          className="modal-overlay"
          onClick={() =>
            setShowModal(false)
          }
        >

          <div
            className="task-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>
                <h2>
                  Create New Task
                </h2>

                <p>
                  Add a task to your workspace.
                </p>
              </div>

              <button
                className="close-modal"
                onClick={() =>
                  setShowModal(false)
                }
              >
                ×
              </button>

            </div>

            <form onSubmit={createTask}>

              <label>
                Task Title

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Enter task title"
                  autoFocus
                  required
                />
              </label>

              <label>
                Description

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the task..."
                  rows="4"
                />
              </label>

              <label>
                Project

                <select
                  name="projectID"
                  value={form.projectID}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select a project
                  </option>

                  {projects.map((project) => (
                    <option
                      key={project._id}
                      value={project._id}
                    >
                      {project.projectName}
                    </option>
                  ))}
                </select>
              </label>

              {projects.length === 0 && (
                <p
                  style={{
                    marginTop: "8px",
                    color: "#dc2626",
                    fontSize: "14px",
                  }}
                >
                  No projects available. Create a
                  project first.
                </p>
              )}

              <div className="form-row">

                <label>
                  Priority

                  <select
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                  >
                    <option value="Low">
                      Low
                    </option>

                    <option value="Medium">
                      Medium
                    </option>

                    <option value="High">
                      High
                    </option>
                  </select>
                </label>

                <label>
                  Status

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="To Do">
                      To Do
                    </option>

                    <option value="In Progress">
                      In Progress
                    </option>

                    <option value="Done">
                      Done
                    </option>
                  </select>
                </label>

              </div>

              <label>
                Due Date

                <input
                  type="date"
                  name="dueDate"
                  value={form.dueDate}
                  onChange={handleChange}
                />
              </label>

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={() =>
                    setShowModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={
                    saving ||
                    projects.length === 0
                  }
                >
                  {saving
                    ? "Creating..."
                    : "Create Task"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default MyTasks;