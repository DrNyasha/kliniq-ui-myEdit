"use client"

import { RequirePatient } from "@/components/require-role"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <RequirePatient>{children}</RequirePatient>
}
