import { useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import ProfileForm from "./ProfileSetting"; // Assuming ProfileForm is a separate component
import "bootstrap-icons/font/bootstrap-icons.css";
import BellButton from "../UIcomponents/bell";
import "./navbar.css";
import Learning from "../learning";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [showProfileForm, setShowProfileForm] = useState(false); // State to show/hide profile form
  const [loading, setLoading] = useState(true); // Loading state
  const navigate = useNavigate();

  const username = localStorage.getItem("username") || ""; // Fetch username from localStorage
  const isAuthenticated = localStorage.getItem("isAuthenticated"); // Check if user is authenticated

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isAuthenticated !== "true") {
          // Redirect to login page if not authenticated
          navigate("/login");
        } else {
          const response = await fetch(
            `http://192.168.1.9:8000/student_dashboard/${username}/`,
            {
              method: "GET",
              headers: {
                accept: "application/json",
                Authorization: "Basic c3R1ZGVudDE6cGFzc3dvcmQxMjM0", // Use your basic auth credentials
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            setData(data);
          } else {
            setError("Error fetching data");
            console.error("Error fetching dashboard data:", response.status);
          }
        }
      } catch (err) {
        setError("An error occurred while fetching data.");
        console.error("An error occurred:", err);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchData();
    }
  }, [username, isAuthenticated, navigate]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  // Function to handle logout
  const handleLogout = async () => {
    try {
      const response = await fetch("http://192.168.1.12:8000/logout/", {
        method: "POST",
        headers: {
          accept: "application/json",
          Authorization: "Basic c3R1ZGVudDE6cGFzc3dvcmQxMjM0", // Use basic auth credentials
        },
        credentials: "include",
      });

      if (response.ok) {
        localStorage.removeItem("token"); // Clear token from localStorage
        localStorage.removeItem("isAuthenticated"); // Clear authentication state
        navigate("/"); // Redirect to login page on successful logout
      } else {
        throw new Error("Logout failed");
      }
    } catch (err) {
      console.error("Logout failed:", err);
      setError("Logout failed. Please try again.");
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <a className="navbar-brand" href="/">
          <img
            src="\src\assets\pictures\abl_lms.jpg"
            alt="Logo"
            className="brand-logo"
          />
        </a>

        <div className="welcome-container">
          {data && data.profile ? (
            <h1 className="welcome-message">
              Welcome, {data.profile.name} - Class {data.profile.grade}
            </h1>
          ) : (
            <p>Loading...</p>
          )}
        </div>

        <div className="navbar-links">
          <Link to="/learning" className="nav-link">
            <BellButton />
          </Link>

          <Dropdown>
            <Dropdown.Toggle
              variant="none"
              id="dropdown-basic"
              className="dropdown-toggle"
            >
              <img
                src={
                  data.profile.profile_pic || "https://via.placeholder.com/40"
                }
                alt="Profile"
                className="profile-image"
              />
              <span>{data.profile.user.username}</span>
            </Dropdown.Toggle>
            <Dropdown.Menu align="end">
              <Dropdown.Item onClick={() => setShowProfileForm(true)}>
                Profile Settings
              </Dropdown.Item>
              <Dropdown.Item onClick={handleLogout}>Log Out</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>

      {/* Conditionally render ProfileForm when 'Profile Settings' is clicked */}
      {showProfileForm && (
        <ProfileForm
          username={data.profile.user.username}
          onClose={() => setShowProfileForm(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;
