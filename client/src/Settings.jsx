import { useState } from "react";
import "./Settings.css";

function Settings() {
  const savedUser = localStorage.getItem("user");

  let currentUser = {};

  try {
    currentUser = savedUser ? JSON.parse(savedUser) : {};
  } catch {
    currentUser = {};
  }

  const [name, setName] = useState(currentUser.name || "");
  const [email] = useState(currentUser.email || "");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // =====================================================
  // USER INITIALS
  // =====================================================

  const userInitials = name
    ? name
        .split(" ")
        .filter(Boolean)
        .map((word) => word[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "U";

  // =====================================================
  // OPEN EDIT MODAL
  // =====================================================

  const handleEdit = () => {
    setError("");
    setMessage("");

    setName(currentUser.name || "");

    setIsEditModalOpen(true);
  };

  // =====================================================
  // CLOSE EDIT MODAL
  // =====================================================

  const handleCancel = () => {
    setName(currentUser.name || "");

    setError("");
    setIsEditModalOpen(false);
  };

  // =====================================================
  // SAVE PROFILE
  // =====================================================

  const handleSave = async () => {
    setError("");
    setMessage("");

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Full name cannot be empty.");
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      if (!token) {
        setError(
          "Your session has expired. Please login again."
        );
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/auth/profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: trimmedName,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update profile"
        );
      }

      // Update localStorage
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      // Update local state
      setName(data.user.name);

      // Close modal
      setIsEditModalOpen(false);

      // Show success message
      setMessage("Profile updated successfully.");

      // Tell App.jsx user information changed
      window.dispatchEvent(
        new Event("taskflowUserUpdated")
      );

      setTimeout(() => {
        setMessage("");
      }, 3000);

    } catch (error) {
      console.error(
        "Update profile error:",
        error
      );

      setError(
        error.message ||
          "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="settings-header">

        <div>

          <div className="settings-label">
            WORKSPACE
          </div>

          <h1>Settings</h1>

          <p>
            Manage your account and workspace settings.
          </p>

        </div>

      </div>


      {/* =====================================================
          PROFILE CARD
      ===================================================== */}

      <div className="profile-settings-card">

        <div className="profile-glow"></div>

        <div className="profile-avatar">
          {userInitials}
        </div>

        <div className="profile-details">

          <h2>
            {name || "User"}
          </h2>

          <p>
            {email || "No email available"}
          </p>

          <span className="role-badge">
            ● {currentUser.role || "Member"}
          </span>

        </div>

        <div className="profile-status">

          <span className="status-dot"></span>

          Active

        </div>

      </div>


      {/* =====================================================
          PERSONAL INFORMATION
      ===================================================== */}

      <div className="settings-card">

        <div className="settings-card-header">

          <div className="card-icon purple-icon">
            👤
          </div>

          <div>

            <h2>
              Personal Information
            </h2>

            <p>
              View the information associated
              with your TaskFlow account.
            </p>

          </div>

        </div>


        <div className="settings-form">

          <div className="settings-form-grid">

            {/* NAME */}

            <div className="form-group">

              <label>
                Full Name
              </label>

              <div className="settings-value">
                {name || "No name available"}
              </div>

            </div>


            {/* EMAIL */}

            <div className="form-group">

              <label>
                Email Address
              </label>

              <div className="settings-value">
                {email || "No email available"}
              </div>

            </div>

          </div>


          {/* ROLE */}

          <div className="form-group role-group">

            <label>
              Account Role
            </label>

            <div className="role-display">

              <span className="role-display-icon">
                ♟
              </span>

              <div>

                <strong>
                  {currentUser.role || "Member"}
                </strong>

                <small>
                  Your workspace permissions
                </small>

              </div>

              <span className="role-locked">
                🔒
              </span>

            </div>

          </div>


          {/* EDIT BUTTON */}

          <div className="settings-actions">

            <button
              className="save-settings-button"
              onClick={handleEdit}
            >
              ✏️ Edit Profile
              <span>→</span>
            </button>

            {message && (
              <div className="settings-success">
                ✓ {message}
              </div>
            )}

          </div>

        </div>

      </div>


      {/* =====================================================
          WORKSPACE
      ===================================================== */}

      <div className="settings-card">

        <div className="settings-card-header">

          <div className="card-icon green-icon">
            ◈
          </div>

          <div>

            <h2>
              Workspace
            </h2>

            <p>
              Information about your TaskFlow
              workspace.
            </p>

          </div>

        </div>


        <div className="workspace-info">

          <div className="workspace-row">

            <div>

              <span className="workspace-label">
                Workspace Name
              </span>

              <small>
                Your current workspace
              </small>

            </div>

            <strong>
              TaskFlow
            </strong>

          </div>


          <div className="workspace-row">

            <div>

              <span className="workspace-label">
                Workspace Type
              </span>

              <small>
                Collaboration environment
              </small>

            </div>

            <strong>
              Team Workspace
            </strong>

          </div>


          <div className="workspace-row">

            <div>

              <span className="workspace-label">
                Account Role
              </span>

              <small>
                Your current access level
              </small>

            </div>

            <strong className="member-value">
              {currentUser.role || "Member"}
            </strong>

          </div>

        </div>

      </div>


      {/* =====================================================
          SECURITY
      ===================================================== */}

      <div className="settings-card security-card">

        <div className="settings-card-header">

          <div className="card-icon blue-icon">
            🔐
          </div>

          <div>

            <h2>
              Security
            </h2>

            <p>
              Keep your TaskFlow account secure.
            </p>

          </div>

        </div>


        <div className="security-row">

          <div>

            <strong>
              Account Password
            </strong>

            <span>
              Your password is securely protected.
            </span>

          </div>

          <span className="security-status">
            Protected
          </span>

        </div>

      </div>


      {/* =====================================================
          ACCOUNT INFORMATION
      ===================================================== */}

      <div className="danger-card">

        <div>

          <h3>
            Account Information
          </h3>

          <p>
            Your TaskFlow account and workspace
            information is stored securely.
          </p>

        </div>

        <span className="danger-icon">
          🔒
        </span>

      </div>


      {/* =====================================================
          EDIT PROFILE MODAL
      ===================================================== */}

      {isEditModalOpen && (

        <div
          className="settings-modal-overlay"
          onClick={handleCancel}
        >

          <div
            className="settings-modal"
            onClick={(e) => e.stopPropagation()}
          >

            {/* MODAL HEADER */}

            <div className="settings-modal-header">

              <div>

                <div className="modal-label">
                  ACCOUNT
                </div>

                <h2>
                  Edit Profile
                </h2>

                <p>
                  Update your personal information.
                </p>

              </div>

              <button
                className="settings-modal-close"
                onClick={handleCancel}
              >
                ×
              </button>

            </div>


            {/* MODAL BODY */}

            <div className="settings-modal-body">

              {/* NAME */}

              <div className="modal-form-group">

                <label>
                  Full Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="Enter your full name"
                  autoFocus
                />

              </div>


              {/* EMAIL */}

              <div className="modal-form-group">

                <label>
                  Email Address
                </label>

                <input
                  type="email"
                  value={email}
                  readOnly
                  disabled
                />

                <small>
                  Email address cannot be changed.
                </small>

              </div>


              {/* ROLE */}

              <div className="modal-form-group">

                <label>
                  Account Role
                </label>

                <div className="modal-role-display">

                  <span>
                    ♟
                  </span>

                  <div>

                    <strong>
                      {currentUser.role || "Member"}
                    </strong>

                    <small>
                      Your workspace permissions
                    </small>

                  </div>

                  <span className="modal-lock">
                    🔒
                  </span>

                </div>

              </div>


              {/* ERROR */}

              {error && (
                <div className="settings-error">
                  ✕ {error}
                </div>
              )}

            </div>


            {/* MODAL FOOTER */}

            <div className="settings-modal-footer">

              <button
                className="cancel-settings-button"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                className="save-settings-button"
                onClick={handleSave}
                disabled={saving}
              >

                {saving
                  ? "Saving..."
                  : "Save Changes"}

                {!saving && (
                  <span>→</span>
                )}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Settings;