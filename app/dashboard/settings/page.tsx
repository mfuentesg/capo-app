"use client"

import { useState } from "react"
import { useLocale } from "@/contexts/locale-context"
import { locales, localeNames, type Locale } from "@/lib/i18n/config"
import { Label } from "@/components/ui/label"
import { NativeSelect } from "@/components/ui/native-select"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { AlertTriangle } from "lucide-react"

export default function SettingsPage() {
  const { locale, setLocale, t } = useLocale()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLocale(event.target.value as Locale)
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      // TODO: Implement actual account deletion logic
      // This would typically involve:
      // 1. Calling your backend API to delete user data
      // 2. Signing out the uer
      // 3. Redirecting to home page
      console.log("Deleting account...")

      // Placeholder for actual implementation
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // After successful deletion:
      // - Call API to delete user data
      // - Sign out user
      // - Redirect to home
      alert("Account deletion would happen here")
    } catch (error) {
      console.error("Error deleting account:", error)
      alert("Failed to delete account. Please try again.")
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">{t.settings.title}</h1>

      <div className="space-y-8">
        {/* Language Settings */}
        <div className="border rounded-lg p-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">{t.settings.language}</h2>
              <p className="text-sm text-muted-foreground mb-4">{t.settings.languageDescription}</p>
            </div>

            <div className="max-w-xs">
              <Label htmlFor="language-select">{t.settings.language}</Label>
              <NativeSelect
                id="language-select"
                value={locale}
                onChange={handleLanguageChange}
                className="mt-2"
              >
                {locales.map((loc) => (
                  <option key={loc} value={loc}>
                    {localeNames[loc]}
                  </option>
                ))}
              </NativeSelect>
            </div>
          </div>
        </div>

        {/* Account Information (Read-only) */}
        <div className="border rounded-lg p-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">{t.account.title}</h2>
              <p className="text-sm text-muted-foreground">{t.account.info}</p>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="border border-destructive/50 rounded-lg p-6 bg-destructive/5">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2 text-destructive">
                {t.account.dangerZone}
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                {t.account.deleteAccountDescription}
              </p>
            </div>
            <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
              <AlertTriangle className="mr-2 h-4 w-4" />
              {t.account.deleteAccountButton}
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              {t.account.deleteAccountConfirm}
            </DialogTitle>
            <DialogDescription>{t.account.deleteAccountConfirmDescription}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              {t.account.cancelDelete}
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeleting}>
              {isDeleting ? t.common.loading : t.account.confirmDelete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
