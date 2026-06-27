"use client"

import "./globals.css";

import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from "@/components/ui/sidebar";
import Link from "next/link";
import { BarChart3, Calendar, FolderKanban, Layout, Users } from "lucide-react";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }) {

    const pathname = usePathname();

    const isActive = (path) => {
        if (path === "/")
            return pathname == "/";
        return pathname.startsWith(path);
    };

    return (
        <html lang="it">
            <body className="overflow-y-scroll max-w-screen">
                <SidebarProvider>
                    <Sidebar collapsible="icon">
                        <SidebarHeader className="border-b border-sidebar-border h-auto items-center">
                            Time Tracker
                        </SidebarHeader>
                        <SidebarContent className="p-2">
                            <SidebarMenu>
                                <SidebarMenuItem key="dashboard">
                                    <SidebarMenuButton asChild tooltip="Dashboard" isActive={isActive("/")}>
                                        <Link href="/">
                                            <Layout className="h-4 w-4" />
                                            <span>Dashboard</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                {/* <SidebarMenuItem key="calendar">
                                    <SidebarMenuButton asChild tooltip="Calendario" isActive={isActive("/calendario")}>
                                        <Link href="/calendario">
                                            <Calendar className="h-4 w-4" />
                                            <span>Calendario</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem> */}
                                <SidebarMenuItem key="clients">
                                    <SidebarMenuButton asChild tooltip="Clienti" isActive={isActive("/clienti")}>
                                        <Link href="/clienti">
                                            <Users className="h-4 w-4" />
                                            <span>Clienti</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem key="projects">
                                    <SidebarMenuButton asChild tooltip="Progetti" isActive={isActive("/progetti")}>
                                        <Link href="/progetti">
                                            <FolderKanban className="h-4 w-4" />
                                            <span>Progetti</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem key="statistics">
                                    <SidebarMenuButton asChild tooltip="Statistiche" isActive={isActive("/statistiche")}>
                                        <Link href="/statistiche">
                                            <BarChart3 className="h-4 w-4" />
                                            <span>Statistiche</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarContent>
                    </Sidebar>
                    <SidebarInset>
                        <main className="flex-1 p-6 px-8">
                            {children}
                        </main>
                    </SidebarInset>
                </SidebarProvider>
            </body>
        </html>
    );
}
