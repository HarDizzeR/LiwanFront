"use client";

import { useState, useEffect } from "react";
import { Moon, Sun, Home, History, LogOut, X } from "lucide-react";
import Link from "next/link";
import { ThemeProvider, useTheme } from "next-themes";
import {
  IconBrandSuperhuman,
  IconDashboard,
  IconPlus,
  IconBuildingBank,
  IconBuildingHospital,
  IconDeviceLaptop,
  IconUsers,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation"; // Add this import

function Modal({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        <style jsx global>{`
          select option {
            display: flex;
            align-items: center;
            padding: 0.5rem;
          }
          select option svg {
            margin-right: 0.5rem;
          }
        `}</style>
        {children}
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter(); // Initialize router here

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const themeIcon = mounted ? (
    theme === "dark" ? (
      <Sun size={20} />
    ) : (
      <Moon size={20} />
    )
  ) : null;

  // SEIF'S CODE TO LINK BACKEND WITH FRONTEND

  // SEIF'S CODE TO LINK BACKEND WITH FRONTEND

  const [isAdmin, setIsAdmin] = useState(false);
  const [employeeData, setEmployeeData] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [newDepartment, setNewDepartment] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // Track which type of modal to show
  const [managerData, setManagerData] = useState({
    emailOrExtension: '',
    departmentsManaged: '' // This will hold the selected department ID
  });

  // Function to open modal
  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  // Function to close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setNewDepartment(""); // Clear the department input when closing
    setManagerData({
      emailOrExtension: "",
      departmentsManaged: ""
    }); // Clear manager form on close
  };

  const decodeTokenPayload = (token) => {
    try {
      const base64Payload = token.split(".")[1];
      const decodedPayload = atob(base64Payload);
      return JSON.parse(decodedPayload);
    } catch (error) {
      console.error("Failed to decode token payload:", error);
      return null;
    }
  };

  useEffect(() => {
    const accessToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("accessToken"))
      ?.split("=")[1];

    if (accessToken) {
      const payload = decodeTokenPayload(accessToken);
      const employeeId = payload?.id;

      if (employeeId) {
        fetch("http://127.0.0.1:5000/api/v1/employees/", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
          .then((response) => response.json())
          .then((data) => {
            const employees = data?.data?.employees || [];
            const employee = employees.find((emp) => emp._id === employeeId);

            if (employee) {
              setEmployeeData(employee);
              setIsAdmin(employee.role === "admin");
            } else {
              console.error("Employee not found.");
            }
          })
          .catch((error) =>
            console.error("Error fetching employee data:", error)
          );
      } else {
        console.error("Invalid token payload. No employee ID found.");
      }
    } else {
      console.log("No access token found.");
    }
  }, []);

  // Fetch departments
  useEffect(() => {
    if (isAdmin) {
      fetch("http://127.0.0.1:5000/api/v1/departments/", {
        headers: {
          Authorization: `Bearer ${
            document.cookie
              .split("; ")
              .find((row) => row.startsWith("accessToken"))
              ?.split("=")[1]
          }`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          setDepartments(data?.data?.departments || []);
        })
        .catch((error) => console.error("Error fetching departments:", error));
    }
  }, [isAdmin]);

  // Create new department
  const handleAddDepartment = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/v1/departments/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              document.cookie
                .split("; ")
                .find((row) => row.startsWith("accessToken"))
                ?.split("=")[1]
            }`,
          },
          body: JSON.stringify({ name: newDepartment }), // Use newDepartment state
        }
      );

      if (response.ok) {
        // Department added successfully
        setNewDepartment(""); // Clear the input field
        closeModal(); // Close the modal
        // Refresh the department list
        const updatedDepartments = await fetchDepartments(); // Fetch updated departments
        setDepartments(updatedDepartments); // Update the state with new departments
      } else {
        console.error("Failed to add department:", response.statusText);
      }
    } catch (error) {
      console.error("Error adding department:", error);
    }
  };

  // Delete existing departments

  const handleDeleteManager = async (extensionsnumber) => {
    const test = JSON.stringify({emailOrExtension: `${extensionsnumber}`,departmentsManaged: []});
    console.log(test);
    try {
      const accessToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("accessToken"))
      ?.split("=")[1];
      const response = await fetch('http://127.0.0.1:5000/api/v1/employees/UpdateManagerDep', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({emailOrExtension: `${extensionsnumber}`,departmentsManaged: []}),
      });
  
      if (!response.ok) {
        throw new Error('Failed to create manager');
      }
  
      const data = await response.json();
      console.log('Manager created successfully:', data);
    
    } catch (error) {
      console.error('Error:', error);
      // Handle error (e.g., show a notification to the user)
    }
  };


  const handleDeleteDepartment = async (departmentId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this department?"
    );
    if (!confirmDelete) return; // If the user cancels the deletion, exit the function

    try {
      // Make the DELETE request to the API endpoint
      const response = await fetch(
        `http://127.0.0.1:5000/api/v1/departments/${departmentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${
              document.cookie
                .split("; ")
                .find((row) => row.startsWith("accessToken"))
                ?.split("=")[1]
            }`, // Add authorization if required
          },
        }
      );

      if (response.ok) {
        // Update the local state after successful deletion
        setDepartments((prevDepartments) =>
          prevDepartments.filter(
            (department) => department._id !== departmentId
          )
        );
        console.log("Department deleted successfully");
      } else {
        console.error("Failed to delete department:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting department:", error);
    }
  };

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/v1/departments/",
        {
          headers: {
            Authorization: `Bearer ${
              document.cookie
                .split("; ")
                .find((row) => row.startsWith("accessToken"))
                ?.split("=")[1]
            }`,
          },
        }
      );
      const data = await response.json();
      return data.data.departments; // Return the departments array
    } catch (error) {
      console.error("Error fetching departments:", error);
      return []; // Return an empty array on error
    }
  };
  // Fetch existing managers

  const [managers, setManagers] = useState([]);

  useEffect(() => {
    const accessToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("accessToken"))
      ?.split("=")[1];

    if (accessToken) {
      fetch("http://127.0.0.1:5000/api/v1/employees/", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          // Filter only the managers from the response
          const managers = data?.data?.employees.filter(
            (emp) => emp.role === "manager"
          );
          setManagers(managers);
        })
        .catch((error) => console.error("Error fetching managers:", error));
    }
  }, []);

console.log(managers);

  // Add Managers


  const handleManagerInputChange = (event) => {
    const { name, value } = event.target;
  
    setManagerData((prevData) => {
      const newData = {
        ...prevData,
        [name]: value,
      };
      return newData;
    });
  };
  
  // Function to handle adding a manager
  const handleAddManager = async (event) => {
    event.preventDefault();
  
    const managerDataToSend = {
      emailOrExtension: managerData.emailOrExtension,
      departmentsManaged: [managerData.departmentsManaged], // Send the department ID as an array
    };
    try {
      const accessToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("accessToken"))
      ?.split("=")[1];
      const response = await fetch('http://127.0.0.1:5000/api/v1/employees/UpdateManagerDep', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(managerDataToSend),
      });
  
      if (!response.ok) {
        throw new Error('Failed to create manager');
      }
  
      const data = await response.json();
      console.log('Manager created successfully:', data);
  
      // Reset form fields
      setManagerData({ emailOrExtension: '', departmentsManaged: '' });
      closeModal(); // Close the modal after successful creation
  
    } catch (error) {
      console.error('Error:', error);
      // Handle error (e.g., show a notification to the user)
    }
  };

  // Render access denied message for non-admins
  if (!isAdmin) {
    return (
      <div className="flex h-screen justify-center items-center text-center text-xl">
        <p>Access denied. Admins only.</p>
      </div>
    );
  }


  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full dark:bg-neutral-950 text-neutral-200 bg-Primary p-4 transition-all duration-300 ease-in-out z-10 flex flex-col ${
          isExpanded ? "w-[300px]" : "w-[72px]"
        }`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <div className="flex items-center mb-8">
          <Link href={"/Profile"} className="flex items-center">
            <img
              src="/Sidebar-icon.jpg"
              alt="Admin"
              className="w-10 h-10 rounded-full mr-3"
            />
            {isExpanded && <span className="text-xl font-semibold">Admin</span>}
          </Link>
        </div>
        <nav className="flex-grow">
          <SidebarItem
            icon={<Home size={20} />}
            label="Home"
            href="/user-main"
            isExpanded={isExpanded}
          />
          <SidebarItem
            icon={<History size={20} />}
            label="History"
            href="/ticket-history"
            isExpanded={isExpanded}
          />
          <SidebarItem
            icon={<LogOut size={20} />}
            label="Log out"
            href="/"
            isExpanded={isExpanded}
            onClick={() => {
              document.cookie =
              "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict";
              // Redirect to the login page
              router.push("/");
            }}
          />
        </nav>
        <button
          onClick={toggleTheme}
          className={`mt-auto w-full py-2 flex items-center hover:bg-gray-700 text-white hover:bg-opacity-80 transition-colors duration-300 rounded ${
            isExpanded ? "text-left" : "text-center"
          }`}
        >
          {themeIcon}
          {isExpanded && (
            <span className="ml-2">
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </span>
          )}
        </button>
      </aside>

      {/* Main content */}
      <main
        className={`flex-1 p-4 transition-all duration-300 dark:bg-Primary dark:text-neutral-200 bg-neutral-200 text-Primary h-fit ${
          isExpanded ? "ml-[300px]" : "ml-[72px]"
        }`}
      >
        <h1 className="text-2xl md:text-3xl font-bold mb-4 px-8 py-4">
          Dashboard
        </h1>

        {/* Managers Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4 px-8">Add Managers:</h2>
          <div className="grid md:grid-cols-3 grid-cols-1 gap-4 px-8 pt-4">
            {managers.map((manager) => (
              <div
                key={manager._id}
                className="border-2 dark:border-Primary border-neutral-200 shadow-lg rounded-lg duration-300 hover:shadow-xl p-4"
              >
                <div className="md:max-w-none max-w-full">
                  <h3 className="font-semibold text-xl truncate">
                    {manager.fname} {manager.lname}
                  </h3>
                  <p className="text-sm break-words">Email: {manager.email}</p>
                  <p className="text-sm break-words">
                    Ext number: {manager.extensionsnumber}
                  </p>
                  <div className="flex justify-end">
                    <button
                      className="bg-red-700 p-2 rounded-lg text-white font-semibold"
                      onClick={() => handleDeleteManager(manager.extensionsnumber)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add Manager Card */}
            <div className="border-2 dark:border-Primary border-neutral-200 shadow-lg rounded-lg hover:shadow-xl duration-300 p-4">
              <div className="flex justify-center items-center p-14">
                <button
                  className="flex justify-center items-center"
                  onClick={() => openModal("manager")}
                >
                  <IconPlus width={40} height={40} />
                  <span className="font-semibold px-4">
                    Add Managerial Access
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Departments Section */}
        <h2 className="text-xl font-semibold px-8 py-8">Add Departments:</h2>
        <div className="grid md:grid-cols-3 grid-cols-1 gap-4 px-8 pt-4">
          {departments.map((department) => (
            <div
              key={department._id}
              className="border-2 dark:border-Primary border-neutral-200 shadow-lg rounded-lg hover:shadow-xl duration-300 p-4"
            >
              <h3 className="font-semibold text-xl">{department.name}</h3>
              <div className="flex justify-center items-center p-4">
                <button className="flex justify-center items-center">
                  <IconBrandSuperhuman width={40} height={40} />
                </button>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => handleDeleteDepartment(department._id)} // Call delete function
                  className="bg-red-700 p-2 rounded-lg text-white font-semibold duration-300"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {/* Add Department Card */}
          <div className="border-2 dark:border-Primary border-neutral-200 shadow-lg rounded-lg hover:shadow-xl duration-300 p-4">
            <button
              onClick={() => openModal("department")}
              className="flex justify-center items-center"
            >
              <IconPlus width={40} height={40} />
              <span className="font-semibold px-4">Add Department</span>
            </button>
          </div>
        </div>
      </main>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={
          modalType === "manager" ? "Add New Manager" : "Add New Department"
        }
      >
        {modalType === "manager" ? (
          <form onSubmit={handleAddManager} className="space-y-4">
            <div>
              <label
                htmlFor="emailOrExtension"
                className="block text-sm font-semibold text-Primary dark:text-neutral-200"
              >
                Email or Extension
              </label>
              <input
                type="text"
                id="emailOrExtension"
                name="emailOrExtension"
                value={managerData.emailOrExtension}
                onChange={handleManagerInputChange}
                className="mt-1 dark:bg-neutral-200 bg-neutral-400 text-black dark:text-Primary p-1 block w-full rounded-md shadow-sm"
              />
            </div>
            <div>
              <label
                htmlFor="departmentsManaged"
                className="block text-sm font-semibold text-Primary dark:text-neutral-200"
              >
                Departments Managed
              </label>
              <select
                id="departmentsManaged"
                name="departmentsManaged"
                value={managerData.departmentsManaged}
                onChange={handleManagerInputChange}
                className="mt-1 dark:bg-neutral-200 bg-neutral-400 text-black dark:text-Primary p-1 block w-full rounded-md shadow-sm"
              >
                {departments.map((department, id) => (
                  <option key={id} value={department._id}>
                    {department.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-Primary text-white dark:bg-neutral-200 dark:text-Primary hover:dark:bg-neutral-300 hover:bg-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Add Manager
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleAddDepartment} className="space-y-4">
            <div>
              <label
                htmlFor="department"
                className="block text-sm font-semibold text-Primary dark:text-neutral-200"
              >
                Department
              </label>
              <input
                type="text"
                id="department"
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                className="mt-1 block w-full bg-neutral-700 text-white dark:bg-neutral-300 dark:text-Primary p-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                placeholder="Enter department name"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-Primary text-neutral-200 hover:bg-neutral-700 dark:bg-neutral-200 dark:text-Primary hover:dark:bg-neutral-400 rounded-md"
              >
                Add Department
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

function SidebarItem({
  icon,
  label,
  href,
  isExpanded,
  onClick
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  isExpanded: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      className="flex items-center mb-1 hover:text-white cursor-pointer transition-colors duration-300 px-4 py-1" onClick={onClick}
    >
      <div className="w-8">{icon}</div>
      <span
        className={`ml-2 ${
          isExpanded ? "opacity-100" : "opacity-0 w-0"
        } transition-all duration-300`}
      >
        {label}
      </span>
    </Link>
  );
}

export default function Page() {
  return (
    <ThemeProvider attribute="class">
      <AdminDashboard />
    </ThemeProvider>
  );
}
