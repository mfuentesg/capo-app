import { detectPlatform } from "../../../utils/import/platform-detector"

describe("detectPlatform", () => {
  it("detects cifraclub.com.br", () => {
    expect(detectPlatform(new URL("https://www.cifraclub.com.br/nome-artista/nome-musica/"))).toBe(
      "cifraclub"
    )
  })

  it("detects cifraclub without www", () => {
    expect(detectPlatform(new URL("https://cifraclub.com.br/nome-artista/nome-musica/"))).toBe(
      "cifraclub"
    )
  })

  it("detects ultimate-guitar.com", () => {
    expect(
      detectPlatform(new URL("https://www.ultimate-guitar.com/tabs/artist/song-chords.htm"))
    ).toBe("ultimate-guitar")
  })

  it("detects tabs.ultimate-guitar.com", () => {
    expect(
      detectPlatform(new URL("https://tabs.ultimate-guitar.com/tab/artist/song-chords-12345"))
    ).toBe("ultimate-guitar")
  })

  it("detects lacuerda.net", () => {
    expect(detectPlatform(new URL("https://www.lacuerda.net/canciones/artista/cancion"))).toBe(
      "lacuerda"
    )
  })

  it("returns unknown for unsupported domains", () => {
    expect(detectPlatform(new URL("https://example.com/song"))).toBe("unknown")
  })

  it("strips www prefix before comparing", () => {
    expect(detectPlatform(new URL("https://www.lacuerda.net/"))).toBe("lacuerda")
  })
})
