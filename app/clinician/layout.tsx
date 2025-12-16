"use client"

import { ClinicianRoleProvider } from "@/contexts/clinician-role-context"
import { RequireClinician } from "@/components/require-role"

export default function ClinicianLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <RequireClinician>
            <ClinicianRoleProvider>
                {children}
            </ClinicianRoleProvider>
        </RequireClinician>
    )
}
