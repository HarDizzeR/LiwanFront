"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { IconChevronLeft, IconSun, IconMoon, IconUpload } from "@tabler/icons-react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

interface Ticket {
  _id: string;
  title: string;
  description: string;
  createdBy: {
    fullName: string;
  };
  createdAt: string;
  assignedTo: {
    name: string;
  };
  status: string;
  response?: {
    description: string;
    createdBy: {
      fullName: string;
    };
    createdAt: string;
  };
}

const TicketResponsePage = () => {
  const { theme, setTheme } = useTheme();
  const [isClient, setIsClient] = useState(false);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [responseDescription, setResponseDescription] = useState("");
  const [fileUploaded, setFileUplaoded] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const params = useParams();
  const router = useRouter();
  const ticketId = params.ticketId;

  useEffect(() => {
    setIsClient(true);
    fetchTicket();
  }, []);

  const fetchTicket = async () => {
    try {
      const accessToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("accessToken"))
        ?.split("=")[1];

      if (!accessToken) {
        throw new Error("No access token found");
      }

      const response = await fetch(`https://liwan-back.vercel.app/api/v1/tickets/${ticketId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch ticket");
      }

      const data = await response.json();
      setTicket(data.data.ticket);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFileUplaoded(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const accessToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("accessToken"))
        ?.split("=")[1];
  
      if (!accessToken) {
        throw new Error("No access token found");
      }
  
      // Create JSON payload
      const payload = {
        responseDescription,
        fileUploaded,
      };
  
      const submitResponse = await fetch(`https://liwan-back.vercel.app/api/v1/tickets/${ticketId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });
  
      if (!submitResponse.ok) {
        const errorData = await submitResponse.json();
        throw new Error(errorData.message || "Failed to submit response");
      }
  
      router.push("/ticket-history");
    } catch (err) {
      setError(err.message);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  if (!ticket) {
    return <div className="min-h-screen flex items-center justify-center">Ticket not found</div>;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link
            onClick={() => router.back()}
            href=""
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <IconChevronLeft className="h-6 w-6" />
          </Link>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            {theme === "dark" ? (
              <IconSun className="h-6 w-6" />
            ) : (
              <IconMoon className="h-6 w-6" />
            )}
          </button>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Respond to Ticket
          </h1>
          {isClient && (
            <Image
              src={theme === "dark" ? "/liwan-dark-no-bg.png" : "/liwan-logo-inverted.png"}
              width={100}
              height={40}
              alt="Liwan Logo"
            />
          )}
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 mb-8">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {ticket.title}
            </h2>
            <div className="flex justify-between items-center mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                ticket.status === "pending"
                  ? "bg-yellow-200 text-yellow-800"
                  : "bg-green-200 text-green-800"
              }`}>
                {ticket.status}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Created on: {new Date(ticket.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-base text-gray-600 dark:text-gray-400 mb-2">
              by: {ticket.createdBy.fullName}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              {ticket.description}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label
              htmlFor="response"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Your Response
            </label>
            <textarea
              id="response"
              rows={6}
              value={responseDescription}
              onChange={(e) => setResponseDescription(e.target.value)}
              className="w-full px-3 py-2 text-gray-700 dark:text-gray-300 rounded-md bg-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your response here..."
              required
            ></textarea>
          </div>

          <div>
            <label
              htmlFor="file-upload"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Attach a file (optional)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <IconUpload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#C8A97E] hover:bg-[#B69A6F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C8A97E]"
            >
              Submit Response
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketResponsePage;