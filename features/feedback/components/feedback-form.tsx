"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLocale } from "@/features/settings"
import { submitFeedback } from "@/features/feedback"

const schema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  message: z.string().min(5),
  newsletterOptIn: z.boolean()
})

type FormValues = z.infer<typeof schema>

interface FeedbackFormProps {
  className?: string
}

export function FeedbackForm({ className }: FeedbackFormProps) {
  const { t } = useLocale()
  const f = t.landing.feedback
  const [isPending, startTransition] = useTransition()
  const [succeeded, setSucceeded] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { newsletterOptIn: false }
  })

  const onSubmit = (values: FormValues) => {
    setServerError(null)
    startTransition(async () => {
      const result = await submitFeedback({
        name: values.name,
        email: values.email,
        message: values.message,
        newsletterOptIn: values.newsletterOptIn
      })
      if (result.success) {
        setSucceeded(true)
      } else {
        setServerError(f.errorMessage)
      }
    })
  }

  if (succeeded) {
    return (
      <div
        className={cn(
          "flex flex-col items-center gap-4 rounded-2xl border border-green-500/20 bg-green-500/5 px-8 py-12 text-center",
          className
        )}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle className="h-7 w-7 text-green-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">{f.successTitle}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{f.successDescription}</p>
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("flex flex-col gap-5", className)}
      noValidate
    >
      {/* Name + Email row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="feedback-name" className="text-sm font-medium">
            {f.nameLabel}
          </Label>
          <Input
            id="feedback-name"
            placeholder={f.namePlaceholder}
            {...register("name")}
            className="h-10"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="feedback-email" className="text-sm font-medium">
            {f.emailLabel}
          </Label>
          <Input
            id="feedback-email"
            type="email"
            placeholder={f.emailPlaceholder}
            {...register("email")}
            className={cn("h-10", errors.email && "border-destructive")}
          />
        </div>
      </div>

      {/* Message */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="feedback-message" className="text-sm font-medium">
          {f.messageLabel}
        </Label>
        <textarea
          id="feedback-message"
          rows={5}
          placeholder={f.messagePlaceholder}
          {...register("message")}
          className={cn(
            "flex w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
            errors.message && "border-destructive"
          )}
        />
      </div>

      {/* Newsletter opt-in */}
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          {...register("newsletterOptIn")}
          className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
        />
        <span className="text-sm text-muted-foreground leading-snug">{f.newsletterLabel}</span>
      </label>

      {serverError && (
        <p className="rounded-md border border-destructive/30 bg-destructive/8 px-4 py-2.5 text-sm text-destructive">
          {serverError}
        </p>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="h-11 w-full sm:w-auto sm:self-end px-8 font-medium"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {f.submitting}
          </>
        ) : (
          f.submit
        )}
      </Button>
    </form>
  )
}
