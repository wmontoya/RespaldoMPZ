"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Search, Calendar, ChevronRight, Recycle, Leaf, Trash2, Bell, BellOff, CalendarX } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useStore, type Route, getSubscriptionCode, getSubscriptionId, setIdSubscription, setCodeSubscription } from "@/lib/store"
import { usePushNotifications } from "@/hooks/use-push-notification"
import { useToast } from "@/hooks/use-toast"



/* =========================
   LocalStorage helpers
========================= */
const STORAGE_KEY = "subscribed-sector-days"
const ROUTES_CACHE_KEY = "routes-cache-v1"
const ROUTE_DAY_IDS_KEY = "subscribed-route-day-ids"

const getSubscribedDays = (): string[] => {
  if (typeof window === "undefined") return []
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
}

const saveSubscribedDays = (data: string[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

const getCachedRoutes = (): Route[] => {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(ROUTES_CACHE_KEY) || "[]")
  } catch {
    return []
  }
}

const saveCachedRoutes = (data: Route[]) => {
  localStorage.setItem(ROUTES_CACHE_KEY, JSON.stringify(data))
}

const getSubscribedRouteDayIds = (): number[] => {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(ROUTE_DAY_IDS_KEY) || "[]")
  } catch {
    return []
  }
}

const saveSubscribedRouteDayIds = (ids: number[]) => {
  localStorage.setItem(ROUTE_DAY_IDS_KEY, JSON.stringify(ids))
}

type RouteSectorUI = {
  route: Route
  sector: string
  waste_types: {
    waste_type: string
    iterations: {
      iteration: string
      days: string[]
      quincenal_dates: string[]
      route_day_id: number
    }[]
  }[]
}

