import { createBrowserRouter, Outlet } from "react-router";
import { DashboardPage } from "@/components/pages/DashboardPage";
import { AgentsPage } from "@/components/pages/AgentsPage";
import { TasksPage } from "@/components/pages/TasksPage";
import { UsagePage } from "@/components/pages/UsagePage";
import { ApprovalsPage } from "@/components/pages/ApprovalsPage";
import { SettingsPage } from "@/components/pages/SettingsPage";

function RootLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Outlet />
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "agents", element: <AgentsPage /> },
      { path: "tasks", element: <TasksPage /> },
      { path: "usage", element: <UsagePage /> },
      { path: "approvals", element: <ApprovalsPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
]);
