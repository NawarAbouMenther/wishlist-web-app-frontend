import { render, screen, fireEvent } from "@testing-library/vue"
import { describe, it, expect, vi, beforeEach } from "vitest"
import CategoryView from "../../views/CategoryView.vue"
import { createRouter, createMemoryHistory } from "vue-router"

// ------- Router Mocks -------
const pushMock = vi.fn()

vi.mock("vue-router", async () => {
  const actual = await vi.importActual<typeof import("vue-router")>("vue-router")
  return {
    ...actual,
    useRouter: () => ({ push: pushMock }),
    useRoute: () => ({ params: { id: "10" } })
  }
})

// ------- Fetch Mock -------
const mockFetch = vi.fn()
global.fetch = mockFetch as unknown as typeof fetch

function setup() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: "/category/:id", component: CategoryView }]
  })

  return render(CategoryView, {
    global: { plugins: [router] }
  })
}

beforeEach(() => {
  mockFetch.mockReset()
  pushMock.mockReset()
})

//
// 1) Kategorie wird korrekt geladen
//
describe("CategoryView – Kategorie laden", () => {
  it("zeigt die richtige Kategorie im Header", async () => {
    // fetch #1 → loadCategory
    mockFetch.mockResolvedValueOnce({
      json: () =>
        Promise.resolve([
          { id: 10, key: "birthday", label: "Geburtstag" },
          { id: 20, key: "wedding", label: "Hochzeit" }
        ])
    } as Response)

    // fetch #2 → loadLists
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve([])
    } as Response)

    setup()

    expect(await screen.findByText("Geburtstag")).toBeInTheDocument()
    expect(await screen.findByText("🎂")).toBeInTheDocument()
  })

  it("zeigt nichts im Header, wenn Kategorie nicht existiert", async () => {
    // fetch #1 → Kategorie NICHT gefunden
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve([{ id: 99, key: "x", label: "Falsch" }])
    } as Response)

    // fetch #2
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve([])
    } as Response)

    setup()

    // category.value = null → "header" existiert nicht
    expect(screen.queryByText("Falsch")).not.toBeInTheDocument()
  })
})

//
// 2) Listen der Kategorie laden
//
describe("CategoryView – Listen laden", () => {
  it("zeigt alle Listen korrekt an", async () => {
    mockFetch
      .mockResolvedValueOnce({
        json: () =>
          Promise.resolve([{ id: 10, key: "birthday", label: "Geburtstag" }])
      } as Response)
      .mockResolvedValueOnce({
        json: () =>
          Promise.resolve([
            { id: 1, title: "Wunschliste 1" },
            { id: 2, title: "Wunschliste 2" }
          ])
      } as Response)

    setup()

    expect(await screen.findByText("Wunschliste 1")).toBeInTheDocument()
    expect(await screen.findByText("Wunschliste 2")).toBeInTheDocument()
  })
})

//
// 3) Navigation zu einer Liste
//
describe("CategoryView – Navigation", () => {
  it("klick auf eine Liste ruft router.push('/wishlist/:id') auf", async () => {
    mockFetch
      .mockResolvedValueOnce({
        json: () =>
          Promise.resolve([{ id: 10, key: "wishlist", label: "Listen" }])
      } as Response)
      .mockResolvedValueOnce({
        json: () => Promise.resolve([{ id: 7, title: "Meine Liste" }])
      } as Response)

    setup()

    await fireEvent.click(await screen.findByText("Meine Liste"))

    expect(pushMock).toHaveBeenCalledWith("/wishlist/7")
  })
})

//
// 4) Neue Liste hinzufügen
//
describe("CategoryView – addList()", () => {
  it("fügt eine neue Liste hinzu und lädt die Liste neu", async () => {
    // loadCategory
    mockFetch.mockResolvedValueOnce({
      json: () =>
        Promise.resolve([{ id: 10, key: "birthday", label: "Geburtstag" }])
    } as Response)

    // loadLists initial
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve([])
    } as Response)

    // addList → POST
    mockFetch.mockResolvedValueOnce({ ok: true } as Response)

    // reload loadLists
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve([{ id: 55, title: "NEUE LISTE" }])
    } as Response)

    setup()

    const input = await screen.findByPlaceholderText("Neue Liste erstellen ...")

    await fireEvent.update(input, "NEUE LISTE")
    await fireEvent.click(screen.getByText("+"))

    expect(await screen.findByText("NEUE LISTE")).toBeInTheDocument()
  })

  it("fügt keine Liste hinzu, wenn Eingabe leer ist", async () => {
    // category
    mockFetch.mockResolvedValueOnce({
      json: () =>
        Promise.resolve([{ id: 10, key: "birthday", label: "Geburtstag" }])
    } as Response)

    // lists
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve([])
    } as Response)

    setup()

    await fireEvent.click(screen.getByText("+"))

    // POST darf NICHT ausgeführt werden
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })
})

//
// 5) Empty-State
//
describe("CategoryView – Empty State", () => {
  it("zeigt nichts an, wenn keine Listen vorhanden sind", async () => {
    mockFetch
      .mockResolvedValueOnce({
        json: () =>
          Promise.resolve([{ id: 10, key: "birthday", label: "Geburtstag" }])
      } as Response)
      .mockResolvedValueOnce({
        json: () => Promise.resolve([])
      } as Response)

    setup()

    // grid ist leer → Text kommt nicht vor
    expect(screen.queryByText("📄")).not.toBeInTheDocument()
  })
})
