"use client"

import {useMutation} from "@tanstack/react-query"
import {authService} from "@/services/auth.service"
import {useRouter} from "next/navigation"
import {toast} from "sonner"

export const useLogin = () => {
    const router = useRouter()
    return useMutation({
        mutationFn: ({email, password}: {email: string; password: string}) =>
            authService.login(email, password),
        onSuccess: (data) => {
            const role = data.user?.user_metadata?.role
            toast.success(`Selamat datang, ${data.user.email}`)
            
            if (role === "Superadmin"){
                router.push("/superadmin")
            } else if (role === "Admin"){
                router.push("/admin")
            } else {
                router.push("/buyer")
            }
        },
        onError: (error: any) => {
            toast.error(error.message || "Gagal login. Silahkan coba lagi")
        }
    })
}

export const useRegister = () => {
    const router = useRouter()
    return useMutation({
        mutationFn: ({email, password, username, phone, role}: {email: string; password: string; phone: string; username: string; role: string}) =>
            authService.register(email, password, username, phone, role),
        onSuccess: () => {
            toast.success("Register berhasil, silahkan login")
            router.push("/auth")
        },
        onError: (error: any) => {
            toast.error(error.message || "Gagal register akun, silahkan coba lagi")
        }
    })
}

export const useLogout = () => {
    const router = useRouter()
    return useMutation({
        mutationFn: () => authService.logout(),
        onSuccess: () => {
            router.push("/login")
        }
    })
}