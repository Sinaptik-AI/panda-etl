import ProcessesList from "@/components/ProcessesList";
import Breadcrumb from "@/components/ui/Breadcrumb";

export default function ProcessesPage() {
  const breadcrumbItems = [{ label: "Processes", href: "/processes" }];

  return (
    <>
      <Breadcrumb items={breadcrumbItems} classNames="mb-8" />
      <h1 className="text-3xl font-bold my-6">All processes</h1>
      <ProcessesList />
    </>
  );
}
