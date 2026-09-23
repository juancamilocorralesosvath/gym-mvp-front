/**
 * MY ATTENDANCE PAGE
 *
 * Página donde el cliente puede ver su historial de asistencias.
 *
 * Características:
 * - Historial de asistencias
 * - Estadísticas mensuales
 * - Filtros por tipo y fecha
 * - Comparación con meses anteriores
 * - Solo accesible para rol CLIENT
 */

'use client'

import { useState, useEffect } from 'react'
import { Calendar, TrendingUp, Filter, AlertCircle } from 'lucide-react'
import { Button } from '@/app/components/ui/Button'
import attendancesService from '@/app/services/attendances/attendances.service'
import { useAuthStore } from '@/app/_store/auth/auth.store'
import { AttendanceType } from '@/app/interfaces/attendance.interface'
import type { Attendance, AttendanceStatsResponse } from '@/app/interfaces/attendance.interface'

export default function MyAttendancePage() {
  const { user } = useAuthStore()
  const [history, setHistory] = useState<Attendance[]>([])
  const [stats, setStats] = useState<AttendanceStatsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterType, setFilterType] = useState<AttendanceType | 'all'>('all')

  useEffect(() => {
    loadAttendanceData()
  }, [])

  const loadAttendanceData = async () => {
    if (!user || !user.id) {
      setError('No se pudo obtener información del usuario')
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')

    try {
      // Cargar historial
      const historyData = await attendancesService.getHistory(user.id)
      setHistory(historyData)

      // Cargar estadísticas
      const statsData = await attendancesService.getStats(user.id)
      setStats(statsData)
    } catch (err: any) {
      console.error('Error loading attendance data:', err)
      setError(err.response?.data?.message || 'Error al cargar datos de asistencia')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const calculateDuration = (entrance: string, exit?: string) => {
    if (!exit) return '-'

    const entranceDate = new Date(entrance)
    const exitDate = new Date(exit)
    const diffMs = exitDate.getTime() - entranceDate.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 60) {
      return `${diffMins} min`
    }

    const hours = Math.floor(diffMins / 60)
    const mins = diffMins % 60
    return `${hours}h ${mins}m`
  }

  const filteredHistory = filterType === 'all'
    ? history
    : history.filter(a => a.type === filterType)

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mi Historial de Asistencias</h1>
        <p className="text-gray-600 mt-1">Revisa tu historial y estadísticas de asistencia</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-center gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">Cargando historial...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Estadísticas */}
          {stats && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Estadísticas Generales</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Gimnasio</p>
                      <p className="text-3xl font-bold text-blue-600 mt-2">
                        {stats.totalGymAttendances}
                      </p>
                    </div>
                    <TrendingUp className="text-blue-600" size={32} />
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Clases</p>
                      <p className="text-3xl font-bold text-purple-600 mt-2">
                        {stats.totalClassAttendances}
                      </p>
                    </div>
                    <Calendar className="text-purple-600" size={32} />
                  </div>
                </div>
              </div>

              {/* Estadísticas mensuales */}
              {stats.monthlyStats && stats.monthlyStats.length > 0 && (
                <div className="mt-4 bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Estadísticas por Mes</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Mes</th>
                          <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Gimnasio</th>
                          <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Clases</th>
                          <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.monthlyStats.map((stat, index) => (
                          <tr key={index} className="border-b border-gray-100">
                            <td className="py-3 px-4 text-sm text-gray-900">{stat.month}</td>
                            <td className="py-3 px-4 text-sm text-center">
                              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                {stat.gymCount}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-center">
                              <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 rounded">
                                {stat.classCount}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-center font-bold text-gray-900">
                              {stat.gymCount + stat.classCount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Filtros */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-4">
              <Filter size={20} className="text-gray-500" />
              <div className="flex gap-2">
                <Button
                  onClick={() => setFilterType('all')}
                  variant={filterType === 'all' ? 'primary' : 'secondary'}
                  className="text-sm"
                >
                  Todas
                </Button>
                <Button
                  onClick={() => setFilterType(AttendanceType.GYM)}
                  variant={filterType === AttendanceType.GYM ? 'primary' : 'secondary'}
                  className="text-sm"
                >
                  Gimnasio
                </Button>
                <Button
                  onClick={() => setFilterType(AttendanceType.CLASS)}
                  variant={filterType === AttendanceType.CLASS ? 'primary' : 'secondary'}
                  className="text-sm"
                >
                  Clases
                </Button>
              </div>
              <div className="ml-auto text-sm text-gray-600">
                {filteredHistory.length} {filteredHistory.length === 1 ? 'asistencia' : 'asistencias'}
              </div>
            </div>
          </div>

          {/* Historial */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Historial Completo</h2>
            </div>

            {filteredHistory.length === 0 ? (
              <div className="p-8 text-center">
                <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500">No hay registros de asistencia</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Entrada
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Salida
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Duración
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredHistory.map((attendance) => (
                      <tr key={attendance.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(attendance.entranceDatetime)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            attendance.type === 'gym'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {attendance.type === 'gym' ? 'Gimnasio' : 'Clase'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatTime(attendance.entranceDatetime)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {attendance.type === 'class'
                            ? '-'
                            : attendance.exitDatetime ? formatTime(attendance.exitDatetime) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {attendance.type === 'class'
                            ? '-'
                            : calculateDuration(attendance.entranceDatetime, attendance.exitDatetime)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {attendance.type === 'class' ? (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                              Registrado
                            </span>
                          ) : !attendance.exitDatetime ? (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Dentro
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              Salió
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
