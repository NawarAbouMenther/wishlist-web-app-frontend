import { render, screen, fireEvent } from "@testing-library/vue"
import { describe, it, expect, beforeEach, vi } from "vitest"
import CategorySelection from "../../views/CategorySelection.vue"
import { createRouter, createMemoryHistory } from "vue-router"

// --- Router Mock ---
const pushMock = vi.fn()

vi.mock("vue-router", async () => {
  const original = await vi.importActual<typeof import("vue-router")>("vue-router")
  return {
    ...original,
    useRouter: () => ({
      push: pushMock
    })
  }
})

// --- Fetch Mock ---
const mockFetch = vi.fn()
global.fetch = mockFetch as unknown as typeof fetch

// Render Helper
function setup() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: "/", component: CategorySelection }]
  })

  return render(CategorySelection, {
    global: { plugins: [router] }
  })
}

beforeEach(() => {
  mockFetch.mockReset()
  pushMock.mockReset()
})

//
// 1) Laden der Kategorien
//
describe("CategorySelection – API", () => {
  it("lädt Kategorien beim Mounten", async () => {
    mockFetch.mockResolvedValueOnce({
      json: () =>
        Promise.resolve([
          { id: 1, key: "birthday", label: "Geburtstag" },
          { id: 2, key: "wedding", label: "Hochzeit" }
        ])
    } as Response)

    setup()

    expect(await screen.findByText("Geburtstag")).toBeInTheDocument()
    expect(await screen.findByText("Hochzeit")).toBeInTheDocument()
  })
})

//
// 2) Icon Rendering
//
describe("CategorySelection – Icons", () => {
  it("rendert das passende Icon für bekannte Keys", async () => {
    mockFetch.mockResolvedValueOnce({
      json: () =>
        Promise.resolve([{ id: 1, key: "birthday", label: "Geburtstag" }])
    } as Response)

    setup()

    expect(await screen.findByText("🎂")).toBeInTheDocument()
  })

  it("rendert ein Fallback Icon für unbekannte Keys", async () => {
    mockFetch.mockResolvedValueOnce({
      json: () =>
        Promise.resolve([{ id: 1, key: "unknown_key", label: "Unbekannt" }])
    } as Response)

    setup()

    expect(await screen.findByText("📦")).toBeInTheDocument()
  })
})

//
// 3) Navigation
//
describe("CategorySelection – Navigation", () => {
  it("klicken auf eine Kategorie ruft router.push('/category/:id') auf", async () => {
    mockFetch.mockResolvedValueOnce({
      json: () =>
        Promise.resolve([{ id: 5, key: "wishlist", label: "Wunschliste" }])
    } as Response)

    setup()

    await fireEvent.click(await screen.findByText("Wunschliste"))

    expect(pushMock).toHaveBeenCalledWith("/category/5")
  })
})
