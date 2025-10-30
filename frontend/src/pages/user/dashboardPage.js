import React, { useEffect, useState, useContext } from "react";
import {
  Briefcase,
  CheckCircle,
  Clock,
  FolderKanban,
  UserCheck,
} from "lucide-react";
import { AuthContext } from "../../contexts/authContext";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import "./projectManagementPage.css";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalProjects: 0,
    ongoingProjects: 0,
    completedProjects: 0,
    managedProjects: 0,
  });

  const COLORS = ["#1e3a8a", "#2563eb", "#10b981", "#f59e0b"];

  // Simulate backend data
  useEffect(() => {
    const fakeData = {
      totalProjects: 24,
      ongoingProjects: 10,
      completedProjects: 12,
      managedProjects: 5,
    };
    setStats(fakeData);
  }, []);

  const pieData = [
    { name: "Ongoing", value: stats.ongoingProjects },
    { name: "Completed", value: stats.completedProjects },
    { name: "Managed by You", value: stats.managedProjects },
  ];

  const barData = [
    { name: "Mon", tasks: 8 },
    { name: "Tue", tasks: 6 },
    { name: "Wed", tasks: 9 },
    { name: "Thu", tasks: 7 },
    { name: "Fri", tasks: 11 },
    { name: "Sat", tasks: 4 },
    { name: "Sun", tasks: 3 },
  ];

  return (
    <div className="pm-dashboard">
      <h2 className="pm-dashboard-title">Dashboard Overview</h2>

      {/* Summary Cards */}
      <div className="pm-cards-grid">
        <div className="pm-card">
          <div className="pm-card-icon total">
            <FolderKanban size={26} />
          </div>
          <div className="pm-card-info">
            <h4>{stats.totalProjects}</h4>
            <p>Total Projects</p>
          </div>
        </div>

        <div className="pm-card">
          <div className="pm-card-icon ongoing">
            <Clock size={26} />
          </div>
          <div className="pm-card-info">
            <h4>{stats.ongoingProjects}</h4>
            <p>Ongoing Projects</p>
          </div>
        </div>

        <div className="pm-card">
          <div className="pm-card-icon completed">
            <CheckCircle size={26} />
          </div>
          <div className="pm-card-info">
            <h4>{stats.completedProjects}</h4>
            <p>Completed Projects</p>
          </div>
        </div>

        <div className="pm-card">
          <div className="pm-card-icon managed">
            <UserCheck size={26} />
          </div>
          <div className="pm-card-info">
            <h4>{stats.managedProjects}</h4>
            <p>Managed by You</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="pm-charts-grid">
        {/* Project Distribution Chart */}
        <div className="pm-chart-card">
          <h3 className="pm-section-title">Project Status Overview</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="pm-chart-legend">
            {pieData.map((entry, index) => (
              <div key={index} className="pm-chart-legend-item">
                <span
                  className="pm-legend-color"
                  style={{ backgroundColor: COLORS[index] }}
                ></span>
                {entry.name}
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Progress Chart */}
        <div className="pm-chart-card">
          <h3 className="pm-section-title">Weekly Task Progress</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData} margin={{ top: 10, right: 20, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="tasks" fill="#1e3a8a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="pm-section">
        <h3 className="pm-section-title">Recent Activity</h3>
        <div className="pm-activity-list">
          <div className="pm-activity-item">
            <div className="pm-activity-icon">
              <Briefcase size={20} />
            </div>
            <p>
              <strong>Design Sprint</strong> was marked as{" "}
              <span className="completed-text">completed</span>.
            </p>
            <span className="pm-activity-time">2 hours ago</span>
          </div>

          <div className="pm-activity-item">
            <div className="pm-activity-icon">
              <UserCheck size={20} />
            </div>
            <p>
              <strong>{user?.username || "You"}</strong> assigned new tasks to the{" "}
              <strong>Website Revamp</strong> project.
            </p>
            <span className="pm-activity-time">4 hours ago</span>
          </div>

          <div className="pm-activity-item">
            <div className="pm-activity-icon">
              <FolderKanban size={20} />
            </div>
            <p>
              New project <strong>Mobile App Launch</strong> was created.
            </p>
            <span className="pm-activity-time">Yesterday</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
