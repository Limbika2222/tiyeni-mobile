export type TripStatus =
  | "NOT_STARTED"
  | "ON_ROUTE"
  | "COMPLETED"
  | "CANCELLED"

export type PreferredGender =
  | "ANY"
  | "MALE"
  | "FEMALE"

export interface Trip {
  id?: string

  driverId: string
  driverName: string
  driverPhone?: string

  vehicleId: string
  vehicleType: string
  vehicleColor: string
  vehicleImage: string

  routeId: string
  routeName: string
  routeFrom: string
  routeTo: string

  departureTime: any
  waitingPlace: string
  endingPlace?: string

  pricePerSeat: number
  totalSeats: number
  availableSeats: number

  preferredGender: PreferredGender

  status: TripStatus
  milestoneIndex: number

  notes?: string

  createdAt: any
}
