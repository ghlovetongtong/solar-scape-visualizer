
import React from "react";
import { Layout, Menu, Button } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";

const { Sider } = Layout;

export const useSidebar = () => {
  const [collapsed, setCollapsed] = React.useState(false);
  
  return {
    collapsed,
    toggleSidebar: () => setCollapsed(!collapsed),
    setCollapsed
  };
};

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex min-h-screen w-full">{children}</div>;
};

export const Sidebar = ({ 
  children,
  className,
}: React.PropsWithChildren<{ className?: string }>) => {
  const { collapsed, toggleSidebar } = useSidebar();

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={toggleSidebar}
      className={className}
      theme="light"
    >
      {children}
    </Sider>
  );
};

export const SidebarTrigger = () => {
  const { collapsed, toggleSidebar } = useSidebar();
  
  return (
    <Button
      type="text"
      icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      onClick={toggleSidebar}
      className="h-7 w-7"
    />
  );
};

export const SidebarContent = ({ children }: React.PropsWithChildren) => (
  <div className="flex-1 overflow-auto">{children}</div>
);

export const SidebarHeader = ({ children }: React.PropsWithChildren) => (
  <div className="p-4">{children}</div>
);

export const SidebarFooter = ({ children }: React.PropsWithChildren) => (
  <div className="p-4 border-t">{children}</div>
);

export const SidebarMenu = ({ items = [] }: { items?: any[] }) => (
  <Menu mode="inline" items={items} />
);

// Simple stubs to avoid errors
export const SidebarGroup = ({ children }: React.PropsWithChildren) => <div>{children}</div>;
export const SidebarGroupLabel = ({ children }: React.PropsWithChildren) => <div className="text-sm font-medium text-gray-500 p-2">{children}</div>;
export const SidebarGroupContent = ({ children }: React.PropsWithChildren) => <div>{children}</div>;
export const SidebarGroupAction = () => null;
export const SidebarMenuItem = ({ children }: React.PropsWithChildren) => <div>{children}</div>;
export const SidebarMenuButton = ({ children }: React.PropsWithChildren) => <div>{children}</div>;
export const SidebarMenuAction = () => null;
export const SidebarMenuBadge = () => null;
export const SidebarMenuSkeleton = () => null;
export const SidebarMenuSub = ({ children }: React.PropsWithChildren) => <div>{children}</div>;
export const SidebarMenuSubItem = ({ children }: React.PropsWithChildren) => <div>{children}</div>;
export const SidebarMenuSubButton = ({ children }: React.PropsWithChildren) => <div>{children}</div>;
export const SidebarRail = () => null;
export const SidebarSeparator = () => <div className="h-px bg-gray-200 my-2"></div>;
export const SidebarInset = ({ children }: React.PropsWithChildren) => <div className="relative flex-1">{children}</div>;
export const SidebarInput = () => null;
