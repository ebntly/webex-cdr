import { ReactNode } from "react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "./ui/breadcrumb";
import { useSidebar } from "./ui/sidebar";

export function Breadcrumbs() {
  const { breadcrumbs } = useSidebar();
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.reduce((acc, item, i) => {
          if (item.url) {
            acc.push(
              <BreadcrumbItem className="hidden md:block" key={`breadcrumb-${i}`}>
                <BreadcrumbLink href={item.url}>{item.label}</BreadcrumbLink>
              </BreadcrumbItem>
            );
          } else {
            acc.push(
              <BreadcrumbItem  key={`breadcrumb-${i}`}>
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              </BreadcrumbItem>
            );
          }

          if (i < breadcrumbs.length - 1) {
            acc.push(<BreadcrumbSeparator className="hidden md:block"  key={`breadcrumb-sep-${i}`} />);
          }

          return acc;
        }, [] as ReactNode[])}
      </BreadcrumbList>
    </Breadcrumb>
  );
}