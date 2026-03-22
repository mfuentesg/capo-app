import { importFromCifraClub } from "../../../utils/import/cifraclub-importer"

const FIXTURE_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta property="og:title" content="Amazing Grace - John Newton" />
  <script type="application/ld+json">
  {
    "name": "Amazing Grace",
    "byArtist": { "name": "John Newton" }
  }
  </script>
</head>
<body>
  <pre class="cifra">G      C
Amazing grace how sweet the sound
G      D
That saved a wretch like me</pre>
</body>
</html>
`

describe("importFromCifraClub", () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(FIXTURE_HTML)
    } as unknown as Response)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("extracts title from JSON-LD", async () => {
    const song = await importFromCifraClub(new URL("https://www.cifraclub.com.br/john-newton/amazing-grace/"))
    expect(song.title).toBe("Amazing Grace")
  })

  it("extracts artist from JSON-LD byArtist", async () => {
    const song = await importFromCifraClub(new URL("https://www.cifraclub.com.br/john-newton/amazing-grace/"))
    expect(song.artist).toBe("John Newton")
  })

  it("converts chord-above-lyrics to ChordPro format", async () => {
    const song = await importFromCifraClub(new URL("https://www.cifraclub.com.br/john-newton/amazing-grace/"))
    expect(song.lyrics).toContain("[G]")
    expect(song.lyrics).toContain("[C]")
  })

  it("returns isDraft: true", async () => {
    const song = await importFromCifraClub(new URL("https://www.cifraclub.com.br/john-newton/amazing-grace/"))
    expect(song.isDraft).toBe(true)
  })

  it("throws on non-OK response", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      text: () => Promise.resolve("")
    } as unknown as Response)

    await expect(
      importFromCifraClub(new URL("https://www.cifraclub.com.br/missing/"))
    ).rejects.toThrow("Failed to fetch: 404")
  })

  it("falls back to og:title when JSON-LD is missing", async () => {
    const htmlWithoutJsonLd = `
      <html><head>
        <meta property="og:title" content="Fallback Title" />
      </head><body>
        <pre class="cifra">Some lyrics</pre>
      </body></html>
    `
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(htmlWithoutJsonLd)
    } as unknown as Response)

    const song = await importFromCifraClub(new URL("https://www.cifraclub.com.br/artist/song/"))
    expect(song.title).toBe("Fallback Title")
  })
})
