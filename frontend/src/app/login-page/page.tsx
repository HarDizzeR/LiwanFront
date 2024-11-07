"use client"; // This must be at the top of the file
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useMotionTemplate, useMotionValue, motion } from "framer-motion";


export default function Login() {
  const radius = 100;
  const [visibleEmail, setVisibleEmail] = useState(false);
  const [visibleExtension, setVisibleExtension] = useState(false);
  const [visiblePassword, setVisiblePassword] = useState(false);

  const mouseXEmail = useMotionValue(0);
  const mouseYEmail = useMotionValue(0);
  const mouseXExtension = useMotionValue(0);
  const mouseYExtension = useMotionValue(0);
  const mouseXPassword = useMotionValue(0);
  const mouseYPassword = useMotionValue(0);

 
  function handleMouseMove(
    event: React.MouseEvent<HTMLDivElement>,
    mouseX: any,
    mouseY: any
  ) {
    const { currentTarget, clientX, clientY } = event;
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

   // Coded Added by Seif to Connect Backend with Frontend (DON'T MODIFY PLEASE.)
   
  const [successMessage, setSuccessMessage] = useState("");
  const [emailOrExtension, setEmailOrExtension] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();


  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/v1/employees/login",
        {
          method: "POST",
          credentials: 'include',
          headers: {
            "Content-Type": "application/json",
            'Access-Control-Allow-Origin': 'http://localhost:3000',  // Frontend URL
            'Access-Control-Allow-Credentials': 'true',              // Allow credentials
          },
          body: JSON.stringify({
            emailOrExtension,
            password,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error data:", errorData);
        throw new Error(
          errorData.message || "Login failed! Please check your credentials."
        );
      }

      const data = await response.json();
      console.log("Success data:", data);
      if (data.accessToken) {  
        // Cookie option
        document.cookie = `accessToken=${data.accessToken}; path=/; secure`;
      }
      const userName = data.data.employee.fullName || "User"; // Use "User" as a fallback if name is missing
      setSuccessMessage(`Welcome back, ${userName}, thank you for logging in.`);
      setError(""); // Clear error if successful
      router.push("/");
    } catch (err) {
      console.error("Caught error:", err);
      setError(err.message);
      setSuccessMessage(""); // Clear success message if error occurs
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="border-2 border-gray-300 rounded-lg p-6 shadow-lg bg-background">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Log in with your <span className="text-[#C19E7B]">Liwan</span> Account
        </h2>
        <p className="text-center text-slate-500 mb-5">
          Login using your assigned Liwan email or Extension number and password
        </p>
        {successMessage && <p className="text-green-700 mb-2">{successMessage}</p>} 
        {error && <p style={{ color: "red" }}>{error}</p>}
        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <Label htmlFor="emailOrExtension">Email or Extension</Label>
            <motion.div
              style={{
                background: useMotionTemplate`
                  radial-gradient(
                    ${
                      visibleEmail || visibleExtension ? radius + "px" : "0px"
                    } circle at ${mouseXEmail}px ${mouseYEmail}px,
                    #C19E7B,
                    transparent 80%
                  )
                `,
              }}
              onMouseMove={(e) => handleMouseMove(e, mouseXEmail, mouseYEmail)}
              onMouseEnter={() => {
                setVisibleEmail(true);
                setVisibleExtension(true);
              }}
              onMouseLeave={() => {
                setVisibleEmail(false);
                setVisibleExtension(false);
              }}
              className="p-[2px] rounded-lg transition duration-300 group/input"
            >
              <Input
                id="emailOrExtension"
                type="text"
                placeholder="Enter your email or extension"
                value={emailOrExtension}
                onChange={(e) => setEmailOrExtension(e.target.value)}
              />
            </motion.div>
          </div>
          <div>
            <div className="separator h-[1px] bg-[#ccc] m-[20px]" />
            <Label htmlFor="password">Password</Label>
            <motion.div
              style={{
                background: useMotionTemplate`
                  radial-gradient(
                    ${
                      visiblePassword ? radius + "px" : "0px"
                    } circle at ${mouseXPassword}px ${mouseYPassword}px,
                    brown,
                    transparent 80%
                  )
                `,
              }}
              onMouseMove={(e) =>
                handleMouseMove(e, mouseXPassword, mouseYPassword)
              }
              onMouseEnter={() => setVisiblePassword(true)}
              onMouseLeave={() => setVisiblePassword(false)}
              className="p-[2px] rounded-lg transition duration-300 group/input"
            >
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </motion.div>
          </div>
          <div className="btn-submit flex justify-end">
            <button
              type="submit"
              className="bg-zinc-950 text-white w-20 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Log In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}