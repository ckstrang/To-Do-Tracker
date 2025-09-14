import { Calendar } from "lucide-react";
import { Button } from "../UI";
const ViewTaskModal = ({ task, onClose }) => {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-medium">{task.title}</h3>
        <p className="text-sm text-gray-900 dark:text-gray-100">
          {task.description}
        </p>
        {/* Priority */}
        <div className="flex gap-2">
          <p
            className={`mt-2 font-bold ${
              task.priority === "high"
                ? "text-red-600"
                : task.priority === "medium"
                ? "text-yellow-600"
                : "text-green-600"
            }`}
          >
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}{" "}
            Priority
          </p>
        </div>
        {/* Due Date */}
        <div className="flex gap-2 mt-2 mb-2">
          {task.due_date}
          <Calendar className="w-5 h-5"></Calendar>
        </div>
        <Button onClick={onClose}>Close</Button>
      </div>
    </div>
  );
};

export default ViewTaskModal;
