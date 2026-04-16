import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "../component/ThemeToggle";

function HomePage() {
  const [name, setName] = useState("");
  const [language, setLanguage] = useState("node");
  const navigate = useNavigate();

  async function handleCreate() {
    if (!name.trim()) {
      alert("Project name is required");
      return;
    }

    const res = await fetch("http://localhost:3000/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: name.trim(), language }),
    });

    if (res.ok) {
      navigate(`/playground/${name.trim()}`);
    } else {
      alert("Failed to create project");
    }
  }

  async function handleOpen() {
    if (!name.trim()) {
      alert("Project name is required");
      return;
    }

    const res = await fetch(
      `http://localhost:3000/file?name=${name.trim()}`
    );

    if (res.ok) {
      navigate(`/playground/${name.trim()}`);
    } else {
      alert("Project not found");
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      {/* Header */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      {/* Modal */}
      <div className="w-full max-w-md bg-bg-elevated rounded-xl shadow-lg border border-border-primary overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-primary">
          <h1 className="text-xl font-semibold text-fg-primary text-center">
            Web IDE
          </h1>
          <p className="text-sm text-fg-tertiary text-center mt-1">
            Create or open your project
          </p>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-fg-primary mb-2">
              Project Name
            </label>
            <input
              type="text"
              placeholder="Enter project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-bg-secondary border border-border-primary rounded-md text-fg-primary placeholder-fg-tertiary focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-transparent transition-colors"
            />
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-fg-primary mb-2">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 bg-bg-secondary border border-border-primary rounded-md text-fg-primary focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-transparent transition-colors"
            >
              <option value="node">Node.js</option>
              <option value="python">Python</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleCreate}
              className="flex-1 bg-bg-active hover:bg-bg-active/80 text-fg-primary px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-border-focus"
            >
              Create Project
            </button>

            <button
              onClick={handleOpen}
              className="flex-1 bg-bg-secondary hover:bg-bg-hover border border-border-primary text-fg-primary px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-border-focus"
            >
              Open Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;