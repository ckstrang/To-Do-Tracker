import { useState } from "react";
import { supabase } from "../../supabaseClient";
import { Button, Input } from "../UI";

export default function EditTaskModal({ task, onClose, onUpdated, onDeleted }) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [priority, setPriority] = useState(task.priority || "medium");
  const [dueDate, setDueDate] = useState(task.due_date || "");
  const [confirmDelete, setConfirmDelete] = useState(false);

  /* Update task details */
  async function handleUpdate() {
    const { error } = await supabase
      .from("tasks")
      .update({ title, description, priority, due_date: dueDate })
      .eq("id", task.id);

    if (error) console.error("Error updating project:", error.message);
    else onUpdated();
  }

  /* Delete task */
  async function handleDelete() {
    const { error } = await supabase.from("tasks").delete().eq("id", task.id);
    if (error) console.error("Error deleting task:", error.message);
    else onDeleted();
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl max-w-lg w-full">
        <h2 className="text-lg font-bold mb-4">Edit Task</h2>

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
            value={dueDate}
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

          <div className="flex justify-between mt-4">
            <Button className="bg-gray-300 px-4 py-2 rounded" onClick={onClose}>
              Cancel
            </Button>
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
