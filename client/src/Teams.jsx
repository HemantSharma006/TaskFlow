import { useEffect, useState } from "react";
import "./Teams.css";

const API_URL =  "https://taskflow-lzcg.onrender.com/api";

function Teams() {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const [teamName, setTeamName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [addingMember, setAddingMember] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================
  // GET TOKEN
  // =========================

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // =========================
  // FETCH TEAMS
  // =========================

  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError("Please login again.");
        return;
      }

      const response = await fetch(`${API_URL}/teams`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch teams"
        );
      }

      const fetchedTeams = data.teams || [];

      setTeams(fetchedTeams);

      // Keep selected team updated
      if (selectedTeam) {
        const updatedTeam = fetchedTeams.find(
          (team) => team._id === selectedTeam._id
        );

        if (updatedTeam) {
          setSelectedTeam(updatedTeam);
        } else {
          setSelectedTeam(null);
        }
      }
    } catch (err) {
      console.error("Fetch teams error:", err);

      setError(
        err.message || "Failed to fetch teams"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOAD TEAMS
  // =========================

  useEffect(() => {
    fetchTeams();
  }, []);

  // =========================
  // CREATE TEAM
  // =========================

  const handleCreateTeam = async (e) => {
    e.preventDefault();

    if (!teamName.trim()) {
      setError("Team name is required.");
      return;
    }

    try {
      setCreating(true);
      setError("");
      setSuccess("");

      const token = getToken();

      if (!token) {
        throw new Error("Please login again.");
      }

      const response = await fetch(`${API_URL}/teams`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          teamName: teamName.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create team"
        );
      }

      const newTeam = data.team;

      setTeams((previousTeams) => [
        newTeam,
        ...previousTeams,
      ]);

      setSelectedTeam(newTeam);

      setTeamName("");
      setShowCreateForm(false);

      setSuccess("Team created successfully!");

      setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (err) {
      console.error("Create team error:", err);

      setError(
        err.message || "Failed to create team"
      );
    } finally {
      setCreating(false);
    }
  };

  // =========================
  // SELECT TEAM
  // =========================

  const handleSelectTeam = (team) => {
    setSelectedTeam(team);

    setShowMemberForm(false);
    setMemberEmail("");

    setError("");
    setSuccess("");
  };

  // =========================
  // ADD MEMBER
  // =========================

  const handleAddMember = async (e) => {
    e.preventDefault();

    if (!selectedTeam) {
      setError("Please select a team first.");
      return;
    }

    if (!memberEmail.trim()) {
      setError("Member email is required.");
      return;
    }

    try {
      setAddingMember(true);
      setError("");
      setSuccess("");

      const token = getToken();

      if (!token) {
        throw new Error("Please login again.");
      }

      const response = await fetch(
        `${API_URL}/teams/${selectedTeam._id}/members`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            email: memberEmail.trim().toLowerCase(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to add member"
        );
      }

      const updatedTeam = data.team;

      // Update selected team
      setSelectedTeam(updatedTeam);

      // Update team in list
      setTeams((previousTeams) =>
        previousTeams.map((team) =>
          team._id === updatedTeam._id
            ? updatedTeam
            : team
        )
      );

      setMemberEmail("");
      setShowMemberForm(false);

      setSuccess("Member added successfully!");

      setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (err) {
      console.error("Add member error:", err);

      setError(
        err.message || "Failed to add member"
      );
    } finally {
      setAddingMember(false);
    }
  };

  // =========================
  // GET INITIALS
  // =========================

  const getInitials = (name) => {
    if (!name) {
      return "U";
    }

    return name
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="teams-page">

        <div className="teams-loading">

          <div className="loading-spinner"></div>

          <h2>Loading teams...</h2>

          <p>
            Please wait while we load your teams.
          </p>

        </div>

      </div>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <div className="teams-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="teams-header">

        <div>

          <h1>Teams</h1>

          <p>
            Create teams and collaborate with your members.
          </p>

        </div>

        <button
          className="create-team-button"
          onClick={() => {
            setError("");
            setSuccess("");
            setShowCreateForm(true);
          }}
        >
          + New Team
        </button>

      </div>

      {/* =========================
          ERROR
      ========================= */}

      {error && (
        <div className="teams-error">
          {error}
        </div>
      )}

      {/* =========================
          SUCCESS
      ========================= */}

      {success && (
        <div className="teams-success">
          {success}
        </div>
      )}

      {/* =========================
          CREATE TEAM FORM
      ========================= */}

      {showCreateForm && (
        <div className="team-form-card">

          <div className="team-form-header">

            <div>

              <h2>Create New Team</h2>

              <p>
                Create a team and start collaborating.
              </p>

            </div>

            <button
              className="team-close-button"
              type="button"
              onClick={() => {
                setShowCreateForm(false);
                setTeamName("");
              }}
            >
              ×
            </button>

          </div>

          <form onSubmit={handleCreateTeam}>

            <div className="team-form-group">

              <label>
                Team Name
              </label>

              <input
                type="text"
                placeholder="Enter team name"
                value={teamName}
                onChange={(e) =>
                  setTeamName(e.target.value)
                }
                autoFocus
                required
              />

            </div>

            <div className="team-form-actions">

              <button
                type="button"
                className="team-cancel-button"
                onClick={() => {
                  setShowCreateForm(false);
                  setTeamName("");
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="create-team-submit"
                disabled={creating}
              >
                {creating
                  ? "Creating..."
                  : "Create Team"}
              </button>

            </div>

          </form>

        </div>
      )}

      {/* =========================
          NO TEAMS
      ========================= */}

      {teams.length === 0 ? (

        <div className="empty-teams">

          <div className="empty-team-icon">
            👥
          </div>

          <h2>
            No teams yet
          </h2>

          <p>
            Create your first team to start collaborating.
          </p>

          <button
            className="create-team-button"
            onClick={() => {
              setError("");
              setShowCreateForm(true);
            }}
          >
            + Create Team
          </button>

        </div>

      ) : (

        <div className="teams-layout">

          {/* =========================
              LEFT TEAM LIST
          ========================= */}

          <div className="teams-list-section">

            <h2>
              Your Teams
            </h2>

            <div className="teams-list">

              {teams.map((team) => (

                <button
                  key={team._id}
                  className={`team-list-card ${
                    selectedTeam?._id === team._id
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    handleSelectTeam(team)
                  }
                >

                  <div className="team-avatar">

                    {team.teamName
                      ? team.teamName
                          .substring(0, 2)
                          .toUpperCase()
                      : "TM"}

                  </div>

                  <div className="team-list-info">

                    <strong>
                      {team.teamName}
                    </strong>

                    <span>

                      {team.members?.length || 0} member
                      {(team.members?.length || 0) !== 1
                        ? "s"
                        : ""}

                    </span>

                  </div>

                </button>

              ))}

            </div>

          </div>

          {/* =========================
              RIGHT SIDE
          ========================= */}

          {selectedTeam ? (

            <div className="team-details-card">

              {/* HEADER */}

              <div className="team-details-header">

                <div className="team-title-area">

                  <div className="team-large-avatar">

                    {selectedTeam.teamName
                      ? selectedTeam.teamName
                          .substring(0, 2)
                          .toUpperCase()
                      : "TM"}

                  </div>

                  <div>

                    <h2>
                      {selectedTeam.teamName}
                    </h2>

                    <p>

                      {selectedTeam.members?.length || 0} member
                      {(selectedTeam.members?.length || 0) !== 1
                        ? "s"
                        : ""}

                    </p>

                  </div>

                </div>

                <button
                  className="add-member-button"
                  onClick={() => {
                    setError("");
                    setSuccess("");
                    setShowMemberForm(true);
                  }}
                >
                  + Add Member
                </button>

              </div>

              {/* =========================
                  ADD MEMBER FORM
              ========================= */}

              {showMemberForm && (

                <form
                  className="member-form"
                  onSubmit={handleAddMember}
                >

                  <label>
                    Member Email
                  </label>

                  <div className="member-form-row">

                    <input
                      type="email"
                      placeholder="Enter registered user's email"
                      value={memberEmail}
                      onChange={(e) =>
                        setMemberEmail(e.target.value)
                      }
                      autoFocus
                      required
                    />

                    <button
                      type="submit"
                      disabled={addingMember}
                    >
                      {addingMember
                        ? "Adding..."
                        : "Add"}
                    </button>

                    <button
                      type="button"
                      className="member-cancel"
                      onClick={() => {
                        setShowMemberForm(false);
                        setMemberEmail("");
                      }}
                    >
                      Cancel
                    </button>

                  </div>

                </form>

              )}

              {/* =========================
                  MEMBERS
              ========================= */}

              <div className="members-section">

                <h3>
                  Team Members
                </h3>

                {selectedTeam.members?.length > 0 ? (

                  selectedTeam.members.map((member) => {

                    const isCreator =
                      selectedTeam.createdBy?._id ===
                      member._id;

                    return (
                      <div
                        className="member-card"
                        key={member._id}
                      >

                        <div className="member-avatar">
                          {getInitials(member.name)}
                        </div>

                        <div className="member-info">

                          <strong>
                            {member.name || "Unknown User"}
                          </strong>

                          <span>
                            {member.email || "No email"}
                          </span>

                        </div>

                        <div className="member-role">

                          {isCreator ? (

                            <span className="creator-badge">
                              Creator
                            </span>

                          ) : (

                            <span className="member-badge">
                              {member.role || "Member"}
                            </span>

                          )}

                        </div>

                      </div>
                    );
                  })

                ) : (

                  <div className="no-members">
                    No members found.
                  </div>

                )}

              </div>

            </div>

          ) : (

            <div className="team-no-selection">

              <div className="team-no-selection-icon">
                👥
              </div>

              <h2>
                Select a team
              </h2>

              <p>
                Select a team from the left to view its
                members and details.
              </p>

            </div>

          )}

        </div>

      )}

    </div>
  );
}

export default Teams;