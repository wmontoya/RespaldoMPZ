"use client";

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, MapPin, Calendar, Truck, Trash2, Recycle, Leaf, CalendarX, CalendarX2, Search, BellOff, Bell, Info } from "lucide-react"
import { getSubscribedRoutes, getSubscriptionCode, getSubscriptionId, isRouteSubscribed, setCodeSubscription, setIdSubscription, toggleRouteSubscription, useStore, type Route } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { usePushNotifications } from "@/hooks/use-push-notification"
import { useToast } from "@/hooks/use-toast"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"

const ROUTES_CACHE_KEY = "routes-cache-v1"
const ROUTE_DAY_IDS_KEY = "subscribed-route-day-ids"

type DayData = {
  days: Set<string>
  dayIds: Record<string, number>
  quincenal_dates: string[]
}

type IterationData = Record<string, DayData>

type WasteTypeData = Record<string, IterationData>

type SectorData = Record<string, WasteTypeData>

function RouteHeader({ route, onClose }: { route: Route; onClose: () => void }) {
  return (
    <div className="mx-4 mt-2 rounded-2xl px-5 py-4" style={{ backgroundColor: route.color }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="rounded-xl p-2.5 shrink-0">
            <Truck className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-primary-foreground/80 text-xs font-medium uppercase tracking-wider">
              Detalles de la Ruta
            </p>
            <h2 className="text-primary-foreground font-semibold text-base leading-tight mt-0.5 text-balance">
              {route.name}
            </h2>
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          className="shrink-0 h-8 w-8 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function SectorSearch({ value, onChange }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div className="px-4">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar sector..."
          value={value}
          onChange={onChange}
          className="pl-10 bg-secondary border-0 h-11 rounded-xl focus-visible:ring-gray-300"
        />
      </div>
    </div>
  )
}

function DayItem({
  day,
  routeId,
  sector,
  wasteType,
  iteration,
  routeDayId,
  isSubscribed,
  routeColor,
  onToggle,
}: {
  day: string
  routeId: number
  sector: string
  wasteType: string
  iteration: string
  routeDayId: number | undefined
  isSubscribed: boolean
  routeColor: string
  onToggle: (key: string, routeDayId?: number) => void
}) {
  const key = `${routeId}-${sector}-${wasteType}-${iteration}-${day}`

  return (
    <div className="bg-background rounded-xl p-3 flex items-center justify-between gap-3 border">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors`}
          style={{
            backgroundColor: isSubscribed ? routeColor + "33" : "var(--muted)",
          }}
        >
          {isSubscribed ? (
            <CalendarX className="h-4 w-4" style={{ color: routeColor }} />
          ) : (
            <Calendar className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{day}</p>
          {isSubscribed && (
            <p className="text-xs font-medium flex items-center gap-1 mt-0.5" style={{ color: routeColor }}>
              <Bell className="h-3 w-3" />
              Notificaciones activas
            </p>
          )}
        </div>
      </div>
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
          onToggle(key, routeDayId)
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
}

function QuincenalDates({ dates, routeColor }: { dates: string[]; routeColor: string }) {
  if (dates.length === 0) return null

  return (
    <div className="pt-2 border-t border-border/50">
      <p className="text-xs text-muted-foreground mb-1 font-medium">Fechas del mes:</p>
      <div className="flex flex-wrap gap-2">
        {dates.map((date) => (
          <span key={date} className="inline-flex items-center gap-1 text-xs bg-card border rounded-md px-2 py-1">
            <CalendarX className="h-3 w-3" style={{ color: routeColor }} />
            {date}
          </span>
        ))}
      </div>
    </div>
  )
}

function IterationSection({
  iteration,
  data,
  routeId,
  sector,
  wasteType,
  subscribedSectorDays,
  routeColor,
  onToggle,
}: {
  iteration: string
  data: DayData
  routeId: number
  sector: string
  wasteType: string
  subscribedSectorDays: string[]
  routeColor: string
  onToggle: (key: string, routeDayId?: number) => void
}) {
  return (
    <div className="bg-secondary/40 rounded-xl p-3 space-y-2">
      <Badge variant="secondary" className="text-xs font-medium gap-1 w-fit">
        <Calendar className="h-3 w-3" />
        {iteration === "SEMANAL" ? "Recolección semanal" : "Recolección quincenal"}
      </Badge>
      <div className="space-y-2 mt-2">
        {Array.from(data.days).map((day) => (
          <DayItem
            key={day}
            day={day}
            routeId={routeId}
            sector={sector}
            wasteType={wasteType}
            iteration={iteration}
            routeDayId={data.dayIds[day]}
            isSubscribed={subscribedSectorDays.includes(`${routeId}-${sector}-${wasteType}-${iteration}-${day}`)}
            routeColor={routeColor}
            onToggle={onToggle}
          />
        ))}
      </div>
      {iteration === "QUINCENAL" && (
        <QuincenalDates dates={data.quincenal_dates} routeColor={routeColor} />
      )}
    </div>
  )
}

function WasteTypeSection({
  wasteType,
  iterations,
  routeId,
  sector,
  subscribedSectorDays,
  routeColor,
  onToggle,
}: {
  wasteType: string
  iterations: IterationData
  routeId: number
  sector: string
  subscribedSectorDays: string[]
  routeColor: string
  onToggle: (key: string, routeDayId?: number) => void
}) {
  return (
    <div key={wasteType} className="space-y-3">
      <div className="flex items-center gap-2">
        {wasteType === "RECICLAJE" && <Recycle className="h-4 w-4 text-green-600" />}
        {wasteType === "ORGÁNICO" && <Leaf className="h-4 w-4 text-emerald-600" />}
        {wasteType === "BASURA" && <Trash2 className="h-4 w-4 text-green-600" />}
        <h5 className="text-sm font-semibold uppercase">{wasteType}</h5>
      </div>
      {Object.entries(iterations).map(([iteration, data]) => (
        <IterationSection
          key={iteration}
          iteration={iteration}
          data={data}
          routeId={routeId}
          sector={sector}
          wasteType={wasteType}
          subscribedSectorDays={subscribedSectorDays}
          routeColor={routeColor}
          onToggle={onToggle}
        />
      ))}
    </div>
  )
}

function SectorCard({
  sector,
  wasteTypes,
  routeId,
  routeColor,
  subscribedSectorDays,
  onToggle,
}: {
  sector: string
  wasteTypes: WasteTypeData
  routeId: number
  routeColor: string
  subscribedSectorDays: string[]
  onToggle: (key: string, routeDayId?: number) => void
}) {
  return (
    <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
      <div className="px-4 py-3 bg-secondary/60 border-b flex items-center gap-2">
        <div className="rounded-lg p-1.5" style={{ backgroundColor: routeColor + "33" }}>
          <MapPin className="h-4 w-4" style={{ color: routeColor }} />
        </div>
        <h4 className="font-semibold text-foreground truncate">{sector}</h4>
      </div>
      <div className="p-3 space-y-4">
        {Object.entries(wasteTypes).map(([wasteType, iterations]) => (
          <WasteTypeSection
            key={wasteType}
            wasteType={wasteType}
            iterations={iterations}
            routeId={routeId}
            sector={sector}
            subscribedSectorDays={subscribedSectorDays}
            routeColor={routeColor}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  )
}

function SectorsList({
  route,
  sectorFilter,
  subscribedSectorDays,
  onToggle,
}: {
  route: Route
  sectorFilter: string
  subscribedSectorDays: string[]
  onToggle: (key: string, routeDayId?: number) => void
}) {
  const sectors: SectorData = route.days.reduce((acc: SectorData, d: any) => {
    if (!acc[d.sector]) acc[d.sector] = {}
    if (!acc[d.sector][d.waste_type]) acc[d.sector][d.waste_type] = {}
    if (!acc[d.sector][d.waste_type][d.iteration]) {
      acc[d.sector][d.waste_type][d.iteration] = {
        days: new Set(),
        dayIds: {} as Record<string, number>,
        quincenal_dates: d.quincenal_dates || [],
      }
    }
    d.days.forEach((day: string) => {
      acc[d.sector][d.waste_type][d.iteration].days.add(day)
      acc[d.sector][d.waste_type][d.iteration].dayIds[day] = d.id
    })
    return acc
  }, {})

  const filteredSectors = Object.entries(sectors).filter(([sector]) =>
    sector.toLowerCase().includes(sectorFilter.toLowerCase())
  )

  if (filteredSectors.length === 0) {
    return (
      <div className="text-center py-8">
        <MapPin className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">No se encontraron colonias</p>
      </div>
    )
  }

  return (
    <>
      {filteredSectors.map(([sector, wasteTypes]) => (
        <SectorCard
          key={sector}
          sector={sector}
          wasteTypes={wasteTypes}
          routeId={Number(route.id)}
          routeColor={route.color}
          subscribedSectorDays={subscribedSectorDays}
          onToggle={onToggle}
        />
      ))}
    </>
  )
}

function ServiceInfo({ description, color }: { description: string; color: string }) {
  return (
    <div className="border-t border-border bg-card px-4 py-1">
      <div className="bg-secondary/80 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-orange-700 rounded-lg p-2">
            <Info className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-foreground">Información de Servicio</span>
        </div>
        <p className="text-sm text-foreground leading-relaxed pl-1 ms-10">{description}</p>
      </div>
    </div>
  )
}

function RouteFooter({ onClose }: { onClose: () => void }) {
  return (
    <div className="p-1 border-t border-border">
      <div className="row m-1">
        <Button
          onClick={onClose}
          className="w-full border border-red-600 text-white bg-red-600 hover:bg-red-500/50 hover:border-red-600 hover:text-black"
          size="lg"
        >
          Cerrar
        </Button>
      </div>
    </div>
  )
}

function RouteDetailsPanel({
  route,
  onClose,
  sectorFilter,
  setSectorFilter,
  subscribedSectorDays,
  handleToggleSubscription,
}: {
  route: Route
  onClose: () => void
  sectorFilter: string
  setSectorFilter: (value: string) => void
  subscribedSectorDays: string[]
  handleToggleSubscription: (key: string, routeDayId?: number) => void
}) {
  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="absolute top-0 right-0 md:top-4 md:right-2 bottom-0 md:bottom-2 w-full md:w-[520px] z-[1000] pointer-events-auto"
    >
      <Card className="gap-2 h-full flex flex-col bg-card/95 backdrop-blur-lg shadow-2xl border-border overflow-hidden py-0">
        <RouteHeader route={route} onClose={onClose} />
        <SectorSearch value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)} />
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          <SectorsList
            route={route}
            sectorFilter={sectorFilter}
            subscribedSectorDays={subscribedSectorDays}
            onToggle={handleToggleSubscription}
          />
        </div>
        <ServiceInfo description={route.description} color={route.color} />
        <RouteFooter onClose={onClose} />
      </Card>
    </motion.div>
  )
}

function LoadingSpinner() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#00b8d4]/10 via-background to-[#2e3b8e]/10">
      <motion.div
        className="w-16 h-16 border-4 border-[#00b8d4] border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      />
    </div>
  )
}

export function MapRoutes() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)
  const [containerMounted, setContainerMounted] = useState(false)
  const [mapReady, setMapReady] = useState(false)
  const { selectRoute, setSelectRoute } = useStore()
  const mapRef = useRef<any>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const polylinesRef = useRef<any[]>([])
  const geoJsonLayerRef = useRef<any>(null)
  const tileLayerRef = useRef<any>(null)
  const { subscribeToPushNotifications } = usePushNotifications();
  const { toast } = useToast()
  const [isSubscribed, setIsSubscribed] = useState(false);
  const markersRef = useRef<any[]>([])
  const [sectorFilter, setSectorFilter] = useState("")
  const tilesPrefetchedRef = useRef(false)
  const lastTilesPrefetchAtRef = useRef(0)
  const tilesPrefetchTimeoutRef = useRef<number | null>(null)
  const tilesPrefetchAbortRef = useRef<AbortController | null>(null)
  const lastTileErrorToastAtRef = useRef(0)
  const [isOnline, setIsOnline] = useState(true)
  const [subscribedSectorDays, setSubscribedSectorDays] = useState<string[]>([])

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

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const stored = JSON.parse(
        localStorage.getItem("subscribed-sector-days") || "[]"
      )
      setSubscribedSectorDays(stored)
    } catch {
      setSubscribedSectorDays([])
    }
  }, [])

  const handleToggleSubscription = async (key: string, routeDayId?: number) => {
    const isDaySubscribed = subscribedSectorDays.includes(key)

    const updatedKeys = isDaySubscribed
      ? subscribedSectorDays.filter((k: string) => k !== key)
      : [...subscribedSectorDays, key]

    localStorage.setItem(
      "subscribed-sector-days",
      JSON.stringify(updatedKeys)
    )
    setSubscribedSectorDays(updatedKeys)

    if (!routeDayId) return
    const current = getSubscribedRouteDayIds()
    const updatedIds = isDaySubscribed
      ? current.filter((id) => id !== routeDayId)
      : Array.from(new Set([...current, routeDayId]))

    saveSubscribedRouteDayIds(updatedIds)

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

    try {
      // Direct call to backend (requires CORS on the API).
      const res = await fetch(`${process.env.NEXT_API_REQUEST}/api/v1/trash/subscripciones`, {
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
        title: isDaySubscribed ? "Suscripción quitada" : "Suscripción activada",
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

  const setMapContainerRef = (element: HTMLDivElement | null) => {
    mapContainerRef.current = element
    if (element && !containerMounted) {
      setContainerMounted(true)
    }
  }

  const prefetchTilesForBounds = async (bounds: any) => {
    if (!bounds || tilesPrefetchedRef.current) return
    if (typeof navigator !== "undefined" && !navigator.onLine) return

    const map = mapRef.current
    if (!map) return

    const now = Date.now()
    if (now - lastTilesPrefetchAtRef.current < 20_000) return
    lastTilesPrefetchAtRef.current = now

    tilesPrefetchedRef.current = true

    if (tilesPrefetchAbortRef.current) {
      tilesPrefetchAbortRef.current.abort()
    }
    const abortController = new AbortController()
    tilesPrefetchAbortRef.current = abortController

    const subdomains = ["a", "b", "c"]
    const tileUrl = (z: number, x: number, y: number) => {
      const s = subdomains[(x + y + z) % subdomains.length]
      return `https://${s}.tile.openstreetmap.org/${z}/${x}/${y}.png`
    }

    const tileSize = 256
    const zoom = map.getZoom()
    // Avoid aggressive prefetch when the user zooms in a lot; it can starve visible tile loading.
    if (zoom >= 16) return
    const zooms = [zoom, zoom + 1].filter((z) => z >= 11 && z <= 17)

    const nw = bounds.getNorthWest()
    const se = bounds.getSouthEast()

    const urls: string[] = []

    zooms.forEach((z) => {
      const nwPoint = map.project(nw, z).divideBy(tileSize).floor()
      const sePoint = map.project(se, z).divideBy(tileSize).floor()

      for (let x = nwPoint.x; x <= sePoint.x; x += 1) {
        for (let y = nwPoint.y; y <= sePoint.y; y += 1) {
          urls.push(tileUrl(z, x, y))
        }
      }
    })

    const limited = urls.slice(0, 140)
    const batchSize = 6
    for (let i = 0; i < limited.length; i += batchSize) {
      const batch = limited.slice(i, i + batchSize)
      await Promise.allSettled(
        batch.map((url) =>
          fetch(url, { mode: "no-cors", cache: "no-store", signal: abortController.signal }).catch(() => null)
        )
      )
    }
  }

  useEffect(() => {
    // Direct call to backend (requires CORS on the API).
    fetch(`${process.env.NEXT_API_REQUEST}/api/v1/trash/rutas`, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error("network response not ok")
        const data = await res.json()
        saveCachedRoutes(data.routes || [])
        return data
      })
      .then((data) => {
        setRoutes(data.routes || [])
        setLoading(false)
      })
      .catch((err) => {
        console.error("Error cargando Routes:", err)
        const cached = getCachedRoutes()
        if (cached.length > 0) {
          setRoutes(cached)
        }
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (selectRoute?.id) {
      setIsSubscribed(isRouteSubscribed(String(selectRoute.id)));
    }
  }, [selectRoute]);


  useEffect(() => {
    if (selectRoute?.selectedSector) {
      setSectorFilter(selectRoute.selectedSector);
    } else {
      setSectorFilter("");
    }
  }, [selectRoute]);


  useEffect(() => {
    if (!containerMounted) return
    if (typeof window === "undefined") return
    if (mapRef.current) return

    const initMap = () => {
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement("link")
        link.rel = "stylesheet"
        const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, '') || ''
        link.href = `${basePath}/leaflet/leaflet.css`
        document.head.appendChild(link)
      }

      const style = document.createElement('style')
      style.textContent = `
        .ruta-clickable {
          cursor: pointer !important;
          pointer-events: visiblePainted !important;
        }
        .ruta-clickable:hover {
          filter: brightness(1.2);
        }
      `
      document.head.appendChild(style)

      if (!(window as any).L) {
        const script = document.createElement("script")
        const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, '') || ''
        script.src = `${basePath}/leaflet/leaflet.js`
        script.onload = () => {
          setTimeout(createMap, 100)
        }
        document.head.appendChild(script)
      } else {
        setTimeout(createMap, 100)
      }
    }

    const createMap = () => {
      const L = (window as any).L
      if (!L || !mapContainerRef.current) {
        return
      }

      try {
        const map = L.map(mapContainerRef.current, {
          center: [9.3739, -83.7035],
          zoom: 10,
          zoomControl: true,
          maxZoom: 20,
        })
        
        tileLayerRef.current = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap",
          maxZoom: 20,
          subdomains: ["a", "b", "c"],
          updateWhenZooming: false,
          updateWhenIdle: true,
          keepBuffer: 2,
        })
        tileLayerRef.current.addTo(map)
        mapRef.current = map

        tileLayerRef.current.on("tileerror", (e: any) => {
          const src = e?.tile?.src
          console.warn("Tile error:", src)

          const t = Date.now()
          if (t - lastTileErrorToastAtRef.current < 30_000) return
          lastTileErrorToastAtRef.current = t
          toast({
            title: "Mapa",
            description: "No se pudieron cargar algunos mosaicos del mapa. Reintenta en unos segundos.",
          })
        })

        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.invalidateSize()
            setMapReady(true)
          }
        }, 300)
      } catch (error) {
        console.error("❌ Error creando mapa:", error)
      }
    }

    initMap()
  }, [containerMounted])

  useEffect(() => {
    if (!mapReady || !mapRef.current) return
    if (typeof navigator !== "undefined" && !navigator.onLine) return

    const map = mapRef.current
    const handler = () => {
      tilesPrefetchedRef.current = false
      if (selectRoute) return

      if (tilesPrefetchTimeoutRef.current) {
        window.clearTimeout(tilesPrefetchTimeoutRef.current)
      }

      tilesPrefetchTimeoutRef.current = window.setTimeout(() => {
        prefetchTilesForBounds(map.getBounds())
      }, 650)
    }

    map.on("moveend", handler)
    // Avoid firing prefetch on every zoom tick; moveend is enough and reduces tile throttling.

    return () => {
      map.off("moveend", handler)
      if (tilesPrefetchTimeoutRef.current) {
        window.clearTimeout(tilesPrefetchTimeoutRef.current)
        tilesPrefetchTimeoutRef.current = null
      }
    }
  }, [mapReady, selectRoute])

  useEffect(() => {
    if (typeof window === "undefined") return
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  useEffect(() => {
    if (!tileLayerRef.current) return
    // Force re-draw so tiles switch between cache-only and network mode
    tileLayerRef.current.redraw()
  }, [isOnline])

  useEffect(() => {
    if (!mapReady || !mapRef.current) return

    const L = (window as any).L
    if (!L) return

    // Remover capa GeoJSON anterior si existe
    if (geoJsonLayerRef.current) {
      mapRef.current.removeLayer(geoJsonLayerRef.current)
    }

    fetch(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/leaflet/perez_zeledon.geojson`)
      .then((res) => res.json())
      .then((geojson) => {
        try {
          // Crear capa GeoJSON con menos opacidad para no tapar las Routes
          geoJsonLayerRef.current = L.geoJSON(geojson, {
            style: {
              color: "#2e3b8e",
              weight: 2, // Reducir grosor
              fillColor: "#71d8e6",
              fillOpacity: 0.05, // Reducir opacidad del relleno
              interactive: false // Hacer no interactiva
            },
          }).addTo(mapRef.current)

          const bounds = geoJsonLayerRef.current.getBounds()
          if (bounds && typeof bounds.isValid === "function" && bounds.isValid()) {
            mapRef.current.fitBounds(bounds, { padding: [20, 20] })
            mapRef.current.setMaxBounds(bounds)
            mapRef.current.options.maxBoundsViscosity = 1.0
            mapRef.current.setMinZoom(11)
            mapRef.current.setMaxZoom(17)
            setTimeout(() => {
              prefetchTilesForBounds(bounds)
            }, 300)
          } else {
            mapRef.current.setView([9.3739, -83.7035], 12)
            setTimeout(() => {
              prefetchTilesForBounds(mapRef.current.getBounds())
            }, 300)
          }
        } catch (err) {
          console.error("Error cargando GeoJSON:", err)
          mapRef.current.setView([9.3739, -83.7035], 12)
        }
      })
      .catch((err) => {
        console.error("Error cargando GeoJSON:", err)
        if (mapRef.current) mapRef.current.setView([9.3739, -83.7035], 12)
      })
  }, [mapReady])

  useEffect(() => {
    if (!mapReady || !mapRef.current || routes.length === 0) return

    const L = (window as any).L
    if (!L) return

    // LIMPIAR POLILÍNEAS
    polylinesRef.current.forEach((p) => {
      try {
        if (p && mapRef.current) mapRef.current.removeLayer(p)
      } catch { }
    })
    polylinesRef.current = []

    // 🔴 LIMPIAR MARKERS (NUEVO)
    markersRef.current?.forEach(({ marker }) => marker.remove())
    markersRef.current = []

    const createPolyline = (coords: [number, number][], ruta: Route, weight: number) => {
      const polyline = L.polyline(coords, {
        color: ruta.color,
        weight,
        interactive: true,
        bubblingMouseEvents: false,
      })

      polyline.on("click", (e: any) => {
        L.DomEvent.stopPropagation(e)
        setSelectRoute(ruta)
      })

      polyline.addTo(mapRef.current)
      return polyline
    }

    routes.forEach((ruta) => {
      let currentSegment: [number, number][] = []

      ruta.coordinates.forEach((coord) => {
        if (coord[0] === 0 && coord[1] === 0) {
          if (currentSegment.length > 1) {
            const polyline = createPolyline(currentSegment, ruta, 5)
            polylinesRef.current.push(polyline)
            currentSegment = []
          }
        } else {
          currentSegment.push(coord)
        }
      })

      if (currentSegment.length > 1) {
        const polyline = createPolyline(currentSegment, ruta, 5)
        polylinesRef.current.push(polyline)
      }

      // 🔴 MARCADOR CON NOMBRE (NUEVO)
      const firstCoord = ruta.coordinates.find(
        (c) => !(c[0] === 0 && c[1] === 0)
      )

      if (firstCoord) {
        const marker = L.marker(firstCoord, {
          icon: L.divIcon({
            className: "route-label",
            html: `
            <div style="
              display: inline-flex;
              align-items: center;
              justify-content: center;
              background-color: ${ruta.color};
              padding: 1px 5px;
              border-radius: 6px;
              border: 2px solid black;
              color: black;
              font-weight: 500;
              font-size: 12px;
              white-space: nowrap;
              box-sizing: border-box;
              box-shadow: 0 2px 6px rgba(0,0,0,0.25);
            ">
              ${ruta.name}
            </div>
          `,
            iconSize: [0, 0],
          }),
        }).addTo(mapRef.current)

        marker.on("click", () => {
          setSelectRoute(ruta)
        })

        markersRef.current.push({ id: ruta.id, marker })
      }
    })

    return () => {
      polylinesRef.current.forEach((p) => {
        try {
          if (p && mapRef.current) mapRef.current.removeLayer(p)
        } catch { }
      })

      markersRef.current.forEach(({ marker }) => marker.remove())
      polylinesRef.current = []
      markersRef.current = []
    }
  }, [mapReady, routes, setSelectRoute])


  useEffect(() => {
    if (!mapRef.current || !selectRoute) return

    const L = (window as any).L
    if (!L) return

    try {
      if (tilesPrefetchAbortRef.current) {
        tilesPrefetchAbortRef.current.abort()
        tilesPrefetchAbortRef.current = null
      }

      const coordenadasValidas = selectRoute.coordinates.filter(
        (coord: any) => !(coord[0] === 0 && coord[1] === 0)
      )

      if (coordenadasValidas.length > 0) {
        const bounds = L.latLngBounds(coordenadasValidas)

        if (bounds.isValid()) {
          const map = mapRef.current
          const center = bounds.getCenter()

          // Avoid zoom animations here: they clear the tile grid and can leave the map "stuck" blank.
          // A simple pan keeps existing tiles while new ones stream in.
          if (map && typeof map.stop === "function") map.stop()
          map.panTo(center, { animate: false })

          // Clamp zoom gently (optional) without jumping too far.
          const currentZoom = map.getZoom()
          const targetZoom = Math.min(Math.max(currentZoom, 12), 15)
          if (targetZoom !== currentZoom) {
            map.setZoom(targetZoom, { animate: false })
          }

          // Ensure Leaflet recalculates sizes after the details panel mounts.
          setTimeout(() => {
            if (!mapRef.current) return
            mapRef.current.invalidateSize()
          }, 80)
        } else {
          const center = [9.3739, -83.7035] as [number, number]
          mapRef.current.setView(center, 14, { animate: false })
        }
      }
    } catch (e) {
      console.error("Error animando vuelo hacia la ruta:", e)
    }
  }, [selectRoute])

  const handleClosePanel = () => {
    setSelectRoute(null)
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="relative w-full h-full">
  <div
    ref={setMapContainerRef}
    className="w-full h-full bg-gray-200 dark:bg-gray-800 z-0"
  />

      <AnimatePresence>
        {selectRoute && (
          <RouteDetailsPanel
            route={selectRoute}
            onClose={handleClosePanel}
            sectorFilter={sectorFilter}
            setSectorFilter={setSectorFilter}
            subscribedSectorDays={subscribedSectorDays}
            handleToggleSubscription={handleToggleSubscription}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
