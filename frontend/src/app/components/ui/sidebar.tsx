"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { IconBrandTabler, IconMenu2, IconX } from "@tabler/icons-react"
import { Archive, HistoryIcon, LayoutDashboardIcon, LogOut, Plus, Ticket } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"

interface SidebarLink {
  label: string
  href: string
  icon: React.ReactNode
  onClick?: () => void
  show: Boolean
}

interface SidebarProps {
  className?: string
}

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [isHomePage, setIsHomePage] = useState(false);
  const links: SidebarLink[] = [
    {
      label: "Home",
      href: "/user-main",
      icon: <IconBrandTabler className="text-neutral-200 h-6 w-6 flex-shrink-0 mx-2" />,
      show: !isHomePage
    },
    {
      label: "My Tickets",
      href: "/user-main/ticket",
      icon: <IconBrandTabler className="text-neutral-200 h-6 w-6 flex-shrink-0 mx-2" />,
      show: !isAdmin && !isManager
    },
    {
      label: "Admin Dashboard",
      href: "/admin-dashboard",
      icon: <LayoutDashboardIcon className="text-neutral-200 h-6 w-6 flex-shrink-0 mx-2" />,
      show: !isAdmin
    },
    {
      label: "Assigned to",
      href: "/tickets-assigned",
      icon: <Ticket className="text-neutral-200 h-6 w-6 flex-shrink-0 mx-2" />,
      show: !isManager || !isAdmin
    },
    {
      label: "Submit a ticket",
      href: "/user-ticket",
      icon: <Plus className="text-neutral-200 h-6 w-6 flex-shrink-0 mx-2" />,
      show: !isManager || !isAdmin
    },
    {
      label: "History",
      href: "/ticket-history",
      icon: <HistoryIcon className="text-neutral-200 h-6 w-6 flex-shrink-0 mx-2" />,
      show: !isAdmin
    },
    {
      label: "Logout",
      href: "/",
      icon: <LogOut className="text-neutral-200 h-6 w-6 flex-shrink-0 mx-2" />,
      onClick: () => {
        document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict"
        router.push("/")
      },
      show: true
    },
  ]

  return (
    <motion.div
      className={`flex flex-col bg-Primary dark:bg-neutral-950 h-full transition-all duration-300 ease-in-out ${
        open ? "w-[200px]" : "w-[40px]"
      } ${className}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden pt-6">
        {open ? <Logo /> : <LogoIcon />}
        <div className="mt-8 flex flex-col gap-2">
          
          {links.filter(link => link.show).map((link, idx) => (
            <SidebarLink key={idx} link={link} />
          ))}
        </div>
        <div className="mt-auto pb-4 flex justify-center">
          <ThemeToggle />
        </div>
      </div>
    </motion.div>
  )
}

const Logo: React.FC = () => {
  const router = useRouter()

  return (
    <div
      onClick={() => router.push("/Profile")}
      className="cursor-pointer font-normal flex space-x-2 items-center text-sm text-neutral-100 py-1 relative z-20"
    >
      <Image
        src="/Sidebar-icon.jpg"
        width={40}
        height={40}
        className="rounded-full"
        alt="Profile Icon"
      />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-white whitespace-pre"
      >
        Profile
      </motion.span>
    </div>
  )
}


const LogoIcon: React.FC = () => {
  const router = useRouter()

  return (
    <div
      onClick={() => router.push("/Profile")}
      className="cursor-pointer font-normal flex space-x-2 items-center text-sm text-black dark:text-white py-1 relative z-20"
    >
      <Image
        src="/Sidebar-Icon.jpg"
        width={30}
        height={30}
        className="rounded-full mx-1"
        alt="Profile Icon"
      />
    </div>
  )
}


const SidebarLink: React.FC<{ link: SidebarLink }> = ({ link }) => {
  const router = useRouter()

  const handleClick = (e: React.MouseEvent) => {
    if (link.onClick) {
      e.preventDefault()
      link.onClick()
    } else {
      router.push(link.href)
    }
  }

  return (
    <a
      href={link.href}
      onClick={handleClick}
      className="flex items-center justify-start gap-2 group/sidebar py-2 text-white dark:bg-neutral-950 bg-Primary rounded-md"
    >
      {link.icon}
      <motion.span
        animate={{
          display: "inline-block",
          opacity: 1,
        }}
        className="text-neutral-200 text-sm font-semibold group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
      >
        {link.label}
      </motion.span>
    </a>
  )
}

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
    >
      {theme === "dark" ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6 transition duration-300 ease-in-out transform hover:rotate-180"
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
          className="w-6 h-6 transition duration-300 ease-in-out transform hover:rotate-180"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.752 15.002A9.718 9.718 0 0112.003 21c-5.385 0-9.75-4.365-9.75-9.75 0-4.207 2.663-7.793 6.423-9.126.45-.164.938.086 1.06.55a.749.749 0 01-.347.826 8.251 8.251 0 1010.965 10.965.75.75 0 01.826-.347c.464.122.714.61.55 1.06z"
          />
        </svg>
      )}
    </button>
  );
};