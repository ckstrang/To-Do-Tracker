import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";
import ProjectModal from "./Modal/CreateProjectModal";
import TaskModal from "./Modal/CreateTaskModal";
import { Button } from "./UI";
import ProjectCard from "./UI/ProjectCard";

const Dashboard = () => {
  const { session, signOut } = UserAuth();
  const navigate = useNavigate();
  const [createTaskModal, setCreateTaskModal] = useState(false);
  const [createProjectModal, setCreateProjectModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);

  const handleProjectUpdated = async () => {
    await fetchProjects();
  };

  const handleProjectDeleted = (id) => {
    setProjects((prev) => prev.filter((proj) => proj.id !== id));
  };

  async function fetchProjects() {
    const { data, error } = await supabase
      .from("projects")
      .select("id, title, description, priority, due_date, color")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      // console.error("Error fetching projects:", error.message);
      setError(error.message);
    } else {
      setProjects(data || []);
    }
  }
  useEffect(() => {
    if (session?.user?.id) {
      fetchProjects();

      const channel = supabase
        .channel("projects-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "projects",
            filter: `user_id=eq.${session.user.id}`,
          },
          (payload) => {
            if (payload.eventType === "INSERT") {
              setProjects((prev) => [payload.new, ...prev]);
            }
            if (payload.eventType === "UPDATE") {
              setProjects((prev) =>
                prev.map((proj) =>
                  proj.id === payload.new.id ? payload.new : proj
                )
              );
            }
            if (payload.eventType === "DELETE") {
              setProjects((prev) =>
                prev.filter((proj) => proj.id !== payload.old.id)
              );
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [session]);

  const toggleCreateTaskModal = () => {
    setCreateTaskModal(!createTaskModal);
  };

  const toggleCreateProjectModal = () => {
    setCreateProjectModal(!createProjectModal);
  };

  const handleSignOut = async (e) => {
    e.preventDefault();
    try {
      await signOut();
      navigate("/");
    } catch (err) {
      // console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:bg-[radial-gradient(#0e77b0_1px,transparent_1px)] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
      <div className="flex justify-center">
        {/* Projects and tasks buttons */}
        <div className="flex justify-evenly bg-gray-100 dark:bg-gray-600 border p-2 rounded-2xl">
          <Button onClick={toggleCreateProjectModal}>Create Project</Button>
          <Button onClick={toggleCreateTaskModal}>Create Task</Button>

          {createProjectModal && (
            <ProjectModal
              onClose={toggleCreateProjectModal}
              onCreated={handleProjectUpdated}
              setProjects={setProjects}
            />
          )}
          {createTaskModal && <TaskModal onClose={toggleCreateTaskModal} />}
        </div>
        {/* Sign out button */}
        <div className="absolute left-1">
          <div className="flex justify-evenly bg-gray-100 dark:bg-gray-600 border p-2 rounded-2xl">
            <Button
              onClick={handleSignOut}
              className="hover:cursor-pointer border inline-block px-4 py-3 mt-4"
            >
              Sign out
            </Button>
          </div>
        </div>
      </div>

      {/* Error state */}
      {/* {error && (
        <p className="text-red-500 text-center mt-4">
          Failed to load projects: {error}
        </p>
      )} */}

      {/* Project cards */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-6 place-items-center mt-6">
        {projects.length > 0 ? (
          projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onUpdated={handleProjectUpdated}
              onDeleted={handleProjectDeleted}
            />
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-300 mt-4">
            No projects yet. Create one!
          </p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
