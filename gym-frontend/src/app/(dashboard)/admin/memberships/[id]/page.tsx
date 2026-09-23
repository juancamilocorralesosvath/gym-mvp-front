/**
 * MEMBERSHIP DETAIL PAGE
 *
 * Página de detalle de una membresía específica.
 *
 * Características:
 * - Información completa de la membresía
 * - Cantidad de usuarios suscritos
 * - Lista de usuarios suscritos
 * - Solo accesible para rol ADMIN
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, DollarSign, Users, Eye } from 'lucide-react'
import { Button } from '@/app/components/ui/Button'
import { Modal } from '@/app/components/ui/Modal'
import { Table } from '@/app/components/ui/Table'
import membershipsService from '@/app/services/memberships/memberships.service'
import subscriptionsService from '@/app/services/subscriptions/subscriptions.service'
import type { Membership } from '@/app/interfaces/membership.interface'
import type { Subscription } from '@/app/interfaces/subscriptions.interface'
import type { User } from '@/app/interfaces/auth.interface'

interface MembershipDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default function MembershipDetailPage({ params }: MembershipDetailPageProps) {
  const router = useRouter()
  const [membership, setMembership] = useState<Membership | null>(null)
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [subscribedUsers, setSubscribedUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [membershipId, setMembershipId] = useState<string | null>(null)
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false)

  useEffect(() => {
    params.then((p) => {
      setMembershipId(p.id)
    })
  }, [params])

  useEffect(() => {
    if (membershipId) {
      loadMembershipData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [membershipId])

  const loadMembershipData = async () => {
    if (!membershipId) return

    try {
      setLoading(true)
      // Load membership details
      const membershipData = await membershipsService.getById(membershipId)
      setMembership(membershipData)

      // Load all subscriptions to filter users with this membership
      const allSubscriptions = await subscriptionsService.getAll()

      // Filter subscriptions that include this membership
      const filteredSubscriptions = allSubscriptions.filter(
        sub => sub.items && sub.items.some(item => item.membership?.id === membershipId)
      )
      setSubscriptions(filteredSubscriptions)

      // Extract unique users from filtered subscriptions
      const users = filteredSubscriptions
        .filter(sub => sub.user)
        .map(sub => sub.user)
      setSubscribedUsers(users)

    } catch (error: any) {
      console.error('Error loading membership:', error)
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.')
        router.push('/login')
        return
      }
      alert('Error loading membership details')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!membership) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Membership not found</p>
          <Button onClick={() => router.push('/admin/memberships')} variant="secondary" className="mt-4">
            Back to Memberships
          </Button>
        </div>
      </div>
    )
  }

  const usersColumns = [
    {
      key: 'fullName',
      header: 'Full Name'
    },
    {
      key: 'email',
      header: 'Email'
    },
    {
      key: 'age',
      header: 'Age'
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (user: User) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {user.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    }
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button
          onClick={() => router.push('/admin/memberships')}
          variant="ghost"
          size="sm"
        >
          <ArrowLeft size={16} />
          Back to Memberships
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">{membership.name}</h1>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${
            membership.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {membership.status ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <DollarSign size={20} className="text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Cost</p>
                <p className="mt-1 text-lg text-gray-900">${membership.cost.toFixed(2)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1">
                <Calendar size={20} className="text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Duration</p>
                <p className="mt-1 text-lg text-gray-900">
                  {membership.duration_months === 1 ? '1 Month' : `${membership.duration_months} Months`}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1">
                <Users size={20} className="text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Max Classes</p>
                <p className="mt-1 text-lg text-gray-900">{membership.max_classes_assistance} classes</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1">
                <Users size={20} className="text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Max Gym Visits</p>
                <p className="mt-1 text-lg text-gray-900">{membership.max_gym_assistance} visits</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Subscribed Users</h2>
            <p className="text-gray-600 mt-1">
              {subscribedUsers.length} {subscribedUsers.length === 1 ? 'user' : 'users'} subscribed to this membership
            </p>
          </div>
          {subscribedUsers.length > 0 && (
            <Button onClick={() => setIsUsersModalOpen(true)} variant="secondary">
              <Eye size={18} />
              View All Users
            </Button>
          )}
        </div>

        {subscribedUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No users are currently subscribed to this membership
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Users size={20} className="text-blue-600" />
              <p className="text-blue-900 font-medium">
                This membership has {subscribedUsers.length} active {subscribedUsers.length === 1 ? 'subscriber' : 'subscribers'}
              </p>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={isUsersModalOpen}
        onClose={() => setIsUsersModalOpen(false)}
        title="Subscribed Users"
        size="xl"
      >
        <div>
          <p className="text-gray-600 mb-4">
            Users subscribed to: <strong>{membership.name}</strong>
          </p>
          <Table
            data={subscribedUsers}
            columns={usersColumns}
            emptyMessage="No users subscribed"
          />
        </div>
      </Modal>
    </div>
  )
}
