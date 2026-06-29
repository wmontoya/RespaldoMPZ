import type { NextApiRequest, NextApiResponse } from 'next'
import getSessionId from '@/utils/sessionManager'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  user: any
) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        error: 'Método no permitido. Use POST.',
      })
    }

    const { API_ODOO_REQUEST } = process.env
    if (!API_ODOO_REQUEST) {
      throw new Error('No se ha configurado la URL de Odoo')
    }

    const sessionId = await getSessionId(user, true)
    if (!sessionId) {
      return res.status(401).json({
        success: false,
        error: 'Permiso denegado, sesión inválida',
      })
    }

    const { subscription_code, route_day_ids, subscription_id } = req.body

    if (!subscription_code) {
      return res.status(400).json({
        success: false,
        error: 'subscription_code es requerido',
      })
    }

    if (!Array.isArray(route_day_ids)) {
      return res.status(400).json({
        success: false,
        error: 'route_day_ids debe ser una lista',
      })
    }

    // 🔥 ESTE ES EL BODY CORRECTO PARA ODOO
    const odooBody = {
      jsonrpc: '2.0',
      params: {
        subscription_code,
        route_day_ids,
        subscription_id,
      },
    }

    const response = await fetch(
      `${API_ODOO_REQUEST}/api/v1/trash/subscribe`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `session_id=${sessionId}`,
        },
        body: JSON.stringify(odooBody),
      }
    )

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Odoo error ${response.status}: ${text}`)
    }

    const json = await response.json()

    if (!json?.result?.success) {
      throw new Error(json?.result?.error || 'Respuesta inválida desde Odoo')
    }

    return res.status(200).json({
      success: true,
      subscription_id: json.result.subscription_id,
      action: json.result.action,
    })
  } catch (error: any) {
    console.error('API subscribe error:', error)

    return res.status(500).json({
      success: false,
      error: error?.message || 'Error interno del servidor',
    })
  }
}
