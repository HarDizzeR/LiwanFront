"use client";

import { Sidebar } from "@/app/components/ui/sidebar"
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Moon,
  Sun,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ThemeProvider, useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useSSE } from '../../../hooks/useSSE';

export function TicketManagement() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const router = useRouter();

  const [employeeData, setEmployeeData] = useState(null);
  const [ticketsData, setTicketsData] = useState([]);
  const [showPending, setShowPending] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [tickets, setTickets] = useState([]);

  const handleTicketCreated = (newTicket) => {
    setTickets(prevTickets => [newTicket, ...prevTickets]);
  };

  const handleTicketUpdated = (updatedTicket) => {
    setTickets(prevTickets => 
      prevTickets.map(ticket => 
        ticket._id === updatedTicket._id ? updatedTicket : ticket
      )
    );
  };

  const { sseStatus, sseError } = useSSE(handleTicketCreated, handleTicketUpdated);

  useEffect(() => {
    setMounted(true);
    document.body.style.setProperty("--color-primary", "#1A1C23");
    document.body.style.setProperty("--color-secondary", "#C19E7B");
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const themeIcon = mounted ? (
    theme === "dark" ? (
      <Sun className="w-6 h-6 transition duration-300 ease-in-out transform hover:rotate-180" />
    ) : (
      <Moon className="w-6 h-6 transition duration-300 ease-in-out transform hover:rotate-180" />
    )
  ) : null;

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

  const filterTickets = () => {
    if (showPending)
      return ticketsData.filter((ticket) => ticket.status === "pending");
    if (showCompleted)
      return ticketsData.filter((ticket) => ticket.status === "completed");
    return ticketsData;
  };

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedTicket(null);
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
        fetch("https://liwan-back.vercel.app/api/v1/employees/", {
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

              fetch("https://liwan-back.vercel.app/api/v1/tickets/getMyTickets", {
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

  return (
    <div className="flex h-screen">
      <main
        className={`flex-1 p-8 bg-neutral-100 dark:bg-Primary overflow-auto transition-all duration-300 ease-in-out ${
          isExpanded ? "ml-[150px]" : "ml-[40px]"
        }`}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-Primary dark:text-neutral-100">
              My Tickets
            </h1>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowPending(true);
                  setShowCompleted(false);
                }}
                className={`px-4 py-2 ${
                  showPending ? "bg-blue-500" : "bg-Primary"
                } text-neutral-200 rounded hover:bg-opacity-80 transition-colors duration-300`}
              >
                Show Pending
              </button>
              <button
                onClick={() => {
                  setShowCompleted(true);
                  setShowPending(false);
                }}
                className={`px-4 py-2 ${
                  showCompleted ? "bg-green-500" : "bg-Primary"
                } text-neutral-200 rounded hover:bg-opacity-80 transition-colors duration-300`}
              >
                Show Completed
              </button>
              <button
                onClick={() => {
                  setShowPending(false);
                  setShowCompleted(false);
                }}
                className={`px-4 py-2 ${
                  !showPending && !showCompleted ? "bg-gray-500" : "bg-Primary"
                } text-neutral-200 rounded hover:bg-opacity-80 transition-colors duration-300`}
              >
                Show All
              </button>
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={
                currentPage +
                (showPending ? "pending" : showCompleted ? "completed" : "all")
              }
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-4">
                {filterTickets().map((ticket) => (
                  <TicketItem
                    key={ticket._id}
                    ticket={ticket}
                    onView={handleViewTicket}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
          <Link href="/user-ticket">
            <button className="mt-6 px-4 py-2 dark:bg-Primary bg-neutral-100 dark:text-neutral-200 text-Primary hover:bg-Primary hover:text-white rounded transition-colors dark:hover:bg-neutral-200 dark:hover:text-[#1A1C23] duration-300">
              Submit another ticket
            </button>
          </Link>
        </div>
      </main>

      <AnimatePresence>
        {isPopupOpen && selectedTicket && (
          <TicketDetailsPopup
            ticket={selectedTicket}
            onClose={handleClosePopup}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function TicketItem({ ticket, onView }) {
  const { title, description, createdBy, createdAt, assignedTo, status, fileUploaded } = ticket;
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
              <p className="text-sm opacity-80">{createdBy?.fullName}</p>
            </div>
            <span className="text-sm opacity-80 font-semibold">
              {createdDate}
            </span>
          </div>
          <p className="mt-2 text-sm">{description}</p>
          <p className="mt-1 text-sm">Assigned to: {assignedTo?.name}</p>
          <span
            className={`mt-2 inline-block px-2 py-1 rounded-full text-xs font-semibold ${
              status === "pending"
                ? "bg-yellow-200 text-yellow-800"
                : "bg-green-200 text-green-800"
            }`}
          >
            {status}
          </span>
          {fileUploaded && (
            <div className="mt-2">
              <Image
                src={`https://liwan-back.vercel.app/user_ticket/${createdBy?._id}/${fileUploaded}`}
                alt="Ticket attachment"
                width={100}
                height={100}
                className="rounded-md object-cover"
              />
            </div>
          )}
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

function TicketDetailsPopup({ ticket, onClose }) {
  const {
    title,
    description,
    createdBy,
    createdAt,
    assignedTo,
    status,
    response,
    fileUploaded,
  } = ticket;
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
              alt={createdBy?.fullName || "User"}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h2 className="font-semibold text-xl">{title}</h2>
              <p className="text-sm opacity-80">
                {createdBy?.fullName || "Unknown User"}
              </p>
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

          {fileUploaded && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Attachment</h3>
              <Image
                src={`https://liwan-back.vercel.app/user_ticket/${createdBy?._id}/${fileUploaded}`}
                alt="Ticket attachment"
                width={300}
                height={300}
                className="rounded-md object-cover"
              />
            </div>
          )}

          <div className="mt-4 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Response</h3>
            {response ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium">
                    {response.createdBy.fullName}
                  </p>
                  <p className="text-xs opacity-80">
                    {new Date(response.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-sm">{response.description}</p>
                {response.fileUploaded && (
                  <div className="mt-2">
                    <Image
                      src={`https://liwan-back.vercel.app/user_ticket/${response.createdBy?._id}/${response.fileUploaded}`}
                      alt="Response attachment"
                      width={200}
                      height={200}
                      className="rounded-md object-cover"
                    />
                  </div>
                )}
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
}

export default function Page() {
  return (
    <ThemeProvider attribute="class">
      <div className="flex h-screen bg-Primary">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <TicketManagement />
        </main>
      </div>
    </ThemeProvider>
  );
}