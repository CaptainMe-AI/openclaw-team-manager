import { createBrowserRouter } from "react-router";
import { AppShell } from "@/components/layout/AppShell";
import { DashboardPage } from "@/components/pages/DashboardPage";
import { AgentsPage } from "@/components/pages/AgentsPage";
import { TasksPage } from "@/components/pages/TasksPage";
import { UsagePage } from "@/components/pages/UsagePage";
import { ApprovalsPage } from "@/components/pages/ApprovalsPage";
import { SettingsPage } from "@/components/pages/SettingsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
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
