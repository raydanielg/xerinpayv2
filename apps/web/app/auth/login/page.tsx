"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Loader2, Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { PasswordStrength } from "@/components/password-strength"

type AuthMode = "login" | "register"

function fieldErrorClass(error?: string) {
  return error ? "border-red-500 focus-visible:ring-red-500/30" : ""
}

function AuthFormInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialTab = searchParams.get("tab") as AuthMode
  const [mode, setMode] = useState<AuthMode>(
    initialTab === "register" ? "register" : "login"
  )
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Login state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({})

  // Register state
  const [regFirstName, setRegFirstName] = useState("")
  const [regLastName, setRegLastName] = useState("")
  const [regEmail, setRegEmail] = useState("")
  const [regPhone, setRegPhone] = useState("")
  const [regPassword, setRegPassword] = useState("")
  const [regAgreed, setRegAgreed] = useState(false)
  const [regErrors, setRegErrors] = useState<Record<string, string>>({})

  const handleTabChange = (v: string) => {
    setMode(v as AuthMode)
    setLoginErrors({})
    setRegErrors({})
    const newUrl = new URL(window.location.href)
    newUrl.searchParams.set("tab", v)
    window.history.replaceState({}, "", newUrl.toString())
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginErrors({})
    if (!loginEmail || !loginPassword) {
      setLoginErrors({
        ...(!loginEmail && { email: "Email is required" }),
        ...(!loginPassword && { password: "Password is required" }),
      })
      return
    }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast.success("Welcome back!", {
        description: "You have been signed in successfully.",
      })
      router.push("/dashboard")
    }, 1500)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegErrors({})
    if (!regAgreed) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast.success("Account created!", {
        description: "Welcome to XerinPay. Your account is ready.",
      })
      router.push("/dashboard")
    }, 1500)
  }

  const inputClass = "pl-10 pr-3 bg-background/50 backdrop-blur-sm transition-all hover:border-primary/30 focus-visible:border-primary focus-visible:ring-primary/20"

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col items-center gap-3 text-center">
        <Image
          src="/logo.svg"
          alt="XerinPay"
          width={56}
          height={56}
          className="size-14"
          priority
        />
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === "login"
              ? "Sign in to continue to XerinPay"
              : "Join XerinPay and start managing your money today"}
          </p>
        </div>
      </div>

      {mode === "login" ? (
        <form className="flex flex-col gap-5" onSubmit={handleLogin}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="login-email" className="text-sm font-medium">Email address</FieldLabel>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  className={cn(inputClass, fieldErrorClass(loginErrors.email))}
                  value={loginEmail}
                  onChange={(e) => {
                    setLoginEmail(e.target.value)
                    if (loginErrors.email) setLoginErrors((p) => ({ ...p, email: "" }))
                  }}
                  required
                />
              </div>
              {loginErrors.email && (
                <FieldDescription className="text-red-500">{loginErrors.email}</FieldDescription>
              )}
            </Field>

            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="login-password" className="text-sm font-medium">Password</FieldLabel>
                <Link
                  href="/auth/forgot"
                  className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className={cn(inputClass, "pr-9", fieldErrorClass(loginErrors.password))}
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value)
                    if (loginErrors.password) setLoginErrors((p) => ({ ...p, password: "" }))
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {loginErrors.password && (
                <FieldDescription className="text-red-500">{loginErrors.password}</FieldDescription>
              )}
            </Field>

            <Field orientation="horizontal" className="items-center gap-2 pt-1">
              <Checkbox id="remember" defaultChecked />
              <FieldLabel htmlFor="remember" className="text-sm font-normal text-muted-foreground">
                Remember me for 30 days
              </FieldLabel>
            </Field>

            <Button type="submit" className="mt-1 h-9 w-full rounded-md text-sm font-medium shadow-sm transition-all hover:shadow-md" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>

            <FieldDescription className="pt-2 text-center text-sm">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => handleTabChange("register")}
                className="font-semibold text-primary underline underline-offset-4"
              >
                Sign up for free
              </button>
            </FieldDescription>
          </FieldGroup>
        </form>
      ) : (
        <form className="flex flex-col gap-5" onSubmit={handleRegister}>
          <FieldGroup>
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="reg-first-name" className="text-sm font-medium">First name</FieldLabel>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input
                    id="reg-first-name"
                    type="text"
                    placeholder="John"
                    className={cn(inputClass, fieldErrorClass(regErrors.first_name))}
                    value={regFirstName}
                    onChange={(e) => {
                      setRegFirstName(e.target.value)
                      if (regErrors.first_name) setRegErrors((p) => ({ ...p, first_name: "" }))
                    }}
                    required
                  />
                </div>
                {regErrors.first_name && (
                  <FieldDescription className="text-red-500">{regErrors.first_name}</FieldDescription>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="reg-last-name" className="text-sm font-medium">Last name</FieldLabel>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input
                    id="reg-last-name"
                    type="text"
                    placeholder="Doe"
                    className={cn(inputClass, fieldErrorClass(regErrors.last_name))}
                    value={regLastName}
                    onChange={(e) => {
                      setRegLastName(e.target.value)
                      if (regErrors.last_name) setRegErrors((p) => ({ ...p, last_name: "" }))
                    }}
                    required
                  />
                </div>
                {regErrors.last_name && (
                  <FieldDescription className="text-red-500">{regErrors.last_name}</FieldDescription>
                )}
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="reg-email" className="text-sm font-medium">Email address</FieldLabel>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="you@example.com"
                  className={cn(inputClass, fieldErrorClass(regErrors.email))}
                  value={regEmail}
                  onChange={(e) => {
                    setRegEmail(e.target.value)
                    if (regErrors.email) setRegErrors((p) => ({ ...p, email: "" }))
                  }}
                  required
                />
              </div>
              {regErrors.email && (
                <FieldDescription className="text-red-500">{regErrors.email}</FieldDescription>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="reg-phone" className="text-sm font-medium">Phone number</FieldLabel>
              <div className="relative group">
                <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  id="reg-phone"
                  type="tel"
                  placeholder="+255 7XX XXX XXX"
                  className={cn(inputClass, fieldErrorClass(regErrors.phone))}
                  value={regPhone}
                  onChange={(e) => {
                    setRegPhone(e.target.value)
                    if (regErrors.phone) setRegErrors((p) => ({ ...p, phone: "" }))
                  }}
                  required
                />
              </div>
              {regErrors.phone && (
                <FieldDescription className="text-red-500">{regErrors.phone}</FieldDescription>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="reg-password" className="text-sm font-medium">Password</FieldLabel>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  className={cn(inputClass, "pr-9", fieldErrorClass(regErrors.password))}
                  value={regPassword}
                  onChange={(e) => {
                    setRegPassword(e.target.value)
                    if (regErrors.password) setRegErrors((p) => ({ ...p, password: "" }))
                  }}
                  required
                  minLength={10}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <PasswordStrength password={regPassword} className="mt-2" />
              {regErrors.password && (
                <FieldDescription className="text-red-500">{regErrors.password}</FieldDescription>
              )}
            </Field>

            <Field orientation="horizontal" className="items-start gap-2.5 pt-1">
              <Checkbox
                id="terms"
                className="mt-0.5"
                checked={regAgreed}
                onCheckedChange={(val) => setRegAgreed(!!val)}
              />
              <FieldLabel
                htmlFor="terms"
                className="text-sm font-normal leading-snug text-muted-foreground"
              >
                I agree to the{" "}
                <a href="/terms" className="font-medium text-primary underline underline-offset-4">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" className="font-medium text-primary underline underline-offset-4">
                  Privacy Policy
                </a>
              </FieldLabel>
            </Field>

            <Button type="submit" className="mt-1 h-9 w-full rounded-md text-sm font-medium shadow-sm transition-all hover:shadow-md" disabled={loading || !regAgreed}>
              {loading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>

            <FieldDescription className="pt-2 text-center text-sm">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => handleTabChange("login")}
                className="font-semibold text-primary underline underline-offset-4"
              >
                Sign in
              </button>
            </FieldDescription>
          </FieldGroup>
        </form>
      )}
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <AuthFormInner />
    </Suspense>
  )
}
