"use client"

import { useAuth, getRedirectPath } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

type AllowedRole = 'patient' | 'clinician' | 'admin'

interface RequireRoleProps {
    children: React.ReactNode
    allowedRoles: AllowedRole[]
    fallbackPath?: string
}

/**
 * Component that protects routes based on user role.
 * Redirects to appropriate dashboard if user doesn't have required role.
 */
export function RequireRole({ children, allowedRoles, fallbackPath }: RequireRoleProps) {
    const { user, isLoading, isAuthenticated } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (isLoading) return

        // Not authenticated - redirect to login
        if (!isAuthenticated || !user) {
            router.replace('/auth')
            return
        }

        // Check if user has required role
        const hasAccess = allowedRoles.includes(user.role as AllowedRole)

        if (!hasAccess) {
            // Redirect to their correct dashboard
            const correctPath = fallbackPath || getRedirectPath(user)
            router.replace(correctPath)
        }
    }, [user, isLoading, isAuthenticated, allowedRoles, fallbackPath, router])

    // Show loading while checking
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        )
    }

    // Not authenticated
    if (!isAuthenticated || !user) {
        return null
    }

    // No access
    if (!allowedRoles.includes(user.role as AllowedRole)) {
        return null
    }

    return <>{children}</>
}

/**
 * Shorthand for patient-only routes
 */
export function RequirePatient({ children }: { children: React.ReactNode }) {
    return <RequireRole allowedRoles={['patient']}>{children}</RequireRole>
}

/**
 * Shorthand for clinician-only routes (nurses and doctors)
 */
export function RequireClinician({ children }: { children: React.ReactNode }) {
    return <RequireRole allowedRoles={['clinician']}>{children}</RequireRole>
}

/**
 * Shorthand for admin-only routes
 */
export function RequireAdmin({ children }: { children: React.ReactNode }) {
    return <RequireRole allowedRoles={['admin']}>{children}</RequireRole>
}
