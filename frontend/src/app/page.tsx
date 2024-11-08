"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { AuroraBackground } from "@/app/components/ui/background";
import { ThemeProvider, useTheme } from "next-themes";

export function AuroraBackgroundDemo() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const themeIcon = mounted ? (
    theme === "dark" ? (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-9 h-9 transition duration-300 ease-in-out transform hover:rotate-180"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3v1.5M12 19.5V21M4.219 4.219l1.061 1.061M17.719 17.719l1.061 1.061M3 12h1.5M19.5 12H21M4.219 19.781l1.061-1.061M17.719 6.281l1.061-1.061M12 9a3 3 0 100 6 3 3 0 000-6z"
        />
      </svg>
    ) : (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-9 h-9 transition duration-300 ease-in-out transform hover:rotate-180"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21.752 15.002A9.718 9.718 0 0112.003 21c-5.385 0-9.75-4.365-9.75-9.75 0-4.207 2.663-7.793 6.423-9.126.45-.164.938.086 1.06.55a.749.749 0 01-.347.826 8.251 8.251 0 1010.965 10.965.75.75 0 01.826-.347c.464.122.714.61.55 1.06z"
        />
      </svg>
    )
  ) : null;

  // Coded Added by Seif to Connect Backend with Frontend (DON'T MODIFY PLEASE.)

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  }

  const [isSignedIn, setIsSignedIn] = useState(false);

  // Check if the user is signed in
  useEffect(() => {
    const accessToken = getCookie("accessToken");
    setIsSignedIn(!!accessToken); // Update state based on token presence
  }, []);

  return (
    <AuroraBackground>
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative flex flex-col gap-4 items-center justify-center px-4"
      >
        <div className="font-extralight text-base md:text-4xl text-gray-600 dark:text-neutral-200 py-4 mb-24 flex items-center justify-center">
          <div className="flex items-center gap-2 font-semibold text-black dark:text-white text-7xl">
            الليوان ليوانكم
          </div>
          <div>
            <img
              src={
                theme === "dark"
                  ? "/liwan-dark-no-bg.png"
                  : "/liwan-logo-inverted.png"
              }
              alt="logo"
              width={380} // Unified width for both themes
              height={430} // Unified height for both themes
              className="mx-auto" // Center-align the image
            />
          </div>
        </div>

        {/* Theme Toggle Button */}
        <button
          className="relative font-extrabold items-center flex space-x-1 text-neutral-800 dark:hover:text-white duration-300 hover:text-neutral-500 dark:text-slate-400"
          onClick={toggleTheme}
        >
          {themeIcon}
        </button>

        <div className="flex space-x-4">
          {isSignedIn ? (
            <button
              className="inline-flex h-12 animate-shimmer items-center justify-center rounded-md border px-6 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 
              border-blue-300 bg-[linear-gradient(110deg,#e0f2fe,45%,#bae6fd,55%,#e0f2fe)] bg-[length:200%_100%] text-blue-800 focus:ring-blue-600 focus:ring-offset-blue-200
              dark:border-slate-800 dark:bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] dark:bg-[length:200%_100%] dark:text-slate-400 dark:focus:ring-slate-400 dark:focus:ring-offset-slate-50"
            >
              <Link href="/user-main">Raise a Ticket</Link>
            </button>
          ) : (
            <button
              className="inline-flex h-12 animate-shimmer items-center justify-center rounded-md border px-6 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 
            border-blue-300 bg-[linear-gradient(110deg,#e0f2fe,45%,#bae6fd,55%,#e0f2fe)] bg-[length:200%_100%] text-blue-800 focus:ring-blue-600 focus:ring-offset-blue-200
            dark:border-slate-800 dark:bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] dark:bg-[length:200%_100%] dark:text-slate-400 dark:focus:ring-slate-400 dark:focus:ring-offset-slate-50"
            >
              <Link href="/login-page">Login</Link>
            </button>
          )}
        </div>
      </motion.div>
    </AuroraBackground>
  );
}

export default function Home() {
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  }
  const accessToken = getCookie("accessToken");

  if (accessToken) {
    console.log("Access Token:", accessToken);
  } else {
    console.log("No access token found. User may need to log in.");
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <ThemeProvider attribute="class">
        <AuroraBackgroundDemo />
      </ThemeProvider>
    </div>
  );
}
