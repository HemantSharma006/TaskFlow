import { useEffect, useState } from "react";
import "./Activity.css";

const API_URL = "http://localhost:5000/api";

function Activity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // GET TOKEN
  // =========================

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // =========================
  // FETCH ACTIVITY
  // =========================

  const fetchActivity = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError("Please login again.");
        return;
      }

      const response = await fetch(
        `${API_URL}/activity`,
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
          data.message || "Failed to fetch activity"
        );
      }

      setActivities(data.activities || []);
    } catch (err) {
      console.error("Fetch activity error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOAD ACTIVITY
  // =========================

  useEffect(() => {
    fetchActivity();
  }, []);

  // =========================
  // FORMAT DATE
  // =========================

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    const activityDate = new Date(date);

    return activityDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // =========================
  // FORMAT TIME
  // =========================

  const formatTime = (date) => {
    if (!date) {
      return "";
    }

    const activityDate = new Date(date);

    return activityDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // =========================
  // ACTIVITY ICON
  // =========================

  const getActivityIcon = (action) => {
    const value = action
      ? action.toLowerCase()
      : "";

    if (value.includes("create")) {
      return "+";
    }

    if (
      value.includes("complete") ||
      value.includes("done")
    ) {
      return "✓";
    }

    if (
      value.includes("comment") ||
      value.includes("message")
    ) {
      return "C";
    }

    if (
      value.includes("delete") ||
      value.includes("remove")
    ) {
      return "×";
    }

    if (
      value.includes("update") ||
      value.includes("edit")
    ) {
      return "↻";
    }

    return "•";
  };

  // =========================
  // ACTIVITY CLASS
  // =========================

  const getActivityClass = (action) => {
    const value = action
      ? action.toLowerCase()
      : "";

    if (value.includes("create")) {
      return "activity-create";
    }

    if (
      value.includes("complete") ||
      value.includes("done")
    ) {
      return "activity-complete";
    }

    if (
      value.includes("delete") ||
      value.includes("remove")
    ) {
      return "activity-delete";
    }

    if (
      value.includes("comment") ||
      value.includes("message")
    ) {
      return "activity-comment";
    }

    return "activity-update";
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="activity-page">
        <div className="activity-header">
          <div>
            <h1>Activity</h1>
            <p>
              Track recent activity in your workspace.
            </p>
          </div>
        </div>

        <div className="activity-empty">
          <div className="activity-loading">
            Loading activity...
          </div>
        </div>
      </div>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <div className="activity-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="activity-header">
        <div>
          <h1>Activity</h1>

          <p>
            Track recent activity in your workspace.
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={fetchActivity}
        >
          ↻ Refresh
        </button>
      </div>

      {/* =========================
          ERROR
      ========================= */}

      {error && (
        <div className="activity-error">
          {error}
        </div>
      )}

      {/* =========================
          EMPTY STATE
      ========================= */}

      {!error && activities.length === 0 && (
        <div className="activity-empty">
          <div className="empty-activity-icon">
            •
          </div>

          <h2>No activity yet</h2>

          <p>
            Your recent workspace activity will
            appear here.
          </p>
        </div>
      )}

      {/* =========================
          ACTIVITY LIST
      ========================= */}

      {activities.length > 0 && (
        <div className="activity-card">

          <div className="activity-card-header">
            <div>
              <h2>Recent Activity</h2>

              <p>
                Your latest workspace actions
              </p>
            </div>

            <span className="activity-count">
              {activities.length}
            </span>
          </div>

          <div className="activity-list">

            {activities.map((activity) => (
              <div
                className="activity-item"
                key={activity._id}
              >

                {/* ICON */}

                <div
                  className={`activity-icon ${getActivityClass(
                    activity.action
                  )}`}
                >
                  {getActivityIcon(
                    activity.action
                  )}
                </div>

                {/* CONTENT */}

                <div className="activity-content">

                  <div className="activity-title-row">

                    <h3>
                      {activity.action}
                    </h3>

                    <span>
                      {formatDate(
                        activity.createdAt
                      )}
                    </span>

                  </div>

                  <p>
                    {activity.description}
                  </p>

                  {/* RELATED PROJECT */}

                  {activity.projectID && (
                    <span className="activity-related">
                      Project:{" "}
                      {activity.projectID.projectName}
                    </span>
                  )}

                  {/* RELATED TASK */}

                  {activity.taskID && (
                    <span className="activity-related">
                      Task:{" "}
                      {activity.taskID.title}
                    </span>
                  )}

                  <span className="activity-time">
                    {formatTime(
                      activity.createdAt
                    )}
                  </span>

                </div>

              </div>
            ))}

          </div>
        </div>
      )}

    </div>
  );
}

export default Activity;