"use client";

import { useState, useEffect, SetStateAction } from "react";
import {
  Moon,
  Sun,
  Home,
  History,
  ChevronUp,
  ChevronDown,
  X,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ThemeProvider, useTheme } from "next-themes";
import { useRouter } from "next/navigation"; // Add this import

export function TicketManagement() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showPending, setShowPending] = useState(true);
  const ticketsPerPage = 4;
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter(); // Initialize router here

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedTicket(null);
  };

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setIsPopupOpen(true);
  };

  // SEIF'S CODE TO LINK FRONTEND WITH BACKEND

  const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState("all");
  const [employeeData, setEmployeeData] = useState(null);
  const [ticketsData, setTicketsData] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [sortByDate, setSortByDate] = useState(false);

  const getButtonText = () => {
    if (view === "all") return "Show Pending";
    if (view === "pending") return "Show Completed";
    return "Show All Tickets";
  };

  // Function to toggle through view states
  const toggleView = () => {
    setView((prevView) => {
      if (prevView === "all") return "pending";
      if (prevView === "pending") return "completed";
      return "all";
    });
  };

  // Function to decode JWT payload
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

  // Fetch employee data to check authorization

  useEffect(() => {
    const accessToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("accessToken"))
      ?.split("=")[1];

    if (accessToken) {
      const payload = decodeTokenPayload(accessToken);
      const employeeId = payload?.id; // Get the employee ID from the token payload

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

              // Fetch tickets if the user is an admin
              if (employee.role === "admin") {
                fetch("http://127.0.0.1:5000/api/v1/tickets", {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                  },
                })
                  .then((response) => response.json())
                  .then((ticketData) => {
                    setTicketsData(ticketData?.data?.tickets || []);
                  })
                  .catch((error) =>
                    console.error("Error fetching tickets data:", error)
                  );
              }
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

  const departments = Array.from(
    new Set(ticketsData.map((ticket) => ticket.assignedTo.name))
  );

  useEffect(() => {
    if (isAdmin) {
      const filtered = ticketsData.filter((ticket) => {
        const statusMatch =
          view === "all" ||
          (view === "completed" && ticket.status === "completed") ||
          (view === "pending" && ticket.status === "pending");
        const departmentMatch =
          selectedDepartment === "All" ||
          ticket.assignedTo.name === selectedDepartment;
        return statusMatch && departmentMatch;
      });
  
      // Sort the filtered tickets by creation date
      const sortedTickets = filtered.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return sortByDate ? dateA - dateB : dateB - dateA; // sort order based on sortByDate
      });
  
      setFilteredTickets(sortedTickets);
    }
  }, [view, selectedDepartment, ticketsData, isAdmin, sortByDate]);

  // Render access denied message for non-admins
  if (!isAdmin) {
    return (
      <div className="flex h-screen justify-center items-center text-center text-xl">
        <p>Access denied. Admins only.</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-Primary text-neutral-200">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-Primary dark:bg-neutral-950 text-neutral-200 transition-all duration-300 ease-in-out z-10 flex flex-col ${
          isExpanded ? "w-[300px]" : "w-[72px]"
        }`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <div className="flex items-center p-4 mb-8">
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
            href="#"
            isExpanded={isExpanded}
          />
          <SidebarItem
            icon={<LayoutDashboard size={20} />}
            label="Admin Dashboard"
            href="/admin-dashboard"
            isExpanded={isExpanded}
          />
          <SidebarItem
            icon={<LogOut size={20} />}
            label="Log Out"
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
          className={`mt-auto w-full py-4 flex items-center justify-center bg-primary-foreground text-primary hover:bg-slate-200 hover:text-Primary rounded-sm transition-colors duration-300`}
        >
          {mounted && theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          {isExpanded && (
            <span className="ml-2">
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </span>
          )}
        </button>
      </aside>

      {/* Main content */}
      <main
        className={`flex-1 p-8 overflow-auto dark:bg-Primary bg-neutral-200 text-Primary dark:text-neutral-200 transition-all duration-300 ease-in-out ${
          isExpanded ? "ml-[300px]" : "ml-[60px]"
        }`}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">History</h1>
            <button
              onClick={toggleView}
              className="px-4 py-2 bg-Primary hover:dark:bg-neutral-200 hover:dark:text-Primary text-neutral-200 rounded hover:bg-opacity-80 transition-colors duration-300"
            >
              {getButtonText()}
            </button>
          </div>

          <div className="mb-4">
            <select
              className="p-2 rounded bg-Primary text-neutral-200"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <option value="All">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            <button
              onClick={() => setSortByDate((prev) => !prev)}
              className="p-2 rounded bg-Primary text-neutral-200 ml-4 hover:bg-opacity-80 transition-colors duration-300"
            >
              {sortByDate
                ? "Sort by Date: Oldest First"
                : "Sort by Date: Newest First"}
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={showCompleted ? "completed" : "all"} // Toggle based on showCompleted
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-4">
                {filteredTickets.map((ticket) => (
                  <TicketItem
                    key={ticket.id}
                    ticket={ticket}
                    onView={() => handleViewTicket(ticket)}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Ticket Details Popup */}
      <AnimatePresence>
        {isPopupOpen && selectedTicket && (
          <TicketDetailsPopup
            ticket={selectedTicket}
            onClose={() => setIsPopupOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}



function TicketItem({ ticket, onView }) {
  // Extract necessary information from the ticket object
  const { title, description, createdBy, createdAt, assignedTo, status } =
    ticket;

  // Format the created date
  const createdDate = new Date(createdAt).toLocaleDateString();

  return (
    <div className="p-4 rounded-lg bg-Primary shadow-lg hover:shadow-2xl shadow-black/50 hover:shadow-black text-neutral-200 duration-300">
      <div className="flex items-start space-x-4">
        <img
          src="/Sidebar-icon.jpg"
          alt={createdBy?.fullName}
          className="w-10 h-10 rounded-full"
        />
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm opacity-80">{createdBy?.fullName}</p>{" "}
              {/* Display full name of the creator */}
            </div>
            <span className="text-sm opacity-80 font-semibold">
              {createdDate}
            </span>{" "}
            {/* Display created date */}
          </div>
          <p className="mt-2 text-sm">{description}</p>
          <p className="mt-1 text-sm">Assigned to: {assignedTo?.name}</p>{" "}
          {/* Display the assigned department */}
          <span
            className={`mt-2 inline-block px-2 py-1 rounded-full text-xs font-semibold ${
              status === "pending"
                ? "bg-yellow-200 text-yellow-800"
                : "bg-green-200 text-green-800"
            }`}
          >
            {status}
          </span>
        </div>
      </div>
      <div className="flex justify-end">
        <button
          onClick={() => onView(ticket)}
          className="mt-4 px-3 py-1 bg-primary-foreground text-neutral-200 hover:text-Primary hover:bg-neutral-200 font-semibold rounded text-sm transition-colors duration-300"
        >
          View
        </button>
      </div>
    </div>
  );
}

function TicketDetailsPopup({ ticket, onClose, onNavigateToRespond }) {
  const { title, description, createdBy, createdAt, assignedTo, status, response } = ticket;
  const createdDate = new Date(createdAt).toLocaleDateString();
  const router = useRouter();
  const handleRespond = () => {
  router.push(`/${ticket._id}`);
  onClose();
}

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-Primary p-6 rounded-lg shadow-xl max-w-md w-full m-4 text-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start space-x-4">
            <img
              src="/Sidebar-icon.jpg"
              alt={createdBy?.fullName || 'User'}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h2 className="font-semibold text-xl">{title}</h2>
              <p className="text-sm opacity-80">{createdBy?.fullName || 'Unknown User'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-6 space-y-4">
          <div>
            <p className="text-sm opacity-80 font-semibold">{createdDate}</p>
            <p className="mt-2 text-sm">{description}</p>
          </div>

          <div>
            <p className="text-sm">Assigned to: {assignedTo?.name}</p>
            <span
              className={`mt-2 inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                status === "pending"
                  ? "bg-yellow-200 text-yellow-800"
                  : "bg-green-200 text-green-800"
              }`}
            >
              {status}
            </span>
          </div>

          <div className="mt-4 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Response</h3>
            {response ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium">{response.createdBy.fullName}</p>
                  <p className="text-xs opacity-80">
                    {new Date(response.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-sm">{response.description}</p>
              </div>
            ) : (
              <p className="text-sm">No response yet.</p>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          {status === "pending" && (
            <button
              onClick={handleRespond}
              className="px-4 py-2 bg-primary-foreground text-neutral-200 hover:text-Primary hover:bg-neutral-200 font-semibold rounded text-sm transition-colors duration-300"
            >
              Respond
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};


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

export default function TicketHistory() {
  return (
    <ThemeProvider attribute="class">
      <TicketManagement />
    </ThemeProvider>
  );
}
