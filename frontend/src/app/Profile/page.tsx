"use client";

import { useState, useEffect } from "react";
import {
  Moon,
  Sun,
  Home,
  User,
  ChevronLeft,
  ChevronRight,
  Ticket,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ThemeProvider, useTheme } from "next-themes";

export function PersonalInformation() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  //  SEIF'S CODE TO CONNECT BACKEND WITH FRONTEND

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [extension, setExtension] = useState("");

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
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("accessToken="))
      ?.split("=")[1];

    if (!token) return;

    const payload = decodeTokenPayload(token);
    const employeeId = payload?.id;

    if (!employeeId) return;

    fetchEmployeeData(token, employeeId);
  }, []);

  const fetchEmployeeData = (token, employeeId) => {
    fetch("http://127.0.0.1:5000/api/v1/employees/", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        const employee = data.data.employees.find(
          (emp) => emp._id === employeeId
        );

        if (employee) {
          setName(employee.fullName);
          setPhone(employee.phone || ""); // Handle case where phone is not available
          setEmail(employee.email);
          setExtension(employee.extensionsnumber || ""); // Handle case where extension is not available
        } else {
          console.error("Employee not found");
        }
      })
      .catch((error) => console.error("Error fetching employee:", error));
  };

  return (
    <div className="flex h-screen bg-Primary text-neutral-200">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-Primary text-neutral-200 transition-all duration-300 ease-in-out z-10 flex flex-col ${
          isExpanded ? "w-[300px]" : "w-[72px]"
        }`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <div className="flex items-center p-4 mb-8">
          <Link href="/Profile" className="flex items-center">
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
            href="/"
            isExpanded={isExpanded}
          />
          <SidebarItem
            icon={<Ticket size={20} />}
            label="My Tickets"
            href="/user-main/ticket"
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
            label="Log out"
            href="/"
            isExpanded={isExpanded}
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
        className={`flex-1 p-8 overflow-auto dark:bg-neutral-950 bg-neutral-200 text-Primary dark:text-neutral-200 transition-all duration-300 ease-in-out ${
          isExpanded ? "ml-[300px]" : "ml-[60px]"
        }`}
      >
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Personal Information</h1>
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <form className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="form-control flex flex-col">
                    <label className="mb-2 font-medium">Employee Name</label>
                    <input
                      className="p-2"
                      id="name"
                      type="text"
                      value={name}
                      disabled
                    />
                  </div>
                  <div className="form-control flex flex-col">
                    <label className="mb-2 font-medium">Employee Phone</label>
                    <input
                      className="p-2"
                      id="phone"
                      type="tel"
                      value={phone}
                      disabled
                    />
                  </div>

                  <div className="form-control flex flex-col">
                    <label className="mb-2 font-medium">Employee Email</label>
                    <input
                      className="p-2"
                      id="email"
                      type="email"
                      value={email}
                      disabled
                    />
                  </div>
                  <div className="form-control flex flex-col">
                    <label className="mb-2 font-medium">Employee Extenstion</label>
                    <input
                      className="p-2"
                      id="extension"
                      type="text"
                      value={extension}
                      disabled
                    />
                  </div>
                </div>
              </form>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Expand/Collapse button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="fixed bottom-4 left-4 p-2 rounded-full bg-Primary text-neutral-200 hover:bg-primary-foreground hover:text-Primary transition-colors duration-300"
      >
        {isExpanded ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
      </button>
    </div>
  );
}

function SidebarItem({
  icon,
  label,
  href,
  isExpanded,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  isExpanded: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex items-center mb-4 hover:text-white cursor-pointer transition-colors duration-300 px-4 py-2"
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

function InputField({
  label,
  id,
  type,
}: {
  label: string;
  id: string;
  type: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-md font-semibold mb-1">
        {label}
      </label>
      <input
        type={type}
        id={id}
        name={id}
        className="w-full p-2 rounded bg-Primary text-neutral-200 border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary-foreground"
      />
    </div>
  );
}

export default function PersonalInformationPage() {
  return (
    <ThemeProvider attribute="class">
      <PersonalInformation />
    </ThemeProvider>
  );
}
