"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { IconPicker } from "@/components/ui/icon-picker"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { createTeam } from "@/features/teams"
import { toast } from "sonner"
import { useUser } from "@/features/auth"
import { useTranslation } from "@/hooks/use-translation"
import type { TablesInsert } from "@/lib/supabase/database.types"

type TeamFormValues = {
  name: string
  description?: string
  is_public: boolean
  icon?: string
}

export function CreateTeamForm() {
  const router = useRouter()
  const { data: user } = useUser()
  const { t } = useTranslation()

  const teamFormSchema = z.object({
    name: z
      .string()
      .min(1, t.validation.required.replace("{field}", t.validation.teamName))
      .max(100, t.validation.tooLong.replace("{field}", t.validation.teamName))
      .trim(),
    description: z
      .string()
      .max(500, t.validation.tooLong.replace("{field}", t.validation.description))
      .optional()
      .or(z.literal("")),
    is_public: z.boolean(),
    icon: z.string().optional()
  })

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      name: "",
      description: "",
      is_public: false,
      icon: "Users"
    }
  })

  const onSubmit = async (values: TeamFormValues) => {
    if (!user?.id) {
      toast.error(t.toasts.teamCreatedAuthRequired)
      return
    }

    try {
      const teamData: TablesInsert<"teams"> = {
        name: values.name,
        description: values.description || null,
        is_public: values.is_public,
        created_by: user.id,
        icon: values.icon,
      } 

      const newTeam = await createTeam(teamData)
      toast.success(t.toasts.teamCreated)
      // Redirect to teams page with query parameter to switch to the new team
      router.push(`/dashboard/teams?switchToTeamId=${newTeam.id}`)
    } catch (error) {
      console.error("Error creating team:", error)
      toast.error(t.toasts.teamCreatedFailed)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-lg border bg-card p-6 space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="team-name">{t.teams.teamName}</FormLabel>
                <FormControl>
                  <InputGroup>
                    <FormField
                      control={form.control}
                      name="icon"
                      render={({ field: iconField }) => (
                        <InputGroupAddon>
                          <IconPicker value={iconField.value} onChange={iconField.onChange} />
                        </InputGroupAddon>
                      )}
                    />
                    <InputGroupInput
                      id="team-name"
                      placeholder={t.teams.teamNamePlaceholder}
                      {...field}
                    />
                  </InputGroup>
                </FormControl>
                <FormDescription>
                  {t.teams.teamNameDescription}
                  {t.teams.clickIconToChange}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.teams.description}</FormLabel>
                <FormControl>
                  <Input placeholder={t.teams.descriptionPlaceholder} {...field} />
                </FormControl>
                <FormDescription>{t.teams.descriptionDescription}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />



          <FormField
            control={form.control}
            name="is_public"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>{t.teams.publicTeam}</FormLabel>
                  <FormDescription>{t.teams.publicTeamDescription}</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard/teams">{t.common.cancel}</Link>
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? t.teams.creating : t.teams.createTeam}
          </Button>
        </div>
      </form>
    </Form>
  )
}
