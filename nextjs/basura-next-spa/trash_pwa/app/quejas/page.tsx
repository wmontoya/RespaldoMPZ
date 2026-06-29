"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, User, FileText, CheckCircle, AlertCircle } from "lucide-react"
import { MainLayout } from "@/components/main-layout"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useStore } from "@/lib/store"

interface FormData {
  nombre: string
  cedula: string
  tipo: string
  descripcion: string
}

export default function QuejasPage() {
  const { ciudadano } = useStore()
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    cedula: "",
    tipo: "",
    descripcion: "",
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (ciudadano) {
      setFormData((prev) => ({
        ...prev,
        nombre: ciudadano.nombre,
        cedula: ciudadano.cedula,
      }))
    }
  }, [ciudadano])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nombre || !formData.cedula || !formData.tipo || !formData.descripcion) {
      setError("Por favor complete todos los campos")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/quejas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Error al enviar la queja")
      }

      const data = await response.json()
      if (data.queja) {
        useStore.getState().addQueja(data.queja)
      }

      setSuccess(true)
      setFormData({
        nombre: "",
        cedula: "",
        tipo: "",
        descripcion: "",
      })

      setTimeout(() => {
        setSuccess(false)
      }, 5000)
    } catch (err) {
      setError("No se pudo enviar la queja. Intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Quejas y Apelaciones</h1>
          <p className="text-muted-foreground text-lg">Registra tu reclamo sobre el servicio o la tarifa</p>
        </motion.div>

        {/* Success Message */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              className="mb-6"
            >
              <Card className="p-4 bg-primary/10 border-primary">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Queja enviada exitosamente</p>
                    <p className="text-sm text-muted-foreground">
                      Recibirás una respuesta en los próximos 5 días hábiles
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Info */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Información Personal
                </h2>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre Completo</Label>
                    <Input
                      id="nombre"
                      type="text"
                      placeholder="Ej: Juan Pérez Rodríguez"
                      value={formData.nombre}
                      onChange={(e) => handleInputChange("nombre", e.target.value)}
                      disabled={loading}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cedula">Número de Cédula</Label>
                    <Input
                      id="cedula"
                      type="text"
                      placeholder="Ej: 1-2345-6789"
                      value={formData.cedula}
                      onChange={(e) => handleInputChange("cedula", e.target.value)}
                      disabled={loading}
                      className="h-11"
                    />
                  </div>
                </div>
              </div>

              {/* Complaint Type */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Tipo de Reclamo
                </h2>

                <div className="space-y-2">
                  <Label htmlFor="tipo">Seleccione el tipo</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value) => handleInputChange("tipo", value)}
                    disabled={loading}
                  >
                    <SelectTrigger id="tipo" className="h-11">
                      <SelectValue placeholder="Seleccione una opción" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mala-recoleccion">Mala recolección</SelectItem>
                      <SelectItem value="tarifa-incorrecta">Tarifa incorrecta</SelectItem>
                      <SelectItem value="servicio-no-prestado">Servicio no prestado</SelectItem>
                      <SelectItem value="dano-propiedad">Daño a propiedad</SelectItem>
                      <SelectItem value="horario-incorrecto">Horario incorrecto</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Descripción del Problema
                </h2>

                <div className="space-y-2">
                  <Label htmlFor="descripcion">Detalle su reclamo</Label>
                  <Textarea
                    id="descripcion"
                    placeholder="Describa detalladamente su queja o apelación..."
                    value={formData.descripcion}
                    onChange={(e) => handleInputChange("descripcion", e.target.value)}
                    disabled={loading}
                    rows={6}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Incluya fechas, horarios y cualquier detalle relevante
                  </p>
                </div>
              </div>

              {/* Error Message */}
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

              {/* Submit Button */}
              <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <motion.div
                      className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    />
                    <span>Enviando...</span>
                  </div>
                ) : (
                  "Enviar Queja"
                )}
              </Button>
            </form>
          </Card>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6"
        >
          <Card className="p-4 bg-muted/50 border-border">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Nota:</strong> Todas las quejas y apelaciones son revisadas por
              nuestro equipo. Recibirá una respuesta oficial dentro de 5 días hábiles en la dirección registrada. Para
              consultas adicionales, puede comunicarse al teléfono 2222-2222 o al correo quejas@municipalidad.go.cr
            </p>
          </Card>
        </motion.div>
      </div>
    </MainLayout>
  )
}
