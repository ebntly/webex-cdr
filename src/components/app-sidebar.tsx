"use client"

import * as React from "react"
import { Command } from "lucide-react"
import { SidebarData, SidebarItem, sideBarItems } from '@/config/side-bar-items'

import { NavUser } from "./nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar"
import { usePathname, useRouter } from "next/navigation";

// This is sample data
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  }
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const [activeItem, setActiveItem] = React.useState<SidebarItem>();
  const [filterText, setFilterText] = React.useState<string>();
  const [items, setItems] = React.useState<SidebarData[]>([]);

  React.useEffect(() => {
    const currentlyActiveItem = sideBarItems.filter((item) => {
      const regex = new RegExp(`^${item.url}`, 'i');
      console.log(regex, pathname);
      return new RegExp(`^${item.url}`, 'i').test(pathname)
    }).reduce((acc, curr) => {
      console.log(curr)
      if (acc.url === pathname) return acc;
      if (acc.url.length > curr.url.length) return acc;
      return curr;
    });

    setActiveItem(currentlyActiveItem);

    currentlyActiveItem.loadData(filterText).then(data => 
      setItems(data)
    );
  }, [pathname, filterText]);
  
  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden [&>[data-sidebar=sidebar]]:flex-row"
      {...props}
    >
      <Sidebar
        collapsible="none"
        className="!w-[calc(var(--sidebar-width-icon)_+_1px)] border-r"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                <a href="/v0">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Command className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">CUview</span>
                    <span className="truncate text-xs">Voice</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {sideBarItems.filter(item => !item.hide).map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <a href={item.url}>
                      <SidebarMenuButton
                        tooltip={{
                          children: item.title,
                          hidden: false,
                        }}
                        isActive={activeItem && activeItem.title === item.title}
                        className="px-2.5 md:px-2"
                      >
                          {item.icon}
                        <span>{pathname}</span>
                      </SidebarMenuButton>
                    </a>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={data.user} />
        </SidebarFooter>
      </Sidebar>

      {/* This is the second sidebar */}
      {/* We disable collapsible and let it fill remaining space */}
      <Sidebar collapsible="none" className="hidden flex-1 md:flex">
        <SidebarHeader className="gap-3.5 border-b p-4">
          <div className="flex w-full items-center justify-between">
            <div className="text-base font-medium text-foreground">
              {activeItem && activeItem.title}
            </div>
          </div>
          <SidebarInput placeholder="Type to search..." onInput={(e) => setFilterText(e.currentTarget.value)}/>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="px-0">
            <SidebarGroupContent>
              {items.length
                ? items.map((item, i) => (
                    <a
                      href={item.url}
                      key={`${activeItem?.title}-${item.name}-${i}`}
                      className="flex flex-col items-start gap-2 whitespace-nowrap border-b p-4 text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    >
                      <div className="flex w-full items-center gap-2">
                        <span>{item.name}</span>{" "}
                        <span className="ml-auto text-xs">{item.badge}</span>
                      </div>
                      <span className="line-clamp-2 w-[260px] whitespace-break-spaces text-xs">
                        {item.description}
                      </span>
                    </a>
                  ))
                : (
                    <div
                      className="flex flex-col items-start gap-2 whitespace-nowrap border-b p-4 text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    >
                      <div className="flex w-full items-center gap-2">
                        <span>{activeItem?.emptyMessage.name}</span>{" "}
                        <span className="ml-auto text-xs">{activeItem?.emptyMessage.badge}</span>
                      </div>
                      <span className="line-clamp-2 w-[260px] whitespace-break-spaces text-xs">
                        {activeItem?.emptyMessage.description}
                      </span>
                    </div>
                )
              }
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  )
}