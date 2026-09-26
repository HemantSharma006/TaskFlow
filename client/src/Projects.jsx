import { useEffect, useState } from "react";
import "./Projects.css";

// =====================================================
// BACKEND URL
// =====================================================

const API_URL = "https://taskflow-lzcg.onrender.com";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");

  const [creating, setCreating] = useState(false);

  // =====================================================
  // FETCH PROJECTS
  // =====================================================

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login again.");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/projects`,
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
      console.error("Fetch projects error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD PROJECTS WHEN PAGE OPENS
  // =====================================================

  useEffect(() => {
    fetchProjects();
  }, []);

  // =====================================================
  // CREATE PROJECT
  // =====================================================

  const handleCreateProject = async (e) => {
    e.preventDefault();

    setCreating(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please login again.");
      }

      // =================================================
      // GET USER'S TEAMS
      // =================================================

      const teamResponse = await fetch(
        `${API_URL}/api/teams`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const teamData = await teamResponse.json();

      if (!teamResponse.ok) {
        throw new Error(
          teamData.message || "Could not fetch teams"
        );
      }

      if (
        !teamData.teams ||
        teamData.teams.length === 0
      ) {
        throw new Error(
          "You must belong to a team before creating a project."
        );
      }

      // Use the first team for now
      const teamID = teamData.teams[0]._id;

      // =================================================
      // CREATE PROJECT
      // =================================================

      const response = await fetch(
        `${API_URL}/api/projects`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            projectName,
            teamID,
            description,
            deadline,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create project"
        );
      }

      // =================================================
      // ADD NEW PROJECT TO UI
      // =================================================

      setProjects((previousProjects) => [
        data.project,
        ...previousProjects,
      ]);

      // =================================================
      // RESET FORM
      // =================================================

      setProjectName("");
      setDescription("");
      setDeadline("");

      setShowForm(false);

    } catch (error) {
      console.error(
        "Create project error:",
        error
      );

      setError(error.message);
    } finally {
      setCreating(false);
    }
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "No deadline";
    }

    return new Date(date).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="projects-page">
        <div className="projects-loading">
          Loading projects...
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="projects-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="projects-header">

        <div>
          <h1>Projects</h1>

          <p>
            Manage and organize your team's projects.
          </p>
        </div>

        <button
          className="create-project-button"
          onClick={() => setShowForm(true)}
        >
          + New Project
        </button>

      </div>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="projects-error">
          {error}
        </div>
      )}


      {/* =================================================
          CREATE PROJECT FORM
      ================================================= */}

      {showForm && (
        <div className="project-form-card">

          <div className="form-header">

            <div>
              <h2>Create New Project</h2>

              <p>
                Add a new project to your team.
              </p>
            </div>

            <button
              className="close-form"
              onClick={() => setShowForm(false)}
            >
              ×
            </button>

          </div>


          <form onSubmit={handleCreateProject}>

            {/* PROJECT NAME */}

            <div className="project-form-group">

              <label>
                Project Name
              </label>

              <input
                type="text"
                placeholder="Enter project name"
                value={projectName}
                onChange={(e) =>
                  setProjectName(e.target.value)
                }
                required
              />

            </div>


            {/* DESCRIPTION */}

            <div className="project-form-group">

              <label>
                Description
              </label>

              <textarea
                placeholder="Describe your project"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                rows="4"
              />

            </div>


            {/* DEADLINE */}

            <div className="project-form-group">

              <label>
                Deadline
              </label>

              <input
                type="date"
                value={deadline}
                onChange={(e) =>
                  setDeadline(e.target.value)
                }
                required
              />

            </div>


            {/* FORM BUTTONS */}

            <div className="project-form-actions">

              <button
                type="button"
                className="cancel-button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-project-button"
                disabled={creating}
              >
                {creating
                  ? "Creating..."
                  : "Create Project"}
              </button>

            </div>

          </form>

        </div>
      )}


      {/* =================================================
          PROJECT LIST
      ================================================= */}

      {projects.length === 0 ? (

        <div className="empty-projects">

          <div className="empty-project-icon">
            +
          </div>

          <h2>
            No projects yet
          </h2>

          <p>
            Create your first project to get started.
          </p>

          <button
            onClick={() => setShowForm(true)}
          >
            Create Project
          </button>

        </div>

      ) : (

        <div className="projects-page-grid">

          {projects.map((project) => (

            <div
              className="project-page-card"
              key={project._id}
            >

              {/* PROJECT TOP */}

              <div className="project-page-card-top">

                <div className="project-page-icon">
                  {project.projectName
                    ?.substring(0, 2)
                    .toUpperCase()}
                </div>

                <span className="project-deadline">
                  Due {formatDate(project.deadline)}
                </span>

              </div>


              {/* PROJECT NAME */}

              <h2>
                {project.projectName}
              </h2>


              {/* DESCRIPTION */}

              <p className="project-page-description">
                {project.description ||
                  "No description provided."}
              </p>


              {/* PROJECT INFORMATION */}

              <div className="project-page-info">

                <div>

                  <span>
                    Team
                  </span>

                  <strong>
                    {project.teamID?.teamName ||
                      "Unknown Team"}
                  </strong>

                </div>


                <div>

                  <span>
                    Created by
                  </span>

                  <strong>
                    {project.createdBy?.name ||
                      "Unknown"}
                  </strong>

                </div>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default Projects;