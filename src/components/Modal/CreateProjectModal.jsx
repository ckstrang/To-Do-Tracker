import { useState } from "react";
import { UserAuth } from "../../context/AuthContext";
import { supabase } from "../../supabaseClient";
import { Button, Input } from "../UI";

const ProjectModal = ({ onClose, onCreated, setProjects }) => {
  const { session } = UserAuth();
  const [loading, setLoading] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [due_date, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");
  const [error, setError] = useState(null);
  const [color, setColor] = useState("#808080");

  async function createProject() {
    const { data, error } = await supabase
      .from("projects")
      .insert([
        {
          user_id: session.user.id,
          title,
          description,
          priority,
          due_date,
          color,
        },
      ])
      .select()
      .single();

    if (error) {
      // console.error("Error creating project:", error.message);
      setError(error.message);
      return null;
    }

    return data;
  }

  const onSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    const project = await createProject();
    if (project) {
      // console.log("Created project:", project);
      setProjects((prev) => [project, ...prev]);
      onCreated?.();
      onClose();
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-xs z-50">
      <div
        className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl w-full max-w-md"
        style={{ backgroundColor: color }}
      >
        <h2 className="text-xl font-bold mb-4 dark:text-gray-100">
          New Project
        </h2>
        {error && <p className="text-red-500 mb-2">{error}</p>}

        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Input
            type="date"
            value={due_date}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
          <div className="flex justify-between p-3 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-gray-100">
            <p className="ml-1.5">Card Color</p>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              Create Project
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;
