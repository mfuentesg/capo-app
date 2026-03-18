"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChordGlossary } from "./chord-glossary"
import { ChordAnalyzer } from "./chord-analyzer"
import { useLocale } from "@/features/settings"
import { BookOpen, ScanSearch } from "lucide-react"

export function ChordsPage() {
  const { t } = useLocale()

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{t.chords.page.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.chords.page.subtitle}</p>
      </div>

      <Tabs defaultValue="glossary">
        <TabsList className="mb-6">
          <TabsTrigger value="glossary" className="gap-2">
            <BookOpen className="h-4 w-4" />
            {t.chords.page.glossaryTab}
          </TabsTrigger>
          <TabsTrigger value="analyzer" className="gap-2">
            <ScanSearch className="h-4 w-4" />
            {t.chords.page.analyzerTab}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="glossary">
          <ChordGlossary />
        </TabsContent>

        <TabsContent value="analyzer">
          <ChordAnalyzer />
        </TabsContent>
      </Tabs>
    </div>
  )
}
