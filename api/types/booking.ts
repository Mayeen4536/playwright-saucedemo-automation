export type BookingDates = {
  checkin: string;
  checkout: string;
};

export type Booking = {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: BookingDates;
  additionalneeds?: string;
};

export type CreateBookingRequest = Booking;

export type CreateBookingResponse = {
  // Server-generated on every call — never assert its exact value, only its type.
  bookingid: number;
  booking: Booking;
};
