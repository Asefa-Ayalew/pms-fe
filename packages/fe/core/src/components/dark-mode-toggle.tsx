// components/DarkModeToggle.js
import { IconMoon, IconSun } from "@tabler/icons-react";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

export default function DarkModeToggle() {
  const [theme, setTheme] = useState("light");
  console.log(theme, theme);

  useEffect(() => {
    // Check the user's preferred color scheme on page load
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.classList.add(savedTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === "light" ? "dark" : "light";
    document.documentElement.classList.remove(theme);
    document.documentElement.classList.add(newTheme);
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  }, [theme]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
    >
      <button
        className="px-4 py-2 text-sm font-semibold bg-gray-200 rounded dark:bg-gray-700 dark:text-gray-100"
        onClick={toggleTheme}
      >
        {theme === "light" ? <IconMoon /> : <IconSun />}
      </button>
    </motion.div>
  );
}
