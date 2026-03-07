import { useState } from "react";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const [name, setName] = useState("");
  const [language, setLanguage] = useState("node");
  const navigate = useNavigate();

  async function handleCreate() {
    if (!name) return alert("Project name required");

    const res = await fetch("http://localhost:3000/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, language }),
    });

    if (res.ok) {
      navigate(`/playground/${name}`);
    }
  }

  async function handleOpen() {
    if (!name) return alert("Project name required");

    const res = await fetch(
      `http://localhost:3000/file?name=${name}`
    );

    if (res.ok) {
      navigate(`/playground/${name}`);
    } else {
      alert("Project not found");
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-zinc-900 text-white">
      <div className="w-[420px] p-8 bg-zinc-800 rounded-xl shadow-lg space-y-6">

        <h1 className="text-2xl font-semibold text-center">
          Create or Open Project
        </h1>

        {/* Project Name */}
        <input
          type="text"
          placeholder="Project name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 rounded bg-zinc-900 border border-zinc-700 outline-none"
        />

        {/* Language */}
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full p-3 rounded bg-zinc-900 border border-zinc-700"
        >
          <option value="node">Node</option>
          <option value="python">Python</option>
        </select>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleCreate}
            className="flex-1 bg-blue-600 hover:bg-blue-500 p-3 rounded"
          >
            Create Project
          </button>

          <button
            onClick={handleOpen}
            className="flex-1 bg-green-600 hover:bg-green-500 p-3 rounded"
          >
            Open Project
          </button>
        </div>

      </div>
    </div>
  );
}

export default HomePage;