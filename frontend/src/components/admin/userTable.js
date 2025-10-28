import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pencil, Trash } from "lucide-react";

function UserTable() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [updatedData, setUpdatedData] = useState({
    fullName: "",
    email: "",
    username: "",
    role: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await axios.get("http://localhost:5000/api/users");
    setUsers(res.data);
  };

  const handleEdit = (user) => {
    setEditingUser(user._id);
    setUpdatedData({
      fullName: user.fullName,
      email: user.email,
      username: user.username,
      role: user.role,
    });
  };

  const handleSave = async (id) => {
    await axios.put(`http://localhost:5000/api/users/${id}`, updatedData);
    setEditingUser(null);
    fetchUsers();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await axios.delete(`http://localhost:5000/api/users/${id}`);
      fetchUsers();
    }
  };

  return (
    <div className="userTableContainer">
      <table className="userTable">
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Email</th>
            <th>Username</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>
                {editingUser === user._id ? (
                  <input
                    className="admin-input-field"
                    type="text"
                    value={updatedData.fullName}
                    onChange={(e) =>
                      setUpdatedData({
                        ...updatedData,
                        fullName: e.target.value,
                      })
                    }
                  />
                ) : (
                  user.fullName
                )}
              </td>
              <td>
                {editingUser === user._id ? (
                  <input
                    className="admin-input-field"
                    type="email"
                    value={updatedData.email}
                    onChange={(e) =>
                      setUpdatedData({
                        ...updatedData,
                        email: e.target.value,
                      })
                    }
                  />
                ) : (
                  user.email
                )}
              </td>
              <td>
                {editingUser === user._id ? (
                  <input
                    className="admin-input-field"
                    type="text"
                    value={updatedData.username}
                    onChange={(e) =>
                      setUpdatedData({
                        ...updatedData,
                        username: e.target.value,
                      })
                    }
                  />
                ) : (
                  user.username
                )}
              </td>
              <td>
                {editingUser === user._id ? (
                  <select
                    className="admin-input-field"
                    value={updatedData.role}
                    onChange={(e) =>
                      setUpdatedData({
                        ...updatedData,
                        role: e.target.value,
                      })
                    }
                  >
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                  </select>
                ) : (
                  user.role
                )}
              </td>
              <td>
                {editingUser === user._id ? (
                  <button
                    className="saveBtn"
                    onClick={() => handleSave(user._id)}
                  >
                    Save
                  </button>
                ) : (
                  <button
                    className="editBtn"
                    onClick={() => handleEdit(user)}
                  >
                    <Pencil size={16} /> Edit
                  </button>
                )}
                <button
                  className="deleteBtn"
                  onClick={() => handleDelete(user._id)}
                >
                  <Trash size={16} /> Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserTable;
