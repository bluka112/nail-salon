# Elegance API Docs

Base URL:

```txt
https://nail-salon-delta-eight.vercel.app/api
```

Use JSON for request bodies:

```ts
headers: { "Content-Type": "application/json" }
```

## Enums

```ts
type Status = "active" | "disabled";

type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

type ServiceCategory =
  | "manicure"
  | "pedicure"
  | "gel_acrylic"
  | "nail_art"
  | "spa"
  | "additional";
```

## Branches

### List Branches

```http
GET /branches
```

Query params:

```ts
page?: number;
limit?: number;
search?: string;
status?: "active" | "disabled";
```

Response:

```ts
{
  success: true;
  message: "Success";
  total: number;
  branches: Branch[];
}
```

### Get Branch

```http
GET /branches/:id
```

Response:

```ts
{
  success: true;
  branch: Branch;
}
```

Branch responses include active employees and booking count.

## Services

### List Services

```http
GET /services
```

Query params:

```ts
page?: number;
limit?: number;
search?: string;
category?: ServiceCategory;
status?: "active" | "disabled";
popular?: "true";
```

Response:

```ts
{
  success: true;
  message: "Success";
  total: number;
  services: Service[];
}
```

## Employees

### List Employees

```http
GET /employees
```

Query params:

```ts
page?: number;
limit?: number;
search?: string;
branchId?: string;
status?: "active" | "disabled";
```

Response:

```ts
{
  success: true;
  message: "Success";
  total: number;
  employees: Employee[];
}
```

Employee responses include branch data.

## Bookings

### List Bookings

```http
GET /bookings
```

Query params:

```ts
page?: number;
limit?: number;
search?: string;
branchId?: string;
employeeId?: string;
status?: BookingStatus;
date?: string; // YYYY-MM-DD
```

### Create Booking

```http
POST /bookings
```

Body:

```ts
{
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string; // YYYY-MM-DD or ISO date
  time: string; // HH:mm
  notes?: string;
  status?: BookingStatus;
  branchId: string;
  employeeId?: string;
  services: { serviceId: string }[];
}
```

The API calculates `totalPrice` and `totalDuration` from selected services.

Response:

```ts
{
  success: true;
  message: "Booking created successfully";
  booking: Booking;
}
```

Booking responses include branch, employee, and selected service details.

## Availability

### Get Available Time Slots

```http
GET /bookings/availability
```

Query params:

```ts
branchId: string;
date: string; // YYYY-MM-DD
employeeId?: string;
duration?: number; // minutes, default 60
```

Response:

```ts
{
  success: true;
  date: string;
  branchId: string;
  employeeId?: string;
  slots: {
    time: string; // HH:mm
    available: boolean;
  }[];
}
```

## Testimonials

### List Testimonials

```http
GET /testimonials
```

Query params:

```ts
page?: number;
limit?: number;
search?: string;
status?: "active" | "disabled";
featured?: "true";
```

Response:

```ts
{
  success: true;
  message: "Success";
  total: number;
  testimonials: Testimonial[];
}
```

## Gallery

### List Gallery Images

```http
GET /gallery
```

Query params:

```ts
page?: number;
limit?: number;
search?: string;
category?: string;
status?: "active" | "disabled";
featured?: "true";
```

Response:

```ts
{
  success: true;
  message: "Success";
  total: number;
  images: GalleryImage[];
}
```

## Promotions

### List Promotions

```http
GET /promotions
```

Query params:

```ts
page?: number;
limit?: number;
search?: string;
status?: "active" | "disabled";
active?: "true";
```

Response:

```ts
{
  success: true;
  message: "Success";
  total: number;
  promotions: Promotion[];
}
```

## Client Examples

### Load Active Services

```ts
const API = "https://nail-salon-delta-eight.vercel.app/api";

export async function getActiveServices() {
  const res = await fetch(`${API}/services?status=active`);
  if (!res.ok) throw new Error("Failed to load services");
  return res.json();
}
```

### Create Booking

```ts
const API = "https://nail-salon-delta-eight.vercel.app/api";

export async function createBooking(data: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  time: string;
  branchId: string;
  employeeId?: string;
  services: { serviceId: string }[];
  notes?: string;
}) {
  const res = await fetch(`${API}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to create booking");
  return res.json();
}
```

## Notes

Admin-style write endpoints also exist for most resources with `POST`, `PATCH /:id`, and `DELETE /:id`. A public client app should usually only need read endpoints plus `POST /bookings`.
