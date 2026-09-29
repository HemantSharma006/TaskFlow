import { useCallback, useEffect, useState } from "react";

import Login from "./Login";
import Signup from "./Signup";
import Projects from "./Projects";
import MyTasks from "./MyTasks";
import Teams from "./Teams";
import Activity from "./Activity";
import Settings from "./Settings";

import "./App.css";

const API_URL = "https://taskflow-lzcg.onrender.com/api";

// =====================================================
// API HELPER
// =====================================================

const apiRequest = async (endpoint, token, options = {}) => {
  const controller = new AbortController();

  // Prevent the UI from waiting forever if Render is slow/unavailable.
  const timeout = setTimeout(() => {
    controller.abort();
  }, 15000);

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    let data = {};

    try {
      data = await response.json();
    } catch {
      data = {};
    }

    return {
      response,
      data,
    };
  } finally {
    clearTimeout(timeout);
  }
};

function App() {
  // =====================================================
  // USER / LOGIN SESSION
  // =====================================================

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");

    // If one exists without the other, the session is invalid.
    if (!savedUser || !savedToken) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      return null;
    }

    try {
      return JSON.parse(savedUser);
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      return null;
    }
  });

  // =====================================================
  // LOGIN / SIGNUP
  // =====================================================

  const [showSignup, setShowSignup] = useState(false);

  // =====================================================
  // NAVIGATION
  // =====================================================

  const [currentPage, setCurrentPage] = useState("dashboard");

  // =====================================================
  // TASK DATA
  // =====================================================

  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  // =====================================================
  // PROJECT DATA
  // =====================================================

  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  // =====================================================
  // BACKEND / SESSION ERROR
  // =====================================================

  const [backendError, setBackendError] = useState(false);

  // =====================================================
  // LOGOUT HELPER
  // =====================================================

  const clearSession = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setTasks([]);
    setProjects([]);
    setShowSignup(false);
    setCurrentPage("dashboard");
  }, []);

  // =====================================================
  // FETCH TASKS
  // =====================================================

  const fetchTasks = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    try {
      setTasksLoading(true);
      setBackendError(false);

      const { response, data } = await apiRequest(
        "/tasks",
        token,
        {
          method: "GET",
        }
      );

      // Token expired / invalid.
      if (response.status === 401 || response.status === 403) {
        console.warn("Authentication token expired.");
        clearSession();
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch tasks"
        );
      }

      setTasks(Array.isArray(data.tasks) ? data.tasks : []);
    } catch (error) {
      console.error("Task fetch error:", error);

      // Don't remove the user's session just because
      // the backend is temporarily slow.
      if (error.name === "AbortError") {
        console.warn("Task request timed out.");
      }

      setTasks([]);
      setBackendError(true);
    } finally {
      setTasksLoading(false);
    }
  }, [clearSession]);

  // =====================================================
  // FETCH PROJECTS
  // =====================================================

  const fetchProjects = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    try {
      setProjectsLoading(true);
      setBackendError(false);

      const { response, data } = await apiRequest(
        "/projects",
        token,
        {
          method: "GET",
        }
      );

      // Token expired / invalid.
      if (response.status === 401 || response.status === 403) {
        console.warn("Authentication token expired.");
        clearSession();
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch projects"
        );
      }

      setProjects(
        Array.isArray(data.projects)
          ? data.projects
          : []
      );
    } catch (error) {
      console.error("Project fetch error:", error);

      if (error.name === "AbortError") {
        console.warn("Project request timed out.");
      }

      setProjects([]);
      setBackendError(true);
    } finally {
      setProjectsLoading(false);
    }
  }, [clearSession]);

  // =====================================================
  // LOAD DATA AFTER LOGIN
  //
  // IMPORTANT:
  // Tasks and projects are fetched only once here.
  // We removed the duplicate dashboard effect.
  // =====================================================

  useEffect(() => {
    if (!user) {
      return;
    }

    // Run both requests in parallel.
    fetchTasks();
    fetchProjects();
  }, [user, fetchTasks, fetchProjects]);

  // =====================================================
  // TASK UPDATE LISTENER
  // =====================================================

  useEffect(() => {
    const handleTaskUpdate = () => {
      if (user) {
        fetchTasks();
      }
    };

    window.addEventListener(
      "taskflowTasksUpdated",
      handleTaskUpdate
    );

    window.addEventListener(
      "storage",
      handleTaskUpdate
    );

    return () => {
      window.removeEventListener(
        "taskflowTasksUpdated",
        handleTaskUpdate
      );

      window.removeEventListener(
        "storage",
        handleTaskUpdate
      );
    };
  }, [user, fetchTasks]);

  // =====================================================
  // PROJECT UPDATE LISTENER
  // =====================================================

  useEffect(() => {
    const handleProjectUpdate = () => {
      if (user) {
        fetchProjects();
      }
    };

    window.addEventListener(
      "taskflowProjectsUpdated",
      handleProjectUpdate
    );

    return () => {
      window.removeEventListener(
        "taskflowProjectsUpdated",
        handleProjectUpdate
      );
    };
  }, [user, fetchProjects]);

  // =====================================================
  // TASK STATISTICS
  // =====================================================

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.status === "Done"
  ).length;

  const currentTasks = tasks.filter(
    (task) => task.status !== "Done"
  ).length;

  // =====================================================
  // TODAY'S DATE
  // =====================================================

  const getLocalDateString = () => {
    const date = new Date();

    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const today = getLocalDateString();

  // =====================================================
  // OVERDUE TASKS
  // =====================================================

  const overdueTasks = tasks.filter((task) => {
    if (!task.dueDate) {
      return false;
    }

    const taskDate = new Date(task.dueDate);

    if (Number.isNaN(taskDate.getTime())) {
      return false;
    }

    const year = taskDate.getFullYear();

    const month = String(
      taskDate.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      taskDate.getDate()
    ).padStart(2, "0");

    const dueDate = `${year}-${month}-${day}`;

    return (
      dueDate < today &&
      task.status !== "Done"
    );
  }).length;

  // =====================================================
  // TODAY'S TASKS
  // =====================================================

  const todayTasks = tasks.filter((task) => {
    if (!task.dueDate) {
      return false;
    }

    const taskDate = new Date(task.dueDate);

    if (Number.isNaN(taskDate.getTime())) {
      return false;
    }

    const year = taskDate.getFullYear();

    const month = String(
      taskDate.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      taskDate.getDate()
    ).padStart(2, "0");

    const taskDueDate = `${year}-${month}-${day}`;

    return taskDueDate === today;
  });

  // =====================================================
  // PROJECT STATISTICS
  // =====================================================

  const activeProjects = projects.length;

  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    setShowSignup(false);
    setCurrentPage("dashboard");
    setBackendError(false);
  };

  // =====================================================
  // SIGNUP
  // =====================================================

  const handleSignup = (newUser) => {
    setUser(newUser);
    setShowSignup(false);
    setCurrentPage("dashboard");
    setBackendError(false);
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    clearSession();
  };

  // =====================================================
  // NOT LOGGED IN
  // =====================================================

  if (!user) {
    if (showSignup) {
      return (
        <Signup
          onSignupSuccess={handleSignup}
          onBackToLogin={() =>
            setShowSignup(false)
          }
        />
      );
    }

    return (
      <Login
        onLogin={handleLogin}
        onSignup={() =>
          setShowSignup(true)
        }
      />
    );
  }

  // =====================================================
  // USER INITIALS
  // =====================================================

  const userInitials = user.name
    ? user.name
        .split(" ")
        .filter(Boolean)
        .map((word) => word[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "U";

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
        "Task"
      );
    }

    const project = projects.find(
      (item) => item._id === task.projectID
    );

    return project
      ? project.projectName
      : "Task";
  };

  // =====================================================
  // RETRY BACKEND
  // =====================================================

  const handleRetry = () => {
    setBackendError(false);

    fetchTasks();
    fetchProjects();
  };

  // =====================================================
  // LOGGED-IN UI
  // =====================================================

  return (
    <div className="app">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="sidebar">

        {/* BRAND */}

        <div className="brand">

          <div className="brand-icon">
            ✓
          </div>

          <div>
            <h2>TaskFlow</h2>
            <span>Workspace</span>
          </div>

        </div>

        {/* NAVIGATION */}

        <nav className="sidebar-nav">

          <p className="nav-title">
            MAIN
          </p>

          {/* OVERVIEW */}

          <button
            className={`nav-item ${
              currentPage === "dashboard"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setCurrentPage("dashboard")
            }
          >
            <span>⌂</span>
            Overview
          </button>

          {/* MY TASKS */}

          <button
            className={`nav-item ${
              currentPage === "tasks"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setCurrentPage("tasks")
            }
          >
            <span>✓</span>
            My Tasks
          </button>

          {/* PROJECTS */}

          <button
            className={`nav-item ${
              currentPage === "projects"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setCurrentPage("projects")
            }
          >
            <span>▣</span>
            Projects
          </button>

          <p className="nav-title workspace-title">
            WORKSPACE
          </p>

          {/* TEAMS */}

          <button
            className={`nav-item ${
              currentPage === "teams"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setCurrentPage("teams")
            }
          >
            <span>♟</span>
            Teams
          </button>

          {/* ACTIVITY */}

          <button
            className={`nav-item ${
              currentPage === "activity"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setCurrentPage("activity")
            }
          >
            <span>◷</span>
            Activity
          </button>

          {/* SETTINGS */}

          <button
            className={`nav-item ${
              currentPage === "settings"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setCurrentPage("settings")
            }
          >
            <span>⚙</span>
            Settings
          </button>

        </nav>

        {/* SIDEBAR BOTTOM */}

        <div className="sidebar-bottom">

          <div className="profile">

            <div className="avatar">
              {userInitials}
            </div>

            <div className="profile-info">

              <strong>
                {user.name}
              </strong>

              <span>
                {user.email}
              </span>

            </div>

            <div className="more">
              •••
            </div>

          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </aside>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="main">

        {/* =================================================
            DASHBOARD
        ================================================= */}

        {currentPage === "dashboard" && (

          <>

            {/* TOPBAR */}

            <div className="topbar">

              <div className="search">

                <span>
                  ⌕
                </span>

                <input
                  type="text"
                  placeholder="Search tasks, projects..."
                />

              </div>

              <div className="top-actions">

                <button className="notification">
                  ♧
                  <span className="notification-dot"></span>
                </button>

                <button
                  className="new-task"
                  onClick={() =>
                    setCurrentPage("tasks")
                  }
                >
                  + New Task
                </button>

                <div className="user-avatar">
                  {userInitials}
                </div>

              </div>

            </div>

            {/* HEADER */}

            <section className="page-header">

              <h1>
                Good to see you,{" "}
                {user.name?.split(" ")[0] ||
                  "User"}!
              </h1>

              <p>
                Here's what's happening with
                your projects today.
              </p>

            </section>

            {/* BACKEND STATUS */}

            {backendError && (
              <div
                style={{
                  marginBottom: "20px",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  background: "#3b2714",
                  border: "1px solid #5a3b1c",
                  color: "#ffad2f",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "15px",
                  fontSize: "13px",
                }}
              >
                <span>
                  The server is taking longer than
                  usual. Your dashboard is still
                  available.
                </span>

                <button
                  onClick={handleRetry}
                  style={{
                    padding: "7px 12px",
                    borderRadius: "7px",
                    background: "#28e875",
                    color: "#06130b",
                    fontWeight: "700",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Retry
                </button>
              </div>
            )}

            {/* =================================================
                STATISTICS
            ================================================= */}

            <section className="stats">

              {/* ACTIVE PROJECTS */}

              <div className="stat-card">

                <div className="stat-top">

                  <div className="stat-icon green">
                    ▣
                  </div>

                  <span className="change positive">
                    Live
                  </span>

                </div>

                <p>
                  Active Projects
                </p>

                <h2>
                  {projectsLoading
                    ? "..."
                    : activeProjects}
                </h2>

              </div>

              {/* TOTAL TASKS */}

              <div className="stat-card">

                <div className="stat-top">

                  <div className="stat-icon purple">
                    ✓
                  </div>

                  <span className="change positive">
                    Total
                  </span>

                </div>

                <p>
                  Total Tasks
                </p>

                <h2>
                  {tasksLoading
                    ? "..."
                    : totalTasks}
                </h2>

              </div>

              {/* COMPLETED TASKS */}

              <div className="stat-card">

                <div className="stat-top">

                  <div className="stat-icon orange">
                    ◷
                  </div>

                  <span className="change positive">
                    Done
                  </span>

                </div>

                <p>
                  Completed Tasks
                </p>

                <h2>
                  {tasksLoading
                    ? "..."
                    : completedTasks}
                </h2>

              </div>

              {/* OVERDUE TASKS */}

              <div className="stat-card">

                <div className="stat-top">

                  <div className="stat-icon red">
                    !
                  </div>

                  <span className="change negative">
                    Attention
                  </span>

                </div>

                <p>
                  Overdue Tasks
                </p>

                <h2>
                  {tasksLoading
                    ? "..."
                    : overdueTasks}
                </h2>

              </div>

            </section>

            {/* =================================================
                TASK OVERVIEW
            ================================================= */}

            <section className="section">

              <div className="section-heading">

                <div>

                  <h2>
                    Task Overview
                  </h2>

                  <p>
                    Your current and completed tasks
                  </p>

                </div>

                <button
                  onClick={() =>
                    setCurrentPage("tasks")
                  }
                >
                  View All
                </button>

              </div>

              <div className="tasks-card">

                {tasksLoading ? (

                  <div
                    className="task-row"
                    style={{
                      justifyContent:
                        "center",
                    }}
                  >
                    <div className="task-info">
                      <h3>
                        Loading tasks...
                      </h3>

                      <span>
                        The dashboard is loading
                        your latest tasks.
                      </span>
                    </div>
                  </div>

                ) : tasks.length === 0 ? (

                  <div
                    className="task-row"
                    style={{
                      justifyContent:
                        "center",
                    }}
                  >

                    <div className="task-info">

                      <h3>
                        No tasks yet
                      </h3>

                      <span>
                        Create a task to get
                        started.
                      </span>

                    </div>

                  </div>

                ) : (

                  tasks
                    .slice(0, 5)
                    .map((task) => (

                      <div
                        className="task-row"
                        key={task._id}
                      >

                        <div
                          className={`task-check ${
                            task.status === "Done"
                              ? "completed"
                              : ""
                          }`}
                        >
                          {task.status === "Done"
                            ? "✓"
                            : ""}
                        </div>

                        <div className="task-info">

                          <h3>
                            {task.title}
                          </h3>

                          <span>
                            {getProjectName(task)}
                          </span>

                        </div>

                        <div
                          className={`status ${
                            task.status === "Done"
                              ? "completed-status"
                              : task.status ===
                                "In Progress"
                              ? "progress-status"
                              : "todo-status"
                          }`}
                        >
                          {task.status || "To Do"}
                        </div>

                      </div>

                    ))

                )}

              </div>

            </section>

            {/* =================================================
                CURRENT PROJECTS
            ================================================= */}

            <section className="section">

              <div className="section-heading">

                <div>

                  <h2>
                    Current Projects
                  </h2>

                  <p>
                    Your active projects
                  </p>

                </div>

                <button
                  onClick={() =>
                    setCurrentPage("projects")
                  }
                >
                  View All
                </button>

              </div>

              <div className="projects-grid">

                {projectsLoading ? (

                  <div className="create-project">

                    <div className="create-icon">
                      ...
                    </div>

                    <h3>
                      Loading Projects
                    </h3>

                    <p>
                      Please wait while your
                      projects load.
                    </p>

                  </div>

                ) : projects.length === 0 ? (

                  <div className="create-project">

                    <div className="create-icon">
                      +
                    </div>

                    <h3>
                      No Projects Yet
                    </h3>

                    <p>
                      Create your first project
                      to get started.
                    </p>

                  </div>

                ) : (

                  projects
                    .slice(0, 3)
                    .map(
                      (project, index) => (

                        <div
                          className="project-card"
                          key={project._id}
                        >

                          <div className="project-card-top">

                            <div
                              className={`project-icon ${
                                index % 3 === 0
                                  ? "purple-bg"
                                  : index % 3 === 1
                                  ? "orange-bg"
                                  : "green-bg"
                              }`}
                            >
                              {project.projectName
                                ?.substring(
                                  0,
                                  2
                                )
                                .toUpperCase()}
                            </div>

                            <span className="due">

                              {project.deadline
                                ? `Due ${new Date(
                                    project.deadline
                                  ).toLocaleDateString(
                                    "en-US",
                                    {
                                      month:
                                        "short",
                                      day: "numeric",
                                    }
                                  )}`
                                : "No deadline"}

                            </span>

                          </div>

                          <h3>
                            {project.projectName}
                          </h3>

                          <p className="project-description">
                            {project.description ||
                              "No description provided."}
                          </p>

                          <div className="project-members">

                            <div className="member">
                              {project.teamID
                                ?.teamName
                                ?.substring(
                                  0,
                                  2
                                )
                                .toUpperCase() ||
                                "TM"}
                            </div>

                          </div>

                        </div>

                      )
                    )

                )}

              </div>

            </section>

            {/* =================================================
                TODAY'S TASKS
            ================================================= */}

            <section className="section">

              <div className="section-heading">

                <div>

                  <h2>
                    Today's Tasks
                  </h2>

                  <p>
                    Tasks scheduled for today
                  </p>

                </div>

                <button
                  onClick={() =>
                    setCurrentPage("tasks")
                  }
                >
                  View All
                </button>

              </div>

              <div className="tasks-card">

                {tasksLoading ? (

                  <div
                    className="task-row"
                    style={{
                      justifyContent:
                        "center",
                    }}
                  >

                    <div className="task-info">

                      <h3>
                        Loading today's tasks...
                      </h3>

                      <span>
                        Please wait.
                      </span>

                    </div>

                  </div>

                ) : todayTasks.length === 0 ? (

                  <div
                    className="task-row"
                    style={{
                      justifyContent:
                        "center",
                    }}
                  >

                    <div className="task-info">

                      <h3>
                        No tasks for today
                      </h3>

                      <span>
                        You're all caught up.
                      </span>

                    </div>

                  </div>

                ) : (

                  todayTasks
                    .slice(0, 5)
                    .map((task) => (

                      <div
                        className="task-row"
                        key={task._id}
                      >

                        <div
                          className={`task-check ${
                            task.status === "Done"
                              ? "completed"
                              : ""
                          }`}
                        >
                          {task.status === "Done"
                            ? "✓"
                            : ""}
                        </div>

                        <div className="task-info">

                          <h3>
                            {task.title}
                          </h3>

                          <span>
                            {getProjectName(task)}
                          </span>

                        </div>

                        <div
                          className={`status ${
                            task.status === "Done"
                              ? "completed-status"
                              : task.status ===
                                "In Progress"
                              ? "progress-status"
                              : "todo-status"
                          }`}
                        >
                          {task.status || "To Do"}
                        </div>

                      </div>

                    ))

                )}

              </div>

            </section>

          </>

        )}

        {/* =================================================
            PROJECTS
        ================================================= */}

        {currentPage === "projects" && (
          <Projects />
        )}

        {/* =================================================
            MY TASKS
        ================================================= */}

        {currentPage === "tasks" && (
          <MyTasks />
        )}

        {/* =================================================
            TEAMS
        ================================================= */}

        {currentPage === "teams" && (
          <Teams />
        )}

        {/* =================================================
            ACTIVITY
        ================================================= */}

        {currentPage === "activity" && (
          <Activity />
        )}

        {/* =================================================
            SETTINGS
        ================================================= */}

        {currentPage === "settings" && (
          <Settings />
        )}

      </main>

    </div>
  );
}

export default App;