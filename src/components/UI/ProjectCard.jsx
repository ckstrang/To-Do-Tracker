import { Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { getContrastColor, lightenColor } from "../../utils/colors";
import EditProjectModal from "../Modal/EditProjectModal";
import EditTaskModal from "../Modal/EditTaskModal";
import ViewTaskModal from "../Modal/ViewTaskModal";

const ProjectCard = ({ project, onUpdated, onDeleted }) => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [tasks, setTasks] = useState(project.tasks || []);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("created_at");
  const [editProjectModal, setEditProjectModal] = useState(false);
  const [editTaskModal, setEditTaskModal] = useState(false);

  function getPriorityRank(priority) {
    if (priority === "high") return 1;
    if (priority === "medium") return 2;
    if (priority === "low") return 3;
    return 4;
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortBy === "priority") {
      return getPriorityRank(a.priority) - getPriorityRank(b.priority);
    }
    if (sortBy === "due_date") {
      return new Date(a.due_date) - new Date(b.due_date);
    } else {
      return new Date(a.created_at) - new Date(b.created_at);
    }
  });

  async function refreshTasks() {
    if (!project?.id) return;
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("project_id", project.id)
      .order("created_at", { ascending: true });

    if (error) {
      // console.error("Error fetching tasks:", error.message);
    } else {
      setTasks(data || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    refreshTasks();
    async function fetchTasks() {
      if (!project?.id) return;

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("project_id", project.id)
        .order("created_at", { ascending: true });

      if (error) {
        // console.error("Error fetching tasks:", error.message);
      } else {
        setTasks(data || []);
      }
      setLoading(false);
    }

    fetchTasks();

    /* Realtime subscription to supabase db */
    const channel = supabase
      .channel(`tasks-${project.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `project_id=eq.${project.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setTasks((prev) => [...prev, payload.new]);
          }
          if (payload.eventType === "DELETE") {
            setTasks((prev) => prev.filter((t) => t.id !== payload.old.id));
          }
          if (payload.eventType === "UPDATE") {
            setTasks((prev) =>
              prev.map((t) => (t.id === payload.new.id ? payload.new : t))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [project]);

  return (
    <div
      className="border-2 rounded-lg p-4 w-full sm:w-80 border-gray-300 dark:border-gray-700 
                 text-gray-900 dark:text-gray-100 shadow-md text-clip overflow-hidden"
      style={{
        backgroundColor: project.color,
        color: getContrastColor(project.color),
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-1">
        <h2 className="font-bold text-lg truncate">{project.title}</h2>
        <div className="flex gap-2">
          <div className="relative">
            {/* Sorting */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="ml-2 text-sm border rounded px-1 bg-gray-100 dark:bg-gray-700"
              style={{
                backgroundColor: lightenColor(project.color, -10),
                color: getContrastColor(lightenColor(project.color, -10)),
              }}
            >
              <option value="created_at">Created At</option>
              <option value="priority">Priority</option>
              <option value="due_date">Due Date</option>
            </select>
          </div>
          <Settings
            onClick={() => setEditProjectModal(true)}
            className="w-5 h-5 cursor-pointer"
          />
        </div>
      </div>
      <p className="text-sm truncate">{project.description}</p>

      {/* Project Priority */}
      <div className="flex gap-2">
        <p
          className={`text-sm mt-2 font-bold break-words ${
            project.priority === "high"
              ? "text-red-600"
              : project.priority === "medium"
              ? "text-yellow-600"
              : "text-green-600"
          }`}
        >
          {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}{" "}
          Priority
        </p>
      </div>

      <div>
        <p className="text-sm mt-2 font-bold break-words">{project.due_date}</p>
      </div>

      {/* Tasks */}
      <div className="h-[600px] overflow-y-auto grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 pr-2">
        {loading ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
            Loading tasks...
          </p>
        ) : sortedTasks.length > 0 ? (
          sortedTasks.map((task) => (
            <div
              key={task.id}
              className="rounded-md border border-gray-300 dark:border-gray-700 
                         bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 p-3 mt-2 flex flex-col relative w-full cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-500 transition duration-300 ease-in-out"
              style={{
                backgroundColor: lightenColor(project.color, -10),
                color: getContrastColor(lightenColor(project.color, -10)),
              }}
              onMouseEnter={(e) => {
                const hoverColor = lightenColor(project.color, -15);
                e.currentTarget.style.backgroundColor = hoverColor;
                e.currentTarget.style.color = getContrastColor(hoverColor);
              }}
              onMouseLeave={(e) => {
                const baseColor = lightenColor(project.color, -10);
                e.currentTarget.style.backgroundColor = baseColor;
                e.currentTarget.style.color = getContrastColor(baseColor);
              }}
            >
              {/* Task Settings Icon */}
              <Settings
                onClick={() => setEditTaskModal(task)}
                className="absolute top-2 right-2 w-4 h-4 cursor-pointer"
              />
              <div onClick={() => setSelectedTask(task)}>
                <h3 className="font-medium truncate">{task.title}</h3>
                <p className="text-sm truncate">{task.description}</p>

                {/* Task Priority */}
                <div className="flex gap-2">
                  <p
                    className={`text-sm mt-2 font-bold break-words ${
                      task.priority === "high"
                        ? "text-red-600"
                        : task.priority === "medium"
                        ? "text-yellow-600"
                        : "text-green-600"
                    }`}
                  >
                    {task.priority.charAt(0).toUpperCase() +
                      task.priority.slice(1)}{" "}
                    Priority
                  </p>
                </div>
                <div>
                  <p className="text-sm mt-2 font-bold break-words">
                    {task.due_date}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
            No tasks yet.
          </p>
        )}
      </div>

      {/* View Task Modal */}
      {selectedTask && (
        <ViewTaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {/* Edit Project Modal */}
      {editProjectModal && (
        <EditProjectModal
          project={project}
          onClose={() => setEditProjectModal(false)}
          onUpdated={() => {
            setEditProjectModal(false);
            onUpdated();
          }}
          onDeleted={() => {
            setEditProjectModal(false);
            onDeleted(project.id);
          }}
        />
      )}

      {/* Edit Task Modal */}
      {editTaskModal && (
        <EditTaskModal
          task={editTaskModal}
          onClose={() => setEditTaskModal(false)}
          onUpdated={() => {
            setEditTaskModal(false);
            refreshTasks();
          }}
          onDeleted={() => {
            setEditTaskModal(false);
            refreshTasks();
          }}
        />
      )}
    </div>
  );
};

export default ProjectCard;
