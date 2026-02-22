import ActivationDashboardClient from "./ActivationDashboardClient";

export function generateStaticParams() {
  return [{ id: "act-1" }, { id: "act-2" }];
}

export default function ActivationDashboardPage() {
  return <ActivationDashboardClient />;
}
