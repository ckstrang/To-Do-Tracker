import { useEffect, useState } from "react";
import { UserAuth } from "../../context/AuthContext";
import { supabase } from "../../supabaseClient";
import { Button, Input } from "../UI";

const TaskModal = ({ onClose }) => {
  const { session } = UserAuth();
  const [loading, setLoading] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [due_date, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");
  const [project_id, setProjectId] = useState("");
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProjects() {
      const { data, error } = await supabase
        .from("projects")
        .select("id, title")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        // console.error("Error fetching projects:", error.message);
        setError(error.message);
      } else {
        setProjects(data || []);
      }
    }

    if (session?.user?.id) {
      fetchProjects();
    }
  }, [session]);

  async function createTask() {
    const { data, error } = await supabase
      .from("tasks")
      .insert([
        {
          user_id: session.user.id,
          project_id,
          title,
          description,
          due_date,
          priority,
        },
      ])
      .select()
      .single();

    if (error) {
      // console.error("Error creating task:", error.message);
      setError(error.message);
      return null;
    }
    return data;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const task = await createTask();
    setLoading(false);
    if (task) {
      // console.log("Created task:", task);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-xs z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 dark:text-gray-100">New Task</h2>
        {error && <p className="text-red-500 mb-2">{error}</p>}

        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <select
            value={project_id}
            onChange={(e) => setProjectId(e.target.value)}
            className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-gray-100"
            required
          >
            <option value="">Select a project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
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
            className="p-3 rounded-lg dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>

          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              Create Task
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
