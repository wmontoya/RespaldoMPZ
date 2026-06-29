"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  User,
  MapPin,
  Calendar,
  DollarSign,
  AlertCircle,
  FileText,
  Home,
  History,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react"
import { MainLayout } from "@/components/main-layout"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useStore, type Queja } from "@/lib/store"

export default function ConsultaPage() {
  const router = useRouter()
  const [cedula, setCedula] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { ciudadano, setCiudadano, quejas, setQuejas } = useStore()

  useEffect(() => {
    if (ciudadano) {
      fetch(`/api/quejas?cedula=${ciudadano.cedula}`)
        .then((res) => res.json())
        .then((data) => setQuejas(data))
        .catch((err) => console.error("Error loading quejas:", err))
    }
  }, [ciudadano, setQuejas])

  const handleConsultar = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!cedula.trim()) {
      setError("Por favor ingrese un número de cédula")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/consulta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cedula }),
      })

      if (!response.ok) {
        throw new Error("Cédula no encontrada")
      }

      const data = await response.json()
      setCiudadano(data)
    } catch (err) {
      setError("No se encontró información para esta cédula")
      setCiudadano(null)
    } finally {
      setLoading(false)
    }
  }

  const handleRegistrarQueja = () => {
    router.push("/quejas")
  }

  const totalPendiente =
    ciudadano?.propiedades?.reduce(
      (sum, propiedad) => sum + (propiedad.periodosPendientes?.reduce((s, p) => s + p.monto, 0) || 0),
      0,
    ) || 0

  const getStatusIcon = (estado: Queja["estado"]) => {
    switch (estado) {
      case "resuelta":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "en-revision":
        return <Clock className="w-5 h-5 text-yellow-500" />
      case "rechazada":
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-blue-500" />
    }
  }

  const getStatusLabel = (estado: Queja["estado"]) => {
    switch (estado) {
      case "resuelta":
        return "Resuelta"
      case "en-revision":
        return "En Revisión"
      case "rechazada":
        return "Rechazada"
      default:
        return "Pendiente"
    }
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Consulta Ciudadana</h1>
          <p className="text-muted-foreground text-lg">
            Ingresa tu número de cédula para consultar tu estado de cuenta
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="p-6 mb-8">
            <form onSubmit={handleConsultar} className="space-y-4">
              <div>
                <label htmlFor="cedula" className="block text-sm font-medium text-foreground mb-2">
                  Número de Cédula
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="cedula"
                    type="text"
                    placeholder="Ej: 1-2345-6789"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                    className="pl-12 h-12"
                    disabled={loading}
                  />
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </motion.div>
              )}

              <Button type="submit" className="w-full h-12" disabled={loading}>
                {loading ? (
                  <motion.div
                    className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  />
                ) : (
                  "Consultar"
                )}
              </Button>
            </form>
          </Card>
        </motion.div>

        <AnimatePresence mode="wait">
          {ciudadano && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <Card className="p-6">
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Información Personal
                </h2>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Nombre</p>
                    <p className="font-semibold text-foreground">{ciudadano.nombre}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Cédula</p>
                    <p className="font-semibold text-foreground">{ciudadano.cedula}</p>
                  </div>
                </div>
              </Card>

              {ciudadano.propiedades?.map((propiedad, propIndex) => (
                <Card key={propIndex} className="p-6">
                  <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Home className="w-5 h-5 text-primary" />
                    Propiedad {propIndex + 1}
                  </h2>

                  <div className="grid gap-4 md:grid-cols-2 mb-6">
                    <div className="md:col-span-2">
                      <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        Dirección
                      </p>
                      <p className="font-semibold text-foreground">{propiedad.direccion}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Zona</p>
                      <p className="font-semibold text-foreground">{propiedad.zona}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        Tarifa Trimestral
                      </p>
                      <p className="font-semibold text-foreground">₡{propiedad.tarifa.toLocaleString("es-CR")}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                        <Home className="w-4 h-4" />
                        Unidades Habitacionales
                      </p>
                      <p className="font-semibold text-foreground">{propiedad.unidadesHabitacionales}</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        Periodos Pendientes
                      </h3>
                      {propiedad.periodosPendientes && propiedad.periodosPendientes.length > 0 && (
                        <div className="px-3 py-1 bg-destructive/10 text-destructive rounded-full text-sm font-semibold">
                          {propiedad.periodosPendientes.length}{" "}
                          {propiedad.periodosPendientes.length === 1 ? "periodo" : "periodos"}
                        </div>
                      )}
                    </div>

                    {!propiedad.periodosPendientes || propiedad.periodosPendientes.length === 0 ? (
                      <div className="text-center py-6">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                          <CheckCircle className="w-6 h-6 text-primary" />
                        </div>
                        <p className="text-sm font-semibold text-foreground mb-1">Al día con los pagos</p>
                        <p className="text-sm text-muted-foreground">No tienes periodos pendientes</p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-3 mb-4">
                          {propiedad.periodosPendientes.map((periodo, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                  <Calendar className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                  <p className="font-semibold text-foreground text-sm">{periodo.periodo}</p>
                                  <p className="text-xs text-muted-foreground">Vence: {periodo.fechaCorte}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-base font-bold text-foreground">
                                  ₡{periodo.monto.toLocaleString("es-CR")}
                                </p>
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        <div className="p-3 bg-primary/10 rounded-lg border-2 border-primary">
                          <div className="flex items-center justify-between">
                            <p className="text-base font-semibold text-foreground">Subtotal Propiedad</p>
                            <p className="text-xl font-bold text-primary">
                              ₡{propiedad.periodosPendientes.reduce((s, p) => s + p.monto, 0).toLocaleString("es-CR")}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </Card>
              ))}

              {totalPendiente > 0 && (
                <Card className="p-6 bg-gradient-to-br from-primary/20 to-primary/5 border-primary">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total de Todas las Propiedades</p>
                      <p className="text-2xl font-bold text-foreground">₡{totalPendiente.toLocaleString("es-CR")}</p>
                    </div>
                    <DollarSign className="w-12 h-12 text-primary opacity-50" />
                  </div>
                </Card>
              )}

              {quejas.length > 0 && (
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <History className="w-5 h-5 text-primary" />
                    Historial de Quejas
                  </h2>

                  <div className="space-y-4">
                    {quejas.map((queja, index) => (
                      <motion.div
                        key={queja.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="p-4 bg-muted/50 rounded-lg border border-border"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(queja.estado)}
                            <span className="font-semibold text-foreground">{getStatusLabel(queja.estado)}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(queja.fecha).toLocaleDateString("es-CR")}
                          </span>
                        </div>

                        <div className="mb-2">
                          <p className="text-sm font-medium text-muted-foreground mb-1">Tipo de Queja:</p>
                          <p className="text-sm text-foreground capitalize">{queja.tipo.replace(/-/g, " ")}</p>
                        </div>

                        <div className="mb-2">
                          <p className="text-sm font-medium text-muted-foreground mb-1">Descripción:</p>
                          <p className="text-sm text-foreground">{queja.descripcion}</p>
                        </div>

                        {queja.respuesta && (
                          <div className="mt-3 pt-3 border-t border-border">
                            <p className="text-sm font-medium text-muted-foreground mb-1">Respuesta:</p>
                            <p className="text-sm text-foreground">{queja.respuesta}</p>
                          </div>
                        )}

                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground">Ticket: {queja.id}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              )}

              {totalPendiente > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                  <Button onClick={handleRegistrarQueja} className="w-full h-12 bg-transparent" variant="outline">
                    Registrar queja o apelación
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  )
}
