export interface Route {
  id: string
  name: string
  from: string
  to: string
}

export const ROUTES: Route[] = [
  {
    id: "bt-ll-zalewa",
    name: "Blantyre → Lilongwe (via Zalewa)",
    from: "Blantyre",
    to: "Lilongwe",
  },
  {
    id: "ll-bt-zalewa",
    name: "Lilongwe → Blantyre (via Zalewa)",
    from: "Lilongwe",
    to: "Blantyre",
  },
  {
    id: "bt-ll-mango",
    name: "Blantyre → Lilongwe (via Mangochi)",
    from: "Blantyre",
    to: "Lilongwe",
  },
  {
    id: "ll-bt-mango",
    name: "Lilongwe → Blantyre (via Mangochi)",
    from: "Lilongwe",
    to: "Blantyre",
  },
]
