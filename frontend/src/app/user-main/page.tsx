"use client";
import React, { useState, useEffect } from "react";
import { Sidebar } from "@/app/components/ui/sidebar"
import { ThemeProvider} from "next-themes";
import { Carousel, Card } from "@/app/components/ui/card-carousel";


// Carousel Demo Component with Light/Dark Mode
export function AppleCardsCarouselDemo() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState([
    {
      category: "",
      title: "",
      src: "/card_one.jpg",
      content: <DummyContent />,
    },
    {
      category: "",
      title: "",
      src: "/card_two.jpg",
      content: <DummyContent />,
    },
    {
      category: "",
      title: "",
      src: "/card_three.jpg",
      content: <DummyContent />,
    },
    {
      category: "",
      title: "",
      src: "/card_four.jpg",
      content: <DummyContent />,
    },
  ]);

  const decodeTokenPayload = (token:string) => {
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
    // Retrieve the access token from cookies
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("accessToken="))
      ?.split("=")[1];

    if (!token) {
      setError("Access token not found");
      setLoading(false);
      return;
    }

    // Optionally, decode the token payload (if needed for other purposes)
    const payload = decodeTokenPayload(token);
    console.log("Decoded token payload:", payload);

    // Fetch departments using the token in headers
    fetch("https://liwan-back.vercel.app/api/v1/departments/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch departments");
        }
        return response.json();
      })
      .then((data) => {
        // Extract department names and map them into the data array
        const departmentNames = data.data.departments.map((dept) => dept.name);
        setData((prevData) =>
          prevData.map((card, index) => ({
            ...card,
            title: departmentNames[index] || "",
          }))
        );
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching departments:", error);
        setError("Failed to load departments.");
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const cards = data.map((card, index) => (
    <Card key={card.src} card={card} index={index} />
  ));

  return (
    <div className="w-full h-screen overflow-hidden py-20">
      <h2 className="max-w-7xl pl-4 mx-auto text-xl md:text-5xl font-bold text-Primary dark:text-neutral-200 font-sans pb-6">
        How Can We Help?
      </h2>
      <Carousel items={cards} />
    </div>
  );
}


// Dummy Content with Light/Dark Mode
const DummyContent = () => {
  return (
    <>
      {[...new Array(3).fill(1)].map((_, index) => {
        return (
          <div
            key={"dummy-content" + index}
            className="bg-Secondary dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4"
          ></div>
        );
      })}
    </>
  );
};


export default function Page() {
  return (
    <ThemeProvider attribute="class">
      <div className="flex h-screen bg-Primary">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-neutral-300 dark:bg-Primary">
          <AppleCardsCarouselDemo />
        </main>
      </div>
    </ThemeProvider>
  )
}