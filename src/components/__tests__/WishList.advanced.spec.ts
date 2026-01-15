import { render, screen, fireEvent } from "@testing-library/vue"
import { vi, describe, it, expect, beforeEach } from "vitest"
import WishList from "../WishList.vue"
import { createRouter, createMemoryHistory } from "vue-router"

// Router Setup
const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: "/lists/:id", component: WishList }]
})

// Mock für useRoute()
vi.mock("vue-router", async () => {
  const actual = await vi.importActual<typeof import("vue-router")>("vue-router")
  return {
    ...actual,
    useRoute: () => ({ params: { id: "1" } })
  }
})

// Fetch Mock
const mockFetch = vi.fn()
global.fetch = mockFetch as unknown as typeof fetch

function setup() {
  return render(WishList, {
    global: { plugins: [router] }
  })
}

beforeEach(() => {
  mockFetch.mockReset()
})

//
// 1) FILTER TESTS
//
describe("WishList → Filter", () => {
  it("filterStatus = open zeigt nur unerfüllte Wünsche", async () => {
    mockFetch.mockResolvedValueOnce({
      json: () =>
        Promise.resolve([
          { id: 1, title: "A", price: 10, fulfilled: false, priority: "mittel", name: "", description: "", status: "" },
          { id: 2, title: "B", price: 10, fulfilled: true, priority: "mittel", name: "", description: "", status: "" }
        ])
    } as Response)

    setup()

    // Filter anwenden
    await fireEvent.click(await screen.findByText("Offen"))

    expect(screen.queryByText("A")).toBeInTheDocument()
    expect(screen.queryByText("B")).not.toBeInTheDocument()
  })

  it("filterPriority funktioniert", async () => {
    mockFetch.mockResolvedValueOnce({
      json: () =>
        Promise.resolve([
          { id: 1, title: "A", price: 10, fulfilled: false, priority: "hoch", name: "", description: "", status: "" },
          { id: 2, title: "B", price: 10, fulfilled: false, priority: "niedrig", name: "", description: "", status: "" }
        ])
    } as Response)

    setup()

    // Priority Dropdown ändern
    await fireEvent.update(await screen.findByDisplayValue("Alle"), "hoch")

    expect(screen.queryByText("A")).toBeInTheDocument()
    expect(screen.queryByText("B")).not.toBeInTheDocument()
  })
})

//
// 2) EDIT / UPDATE TESTS
//
describe("WishList → Edit / Update", () => {
  it("editWish aktiviert Editiermodus", async () => {
    mockFetch.mockResolvedValueOnce({
      json: () =>
        Promise.resolve([
          { id: 1, title: "A", name: "Max", description: "", status: "", price: 10, fulfilled: false, priority: "mittel" }
        ])
    } as Response)

    setup()

    await fireEvent.click(await screen.findByText("✏️"))

    // Erwartung: Input-Felder erscheinen
    expect(screen.getByDisplayValue("A")).toBeInTheDocument()
    expect(screen.getByDisplayValue("Max")).toBeInTheDocument()
  })

  it("updateWish sendet PUT und beendet Editmodus", async () => {
    // Initial Load
    mockFetch.mockResolvedValueOnce({
      json: () =>
        Promise.resolve([
          { id: 1, title: "A", name: "Max", description: "", status: "", price: 10, fulfilled: false, priority: "mittel" }
        ])
    } as Response)

    // PUT success
    mockFetch.mockResolvedValueOnce({ ok: true } as Response)

    // reload after update
    mockFetch.mockResolvedValueOnce({
      json: () =>
        Promise.resolve([
          { id: 1, title: "UPDATED", name: "Max", description: "", status: "", price: 10, fulfilled: false, priority: "mittel" }
        ])
    } as Response)

    setup()

    await fireEvent.click(await screen.findByText("✏️"))
    await fireEvent.update(screen.getByDisplayValue("A"), "UPDATED")
    await fireEvent.click(screen.getByText("💾"))

    expect(await screen.findByText("UPDATED")).toBeInTheDocument()
  })

  it("Cancel beendet den Editmodus ohne zu speichern", async () => {
    mockFetch.mockResolvedValueOnce({
      json: () =>
        Promise.resolve([
          { id: 1, title: "A", name: "Max", description: "", status: "", price: 10, fulfilled: false, priority: "mittel" }
        ])
    } as Response)

    setup()

    await fireEvent.click(await screen.findByText("✏️"))
    await fireEvent.click(screen.getByText("❌"))

    // UI zeigt wieder normalen Titel
    expect(await screen.findByText("A")).toBeInTheDocument()
  })
})

//
// 3) totalPrice TESTS
//
describe("WishList → totalPrice", () => {
  it("berechnet die korrekte Summe", async () => {
    mockFetch.mockResolvedValueOnce({
      json: () =>
        Promise.resolve([
          { id: 1, title: "A", price: 10, fulfilled: false, priority: "mittel", name: "", description: "", status: "" },
          { id: 2, title: "B", price: 20, fulfilled: false, priority: "mittel", name: "", description: "", status: "" }
        ])
    } as Response)

    setup()

    expect(await screen.findByText("Gesamtsumme: 30 €")).toBeInTheDocument()
  })

  it("Filter beeinflussen totalPrice", async () => {
    mockFetch.mockResolvedValueOnce({
      json: () =>
        Promise.resolve([
          { id: 1, title: "A", price: 50, fulfilled: false, priority: "hoch", name: "", description: "", status: "" },
          { id: 2, title: "B", price: 10, fulfilled: false, priority: "niedrig", name: "", description: "", status: "" }
        ])
    } as Response)

    setup()

    // Filter: priority = hoch
    await fireEvent.update(await screen.findByDisplayValue("Alle"), "hoch")

    expect(await screen.findByText("Gesamtsumme: 50 €")).toBeInTheDocument()
  })
})

//
// 4) EMPTY & ERROR STATES
//
describe("WishList → Empty & Error States", () => {
  it("zeigt leere Liste korrekt an", async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve([])
    } as Response)

    setup()

    // Keine Fehler → UI normal
    expect(await screen.findByText("Gesamtsumme: 0 €")).toBeInTheDocument()
  })

  it("zeigt nichts an, wenn API kaputt ist (Fehlerhandling)", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network Error"))

    setup()

    // UI sollte nicht crashen → Graceful handling
    expect(await screen.findByText("Gesamtsumme: 0 €")).toBeInTheDocument()
  })
})
