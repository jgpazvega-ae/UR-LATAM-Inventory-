/**
 * Validation and error handling utilities
 */

export interface ValidationResult {
  valid: boolean
  errors: Record<string, string>
}

export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export const validatePhone = (phone: string): boolean => {
  return /^[\d\s\-\+\(\)]{7,}$/.test(phone)
}

export const validateRobotSerialNumber = (serial: string): boolean => {
  return serial.trim().length >= 3 && serial.trim().length <= 50
}

export const validateDate = (date: string): boolean => {
  try {
    const d = new Date(date)
    return d instanceof Date && !isNaN(d.getTime())
  } catch {
    return false
  }
}

export const validateRobotForm = (data: {
  numeroSerie?: string
  modelo?: string
  familiaId?: string
  estado?: string
  region?: string
}): ValidationResult => {
  const errors: Record<string, string> = {}

  if (!data.numeroSerie || !validateRobotSerialNumber(data.numeroSerie)) {
    errors.numeroSerie = 'Número de serie inválido (3-50 caracteres)'
  }

  if (!data.familiaId) {
    errors.familiaId = 'Debes seleccionar una familia'
  }

  if (!data.estado) {
    errors.estado = 'Debes seleccionar un estado'
  }

  if (!data.region) {
    errors.region = 'Debes seleccionar una región'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

export const validateLocationForm = (data: {
  nombre?: string
  tipo?: string
  direccion?: string
  ciudad?: string
  contactoNombre?: string
  contactoEmail?: string
  contactoTelefono?: string
}): ValidationResult => {
  const errors: Record<string, string> = {}

  if (!data.nombre || data.nombre.trim().length < 3) {
    errors.nombre = 'El nombre debe tener al menos 3 caracteres'
  }

  if (!data.tipo) {
    errors.tipo = 'Debes seleccionar un tipo de ubicación'
  }

  if (!data.contactoEmail || !validateEmail(data.contactoEmail)) {
    errors.contactoEmail = 'Email inválido'
  }

  if (data.contactoTelefono && !validatePhone(data.contactoTelefono)) {
    errors.contactoTelefono = 'Teléfono inválido'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

export const formatErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, any>
    if (err.response?.data?.error) {
      return err.response.data.error
    }
    if (err.message) {
      return err.message
    }
  }

  return 'Ocurrió un error inesperado'
}

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '')
}
