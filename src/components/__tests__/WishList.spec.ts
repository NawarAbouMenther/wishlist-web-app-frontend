import { render, screen, fireEvent } from "@testing-library/vue"
import { vi, beforeEach, describe, it, expect } from "vitest"
import WishList from "../WishList.vue"
import { createRouter, createMemoryHistory } from "vue-router"

// Router Mock
const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: "/lists/:id", component: WishList }]
})

// useRoute mock
vi.mock("vue-router", async () => {
  const actual = await vi.importActual<typeof import("vue-router")>("vue-router")

  return {
    ...actual,
    useRoute: () => ({
      params: { id: "1" }
    })
  }
})

// FETCH MOCK
const mockFetch = vi.fn()

// TypeScript-safe assignment (no "any")
global.fetch = mockFetch as unknown as typeof fetch

function setupComponent() {
  return render(WishList, {
    global: {
      plugins: [router]
    }
  })
}

describe("WishList.vue", () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it("lädt Wünsche beim Mounten", async () => {
    mockFetch.mockResolvedValueOnce({
      json: () =>
        Promise.resolve([
          {
            id: 1,
            title: "Buch",
            name: "Max",
            description: "Fantasy Roman",
            status: "offen",
            price: 20,
            fulfilled: false,
            priority: "mittel"
          }
        ])
    } as Response)

    setupComponent()

    expect(await screen.findByText("Buch")).toBeInTheDocument()
  })

  it("fügt einen neuen Wunsch hinzu", async () => {
    // 1. initial load
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve([])
    } as Response)

    // 2. POST addWish
    mockFetch.mockResolvedValueOnce({ ok: true } as Response)

    // 3. reload after add
    mockFetch.mockResolvedValueOnce({
      json: () =>
        Promise.resolve([
          {
            id: 10,
            title: "Laptop",
            name: "Anna",
            description: "Gaming",
            status: "neu",
            price: 1500,
            fulfilled: false,
            priority: "hoch"
          }
        ])
    } as Response)

    setupComponent()

    await fireEvent.update(screen.getByPlaceholderText("Titel"), "Laptop")
    await fireEvent.update(screen.getByPlaceholderText("Name"), "Anna")
    await fireEvent.update(
      screen.getByPlaceholderText("Beschreibung"),
      "Gaming"
    )
    await fireEvent.update(screen.getByPlaceholderText("Status"), "neu")
    await fireEvent.update(screen.getByPlaceholderText("Preis (€)"), "1500")

    await fireEvent.click(screen.getByText("➕ Hinzufügen"))

    expect(await screen.findByText("Laptop")).toBeInTheDocument()
  })

  it("löscht einen Wunsch", async () => {
    mockFetch.mockResolvedValueOnce({
      json: () =>
        Promise.resolve([
          {
            id: 5,
            title: "Tasche",
            name: "Maria",
            description: "Leder",
            status: "offen",
            price: 80,
            fulfilled: false,
            priority: "niedrig"
          }
        ])
    } as Response)

    mockFetch.mockResolvedValueOnce({ ok: true } as Response)

    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve([])
    } as Response)

    setupComponent()

    await fireEvent.click(await screen.findByText("🗑️"))

    expect(mockFetch).toHaveBeenCalledWith(
      `${import.meta.env.VITE_API_URL}/api/wishes/5`,
      expect.objectContaining({ method: "DELETE" })
    )
  })

  it("markiert einen Wunsch als erfüllt", async () => {
    mockFetch.mockResolvedValueOnce({
      json: () =>
        Promise.resolve([
          {
            id: 3,
            title: "Schuhe",
            name: "Lea",
            description: "Sportschuhe",
            status: "neu",
            price: 120,
            fulfilled: false,
            priority: "hoch"
          }
        ])
    } as Response)

    mockFetch.mockResolvedValueOnce({ ok: true } as Response)

    mockFetch.mockResolvedValueOnce({
      json: () =>
        Promise.resolve([
          {
            id: 3,
            title: "Schuhe",
            name: "Lea",
            description: "Sportschuhe",
            status: "neu",
            price: 120,
            fulfilled: true,
            priority: "hoch"
          }
        ])
    } as Response)

    setupComponent()

    await fireEvent.click(await screen.findByText("✔️"))

    expect(await screen.findByText("✓ erfüllt")).toBeInTheDocument()
  })

  it("sortiert Wünsche nach Preis", async () => {
    mockFetch.mockResolvedValueOnce({
      json: () =>
        Promise.resolve([
          {
            id: 1,
            title: "A",
            name: "",
            description: "",
            status: "",
            price: 200,
            fulfilled: false,
            priority: "mittel"
          },
          {
            id: 2,
            title: "B",
            name: "",
            description: "",
            status: "",
            price: 100,
            fulfilled: false,
            priority: "mittel"
          }
        ])
    } as Response)

    setupComponent()

    await fireEvent.click(screen.getByText("🔼"))

    const items = await screen.findAllByRole("heading", { level: 3 })

    expect(items[0]).toHaveTextContent("B")
    expect(items[1]).toHaveTextContent("A")
  })
})
