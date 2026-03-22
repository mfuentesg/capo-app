import { render, screen, fireEvent } from "@testing-library/react"
import { TagInput } from "@/features/song-draft/components/tag-input"

describe("TagInput", () => {
  it("adds a tag on Enter", () => {
    const onChange = jest.fn()
    render(<TagInput value={[]} onChange={onChange} placeholder="Add tags" />)

    const input = screen.getByRole("textbox")
    fireEvent.change(input, { target: { value: "worship" } })
    fireEvent.keyDown(input, { key: "Enter" })

    expect(onChange).toHaveBeenCalledWith(["worship"])
  })

  it("adds a tag on comma", () => {
    const onChange = jest.fn()
    render(<TagInput value={[]} onChange={onChange} />)

    const input = screen.getByRole("textbox")
    fireEvent.change(input, { target: { value: "upbeat" } })
    fireEvent.keyDown(input, { key: "," })

    expect(onChange).toHaveBeenCalledWith(["upbeat"])
  })

  it("adds a tag on blur", () => {
    const onChange = jest.fn()
    render(<TagInput value={[]} onChange={onChange} />)

    const input = screen.getByRole("textbox")
    fireEvent.change(input, { target: { value: "christmas" } })
    fireEvent.blur(input)

    expect(onChange).toHaveBeenCalledWith(["christmas"])
  })

  it("skips duplicate tags", () => {
    const onChange = jest.fn()
    render(<TagInput value={["worship"]} onChange={onChange} />)

    const input = screen.getByRole("textbox")
    fireEvent.change(input, { target: { value: "worship" } })
    fireEvent.keyDown(input, { key: "Enter" })

    expect(onChange).not.toHaveBeenCalled()
  })

  it("removes tag on Backspace when input is empty", () => {
    const onChange = jest.fn()
    render(<TagInput value={["worship", "upbeat"]} onChange={onChange} />)

    const input = screen.getByRole("textbox")
    fireEvent.keyDown(input, { key: "Backspace" })

    expect(onChange).toHaveBeenCalledWith(["worship"])
  })

  it("removes tag when X button is clicked", () => {
    const onChange = jest.fn()
    render(<TagInput value={["worship", "upbeat"]} onChange={onChange} />)

    const removeBtn = screen.getByLabelText("Remove tag worship")
    fireEvent.click(removeBtn)

    expect(onChange).toHaveBeenCalledWith(["upbeat"])
  })

  it("normalizes tags to lowercase", () => {
    const onChange = jest.fn()
    render(<TagInput value={[]} onChange={onChange} />)

    const input = screen.getByRole("textbox")
    fireEvent.change(input, { target: { value: "Worship" } })
    fireEvent.keyDown(input, { key: "Enter" })

    expect(onChange).toHaveBeenCalledWith(["worship"])
  })

  it("does not add empty tags", () => {
    const onChange = jest.fn()
    render(<TagInput value={[]} onChange={onChange} />)

    const input = screen.getByRole("textbox")
    fireEvent.keyDown(input, { key: "Enter" })

    expect(onChange).not.toHaveBeenCalled()
  })
})
