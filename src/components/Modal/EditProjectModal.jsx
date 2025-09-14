import { useState } from "react";
import { supabase } from "../../supabaseClient";
import { Button, Input } from "../UI";

export default function EditProjectModal({
  project,
  onClose,
  onUpdated,
  onDeleted,
}) {
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description || "");
  const [priority, setPriority] = useState(project.priority || "medium");
  const [due_date, setDueDate] = useState(project.due_date || "");
  const [color, setColor] = useState(project.color || "#000000");
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleUpdate() {
    const { error } = await supabase
      .from("projects")
      .update({ title, description, priority, due_date, color })
      .eq("id", project.id);

    if (error) console.error("Error updating project:", error.message);
    else onUpdated();
  }

  async function handleDelete() {
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", project.id);
    if (error) console.error("Error deleting project:", error.message);
    else onDeleted();
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-xs z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Edit Project</h2>

        {/* Fields */}
        <div className="flex flex-col gap-3">
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

          {/* Buttons */}
          <div className="flex justify-between gap-2 mt-4">
            <Button onClick={onClose}>Cancel</Button>
            <Button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={handleUpdate}
            >
              Save
            </Button>
            {!confirmDelete ? (
              <Button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={() => setConfirmDelete(true)}
              >
                Delete
              </Button>
            ) : (
              <Button
                className="bg-red-700 text-white px-4 py-2 rounded"
                onClick={handleDelete}
              >
                Confirm Delete
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