/* =========================
   Component
========================= */
export default function RutasPage() {
  const router = useRouter()
  const { setSelectRoute } = useStore()
  const { subscribeToPushNotifications } = usePushNotifications()
  const { toast } = useToast()

  const [routes, setRoutes] = useState<RouteSectorUI[]>([])
  const [filteredRoutes, setFilteredRoutes] = useState<RouteSectorUI[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [subscribedDays, setSubscribedDays] = useState<string[]>([])

  /* =========================
     Fetch + normalize data
  ========================= */
  useEffect(() => {
    setSubscribedDays(getSubscribedDays())

    // Direct call to backend (requires CORS on the API).
    fetch(`${process.env.NEXT_API_REQUEST}/api/v1/trash/rutas`, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error("network response not ok")
        const data = await res.json()
        saveCachedRoutes(data.routes || [])
        return data
      })
      .then((data) => {
        const expanded: RouteSectorUI[] = (data.routes || []).flatMap((route: Route) => {
          // sector -> waste_type -> iteration -> {days, quincenal_dates}
          const sectorMap: Record<
            string,
            Record<
              string,
              Record<
                string,
                {
                  days: Set<string>
                  quincenal_dates: string[]
                  route_day_id: number
                }
              >
            >
          > = {}

          route.days.forEach((d: any) => {
            if (!sectorMap[d.sector]) sectorMap[d.sector] = {}
            if (!sectorMap[d.sector][d.waste_type]) sectorMap[d.sector][d.waste_type] = {}
            if (!sectorMap[d.sector][d.waste_type][d.iteration]) {
              sectorMap[d.sector][d.waste_type][d.iteration] = {
                days: new Set(),
                quincenal_dates: d.quincenal_dates || [],
                route_day_id: d.id,
              }
            }

            d.days.forEach((day: string) => sectorMap[d.sector][d.waste_type][d.iteration].days.add(day))
          })

          return Object.entries(sectorMap).map(([sector, wasteMap]) => ({
            route,
            sector,
            waste_types: Object.entries(wasteMap).map(([waste_type, iterMap]) => ({
              waste_type,
              iterations: Object.entries(iterMap).map(([iteration, { days, quincenal_dates, route_day_id }]) => ({
                iteration,
                days: Array.from(days),
                quincenal_dates,
                route_day_id,
              }))
            }))
          }))
        })

        setRoutes(expanded)
        setFilteredRoutes(expanded)
        setLoading(false)
      })
      .catch(() => {
        const cached = getCachedRoutes()
        if (cached.length > 0) {
          const expanded: RouteSectorUI[] = cached.flatMap((route: Route) => {
            const sectorMap: Record<
              string,
              Record<
                string,
                Record<
                  string,
                  {
                    days: Set<string>
                    quincenal_dates: string[]
                    route_day_id: number
                  }
                >
              >
            > = {}

            route.days.forEach((d: any) => {
              if (!sectorMap[d.sector]) sectorMap[d.sector] = {}
              if (!sectorMap[d.sector][d.waste_type]) sectorMap[d.sector][d.waste_type] = {}
              if (!sectorMap[d.sector][d.waste_type][d.iteration]) {
                sectorMap[d.sector][d.waste_type][d.iteration] = {
                  days: new Set(),
                  quincenal_dates: d.quincenal_dates || [],
                  route_day_id: d.id,
                }
              }

              d.days.forEach((day: string) => sectorMap[d.sector][d.waste_type][d.iteration].days.add(day))
            })

            return Object.entries(sectorMap).map(([sector, wasteMap]) => ({
              route,
              sector,
              waste_types: Object.entries(wasteMap).map(([waste_type, iterMap]) => ({
                waste_type,
                iterations: Object.entries(iterMap).map(([iteration, { days, quincenal_dates, route_day_id }]) => ({
                  iteration,
                  days: Array.from(days),
                  quincenal_dates,
                  route_day_id,
                }))
              }))
            }))
          })

          setRoutes(expanded)
          setFilteredRoutes(expanded)
        }
        setLoading(false)
      })
  }, [])

  /* =========================
     Search
  ========================= */
  useEffect(() => {
    const query = searchQuery.toLowerCase()
    setFilteredRoutes(
      routes.filter(
        (item) =>
          item.route.name.toLowerCase().includes(query) ||
          item.sector.toLowerCase().includes(query)
      )
    )
  }, [searchQuery, routes])

  /* =========================
     Toggle subscription
  ========================= */
  const toggleDaySubscription = async (
    routeId: string,
    sector: string,
    waste_type: string,
    iteration: string,
    day: string,
    routeDayId: number
  ) => {
    const key = `${routeId}-${sector}-${waste_type}-${iteration}-${day}`
    const wasSubscribed = subscribedDays.includes(key)
    let updated: string[]

    if (wasSubscribed) {
      updated = subscribedDays.filter((k) => k !== key)
    } else {
      updated = [...subscribedDays, key]
    }

    saveSubscribedDays(updated)
    setSubscribedDays(updated)

    let codeSubscription = getSubscriptionCode()
    if (!codeSubscription) {
      if ('Notification' in window) {
        await Notification.requestPermission()
      }

      if ('serviceWorker' in navigator && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        const swPath = process.env.NODE_ENV === 'development' ? '/sw.js' : '/apps/trash/sw.js'
        const registration = await navigator.serviceWorker.register(swPath)
        if (!registration) {
          throw new Error('Error al registrar el service worker.')
        }

        const responseSubscription = await subscribeToPushNotifications()
        if (!responseSubscription.success || !responseSubscription.data) {
          throw new Error('Error en la suscripción de notificaciones.')
        }
        setCodeSubscription(responseSubscription.data)
        codeSubscription = responseSubscription.data
      }
    }

    if (!codeSubscription) {
      toast({
        title: "Permiso requerido",
        description: "Activa las notificaciones para completar la suscripción.",
      })
      return
    }

    const current = getSubscribedRouteDayIds()
    const updatedIds = wasSubscribed
      ? current.filter((id) => id !== routeDayId)
      : Array.from(new Set([...current, routeDayId]))

    saveSubscribedRouteDayIds(updatedIds)

    try {
      // Direct call to backend (requires CORS on the API).
      const res = await fetch(`${process.env.NEXT_API_REQUEST}/api/v1/trash/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscription_code: codeSubscription,
          route_day_ids: updatedIds,
          subscription_id: getSubscriptionId() || null,
        }),
      })

      let data: any = null
      try {
        data = await res.json()
      } catch {
        data = null
      }

      if (!res.ok || data?.success === false) {
        console.error("Subscription request failed:", {
          status: res.status,
          body: data,
        })
        toast({
          title: "Error",
          description: "No se pudo registrar la suscripción.",
        })
        return
      }

      if (data?.subscription_id) {
        setIdSubscription(String(data.subscription_id))
      }

      toast({
        title: wasSubscribed ? "Suscripción quitada" : "Suscripción activada",
        description: "Se guardó correctamente.",
      })
    } catch (err) {
      console.error("Subscription request error:", err)
      toast({
        title: "Error",
        description: "No se pudo registrar la suscripción.",
      })
    }
  }

  /* =========================
     Map navigation
  ========================= */
  const handleVerEnMapa = (route: Route, sector: string) => {
    setSelectRoute({
      ...route,
      selectedSector: sector,
    } as Route)
    router.push("/")
  }

  /* =========================
     Loading
  ========================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    )
  }

  /* =========================
     Render
  ========================= */
  return (
    <div className="container mx-auto px-4 max-w-7xl">
      <div className="sticky top-0 bg-background z-10 py-6">
        {/* HEADER */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold mb-2">
            Lista de Sectores
          </h1>
          <p className="text-muted-foreground text-sm">
            Selecciona un sector según la ruta y tipo de residuo para ver los días de recolección y suscribirte a notificaciones.
          </p>
        </div>

        {/* SEARCH */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por ruta o sector..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14"
            />
          </div>
        </div>
      </div>

      {/* GRID (Scrollable area) */}
      <div className="overflow-y-auto max-h-[calc(100vh-200px)] pb-8"> {/* Ajusta el max-h según tu layout (ej: resta altura de header/navbar) */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredRoutes.map(({ route, sector, waste_types }, index) => (
            <motion.div
              key={`${route.id}-${sector}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Card className="p-6 h-full flex flex-col gap-4">
                {/* COLOR */}
                <div
                  className="h-2 w-full rounded-full"
                  style={{ backgroundColor: route.color }}
                />

                {/* TITLE */}
                <h3 className="text-xl font-bold">
                  {sector}
                </h3>

                {/* SECTOR */}
                <span className="text-primary font-medium">
                  Ruta {route.name}
                </span>

                {/* WASTE TYPES */}
                <div className="space-y-4">
                  {waste_types.map(({ waste_type, iterations }) => (
                    <div key={waste_type} className="space-y-3">
                      {/* HEADER WASTE TYPE */}
                      <div className="flex items-center gap-2">
                        {waste_type === "RECICLAJE" && (
                          <Recycle className="h-4 w-4 text-green-600" />
                        )}
                        {waste_type === "ORGÁNICO" && (
                          <Leaf className="h-4 w-4 text-emerald-600" />
                        )}
                        {waste_type === "BASURA" && (
                          <Trash2 className="h-4 w-4 text-green-600" />
                        )}

                        <h5 className="text-sm font-semibold uppercase">
                          {waste_type}
                        </h5>
                      </div>

                      {iterations.map(
                        ({ iteration, days, quincenal_dates, route_day_id }) => (
                          <div
                            key={iteration}
                            className="bg-secondary/40 rounded-xl p-3 space-y-2"
                          >
                            {/* ITERATION */}
                            <Badge
                              variant="secondary"
                              className="text-xs font-medium gap-1 w-fit"
                            >
                              <Calendar className="h-3 w-3" />
                              {iteration === "SEMANAL"
                                ? "Recolección semanal"
                                : "Recolección quincenal"}
                            </Badge>

                            {/* DÍAS */}
                            <div className="space-y-2 mt-2">
                              {days.map((day) => {
                                const key = `${route.id}-${sector}-${waste_type}-${iteration}-${day}`

                                const isSubscribed = subscribedDays.includes(key)

                                return (
                                  <div
                                    key={day}
                                    className="bg-background rounded-xl p-3 flex items-center justify-between gap-3 border"
                                  >
                                    {/* INFO DEL DÍA */}
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div
                                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors`}
                                        style={{
                                          backgroundColor: isSubscribed
                                            ? route.color + "33"
                                            : "var(--muted)",
                                        }}
                                      >
                                        {isSubscribed ? (
                                          <CalendarX
                                            className="h-4 w-4"
                                            style={{ color: route.color }}
                                          />
                                        ) : (
                                          <Calendar className="h-4 w-4 text-muted-foreground" />
                                        )}
                                      </div>

                                      <div className="min-w-0">
                                        <p className="text-sm font-medium text-foreground">
                                          {day}
                                        </p>

                                        {isSubscribed && (
                                          <p
                                            className="text-xs font-medium flex items-center gap-1 mt-0.5"
                                            style={{ color: route.color }}
                                          >
                                            <Bell className="h-3 w-3" />
                                            Notificaciones activas
                                          </p>
                                        )}
                                      </div>
                                    </div>


                                    {/* BOTÓN */}
                                    <Button
                                      type="button"
                                      size="sm"
                                      className={`gap-1.5 rounded-lg h-9 transition-all ${isSubscribed
                                        ? "border border-red-500 text-red-500 bg-transparent hover:bg-red-500/10"
                                        : "border border-green-600 bg-green-600 text-white hover:bg-green-500/90"
                                        }`}
                                      onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        toggleDaySubscription(route.id, sector, waste_type, iteration, day, route_day_id)
                                      }}
                                    >
                                      {isSubscribed ? (
                                        <>
                                          <BellOff className="h-3.5 w-3.5" />
                                          <span className="hidden sm:inline">Quitar</span>
                                        </>
                                      ) : (
                                        <>
                                          <Bell className="h-3.5 w-3.5" />
                                          <span className="hidden sm:inline">Suscribirse</span>
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                )
                              })}
                            </div>


                            {/* FECHAS QUINCENALES */}
                            {iteration === "QUINCENAL" &&
                              quincenal_dates.length > 0 && (
                                <div className="pt-2 border-t border-border/50">
                                  <p className="text-xs text-muted-foreground mb-1 font-medium">
                                    Fechas del mes:
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {quincenal_dates.map((date) => (
                                      <span
                                        key={date}
                                        className="inline-flex items-center gap-1 text-xs bg-card border rounded-md px-2 py-1"
                                      >
                                        <CalendarX
                                          className="h-3 w-3"
                                          style={{
                                            color: route.color,
                                          }}
                                        />
                                        {date}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                          </div>
                        )
                      )}
                    </div>
                  ))}
                </div>

                {/* MAP */}
                <div className="mt-auto pt-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      handleVerEnMapa(route, sector)
                    }
                  >
                    Ver en mapa
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
