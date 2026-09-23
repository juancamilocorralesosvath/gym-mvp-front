/**
 * INTERFACES INDEX
 *
 * Exportación centralizada de todas las interfaces.
 * Usar imports desde aquí para mayor organización.
 */

// Authentication interfaces
export type {
  Role,
  User,
  AuthResponse,
  RegisterDto,
  LoginDto,
  UpdateUserDto,
} from './auth.interface'

// Memberships interfaces
export type {
  Membership,
  CreateMembershipDto,
  UpdateMembershipDto,
} from './memberships.interface'

// Subscriptions interfaces
export type {
  Subscription,
  CreateSubscriptionDto,
  AddMembershipDto,
  UpdateSubscriptionDto,
} from './subscriptions.interface'

// Attendances interfaces
export type {
  Attendance,
  AttendanceStatus,
  AttendanceStatsResponse,
  CreateAttendanceDto,
  CheckOutDto,
} from './attendance.interface'
