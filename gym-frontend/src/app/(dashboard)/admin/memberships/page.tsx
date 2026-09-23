/**
 * MEMBERSHIPS MANAGEMENT PAGE
 *
 * Página de gestión de membresías del gimnasio.
 * Permite ver, crear, editar y eliminar membresías.
 *
 * Características:
 * - Listado de membresías activas
 * - Crear nuevas membresías
 * - Ver detalles de membresía
 * - Activar/desactivar membresías
 * - Solo accesible para rol ADMIN
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Eye, ToggleLeft, ToggleRight, Edit } from 'lucide-react'
import { Button } from '@/app/components/ui/Button'
import { Table } from '@/app/components/ui/Table'
import { Modal } from '@/app/components/ui/Modal'
import { CreateMembershipForm } from '@/app/components/features/memberships/CreateMembershipForm'
import { EditMembershipForm } from '@/app/components/features/memberships/EditMembershipForm'
import membershipsService from '@/app/services/memberships/memberships.service'
import type { Membership, CreateMembershipDto, UpdateMembershipDto } from '@/app/interfaces/membership.interface'

export default function MembershipsManagementPage() {
  const router = useRouter()
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedMembership, setSelectedMembership] = useState<Membership | null>(null)

  useEffect(() => {
    loadMemberships()
  }, [])

  const loadMemberships = async () => {
    try {
      setLoading(true)
      const data = await membershipsService.getAll()
      // Filter only active memberships
      setMemberships(data.filter(m => m.status))
    } catch (error) {
      console.error('Error loading memberships:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMembership = async (data: CreateMembershipDto) => {
    try {
      await membershipsService.create(data)
      setIsCreateModalOpen(false)
      loadMemberships()
    } catch (error: any) {
      throw error
    }
  }

  const handleEditMembership = async (id: string, data: UpdateMembershipDto) => {
    try {
      await membershipsService.update(id, data)
      setIsEditModalOpen(false)
      setSelectedMembership(null)
      loadMemberships()
    } catch (error: any) {
      throw error
    }
  }

  const handleOpenEditModal = (membership: Membership) => {
    setSelectedMembership(membership)
    setIsEditModalOpen(true)
  }

  const handleToggleStatus = async (id: string) => {
    if (!confirm('Are you sure you want to change the status of this membership?')) return

    try {
      await membershipsService.toggleStatus(id)
      loadMemberships()
    } catch (error) {
      console.error('Error toggling status:', error)
      alert('Error changing membership status')
    }
  }

  const handleViewMembership = (id: string) => {
    router.push(`/admin/memberships/${id}`)
  }

  const columns = [
    {
      key: 'name',
      header: 'Name'
    },
    {
      key: 'cost',
      header: 'Cost',
      render: (membership: Membership) => `$${membership.cost.toFixed(2)}`
    },
    {
      key: 'duration_months',
      header: 'Duration',
      render: (membership: Membership) => (
        <span>
          {membership.duration_months === 1 ? '1 Month' : `${membership.duration_months} Months`}
        </span>
      )
    },
    {
      key: 'max_classes_assistance',
      header: 'Max Classes',
      render: (membership: Membership) => membership.max_classes_assistance
    },
    {
      key: 'max_gym_assistance',
      header: 'Max Gym Visits',
      render: (membership: Membership) => membership.max_gym_assistance
    },
    {
      key: 'status',
      header: 'Status',
      render: (membership: Membership) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          membership.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {membership.status ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (membership: Membership) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleViewMembership(membership.id)}
            className="text-blue-600 hover:text-blue-800 p-1"
            title="View details"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => handleOpenEditModal(membership)}
            className="text-green-600 hover:text-green-800 p-1"
            title="Edit membership"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => handleToggleStatus(membership.id)}
            className="text-gray-600 hover:text-gray-800 p-1"
            title="Toggle status"
          >
            {membership.status ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Memberships Management</h1>
          <p className="text-gray-600 mt-1">Manage gym membership plans</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={20} />
          Create Membership
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table
          data={memberships}
          columns={columns}
          loading={loading}
          emptyMessage="No active memberships found"
        />
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Membership"
        size="lg"
      >
        <CreateMembershipForm
          onSubmit={handleCreateMembership}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedMembership(null)
        }}
        title="Edit Membership"
        size="lg"
      >
        {selectedMembership && (
          <EditMembershipForm
            membership={selectedMembership}
            onSubmit={handleEditMembership}
            onCancel={() => {
              setIsEditModalOpen(false)
              setSelectedMembership(null)
            }}
          />
        )}
      </Modal>
    </div>
  )
}
