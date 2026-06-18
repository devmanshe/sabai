"use client"
import { useEffect, useState } from "react"
import { supabaseBrowser } from "@/lib/supabaseBrowser"
import type { User } from "@supabase/supabase-js"
import { userAgent } from "next/server"

export const useSession = () => {
    const [user, setUser] = useState<User | null>(null)
    const [isReady, setIsReady] = useState(false)

    useEffect(() => {
        supabaseBrowser.auth.getSession().then(({data: {session}}) => {
            setUser(session?.user ?? null)
            setIsReady(true)
        })

        const {data: {subscription}} = supabaseBrowser.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null)
                setIsReady(true)
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    return {user, isReady}
}