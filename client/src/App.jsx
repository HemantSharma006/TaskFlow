import { useEffect, useState } from "react";

import Login from "./Login";
import Signup from "./Signup";
import Projects from "./Projects";
import MyTasks from "./MyTasks";
import Teams from "./Teams";
import Activity from "./Activity";
import Settings from "./Settings";

import "./App.css";

function App() {
  // =========================
  // CHECK LOGIN SESSION
  // =========================

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        return null;
      }
    }

    return null;
  });

  // =========================
  // LOGIN / SIGNUP STATE
  // =========================

  const [showSignup, setShowSignup] = useState(false);

  // =========================
  // PAGE NAVIGATION
  // =========================

  const [currentPage, setCurrentPage] = useState("dashboard");

  // =========================
  // TASK DATA
  // =========================

  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem("taskflow_tasks");

    if (!savedTasks) {
      return [];
    }

    try {
      return JSON.parse(savedTasks);
    } catch {
      localStorage.removeItem("taskflow_tasks");
      return [];
    }
  });

  // =========================
  // PROJECT DATA
  // =========================

  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  // =========================
  // KEEP DASHBOARD IN SYNC
  // =========================

  useEffect(() => {
    const loadTasks = () => {
      const savedTasks =
        localStorage.getItem("taskflow_tasks");

      if (!savedTasks) {
        setTasks([]);
        return;
      }

      try {
        setTasks(JSON.parse(savedTasks));
      } catch {
        setTasks([]);
      }
    };

    window.addEventListener(
      "taskflowTasksUpdated",
      loadTasks
    );

    window.addEventListener(
      "storage",
      loadTasks
    );

    return () => {
      window.removeEventListener(
        "taskflowTasksUpdated",
        loadTasks
      );

      window.removeEventListener(
        "storage",
        loadTasks
      );
    };
  }, []);

  // =========================
  // FETCH PROJECTS
  // =========================

  const fetchProjects = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    try {
      setProjectsLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/projects",
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
          data.message || "Failed to fetch projects"
        );
      }

      setProjects(data.projects || []);
    } catch (error) {
      console.error(
        "Dashboard project fetch error:",
        error
      );

      setProjects([]);
    } finally {
      setProjectsLoading(false);
    }
  };

  // Load projects whenever user is logged in
  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  // Refresh projects when returning to dashboard
  useEffect(() => {
    if (user && currentPage === "dashboard") {
      fetchProjects();
    }
  }, [currentPage]);

  // =========================
  // TASK STATISTICS
  // =========================

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.status === "Done"
  ).length;

  const today = new Date()
    .toISOString()
    .split("T")[0];

  const overdueTasks = tasks.filter(
    (task) =>
      task.dueDate &&
      task.dueDate < today &&
      task.status !== "Done"
  ).length;

  const todayTasks = tasks.filter(
    (task) => task.dueDate === today
  );

  // =========================
  // PROJECT STATISTICS
  // =========================

  const activeProjects = projects.length;

  // =========================
  // LOGIN
  // =========================

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    setShowSignup(false);
    setCurrentPage("dashboard");
  };

  // =========================
  // SIGNUP SUCCESS
  // =========================

  const handleSignup = (newUser) => {
    setUser(newUser);
    setShowSignup(false);
    setCurrentPage("dashboard");
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setProjects([]);
    setShowSignup(false);
    setCurrentPage("dashboard");
  };

  // =========================
  // NOT LOGGED IN
  // =========================

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

  // =========================
  // USER INITIALS
  // =========================

  const userInitials = user.name
    ? user.name
        .split(" ")
        .filter(Boolean)
        .map((word) => word[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "U";

  // =========================
  // LOGGED IN UI
  // =========================

  return (
    <div className="app">

      {/* =========================
          SIDEBAR
      ========================= */}

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

      {/* =========================
          MAIN CONTENT
      ========================= */}

      <main className="main">

        {/* =========================
            DASHBOARD
        ========================= */}

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
                {user.name?.split(" ")[0] || "User"}!
              </h1>

              <p>
                Here's what's happening with
                your projects today.
              </p>

            </section>

            {/* =========================
                STATISTICS
            ========================= */}

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
                  {totalTasks}
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
                  {completedTasks}
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
                  {overdueTasks}
                </h2>

              </div>

            </section>

            {/* =========================
                CURRENT PROJECTS
            ========================= */}

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

                {projects.length === 0 ? (

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

                  projects.slice(0, 3).map(
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
                              ?.substring(0, 2)
                              .toUpperCase()}
                          </div>

                          <span className="due">
                            {project.deadline
                              ? `Due ${new Date(
                                  project.deadline
                                ).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
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
                            {project.teamID?.teamName
                              ?.substring(0, 2)
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

            {/* =========================
                TODAY'S TASKS
            ========================= */}

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

                {todayTasks.length === 0 ? (

                  <div
                    className="task-row"
                    style={{
                      justifyContent: "center",
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
                        key={task.id}
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
                            {task.projectName ||
                              "Task"}
                          </span>

                        </div>

                        <div
                          className={`status ${
                            task.status ===
                            "Done"
                              ? "completed-status"
                              : task.status ===
                                "In Progress"
                              ? "progress-status"
                              : "todo-status"
                          }`}
                        >
                          {task.status ||
                            "To Do"}
                        </div>

                      </div>

                    ))

                )}

              </div>

            </section>

          </>

        )}

        {/* =========================
            PROJECTS PAGE
        ========================= */}

        {currentPage === "projects" && (
          <Projects />
        )}

        {/* =========================
            MY TASKS PAGE
        ========================= */}

        {currentPage === "tasks" && (
          <MyTasks />
        )}

        {/* =========================
            TEAMS PAGE
        ========================= */}

        {currentPage === "teams" && (
          <Teams />
        )}

        {/* =========================
            ACTIVITY PAGE
        ========================= */}

        {currentPage === "activity" && (
          <Activity />
        )}

        {/* =========================
            SETTINGS PAGE
        ========================= */}

        {currentPage === "settings" && (
          <Settings />
        )}

      </main>

    </div>
  );
}

export default App;