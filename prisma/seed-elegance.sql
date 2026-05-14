-- Elegance clean seed data.
-- This script intentionally removes existing content rows before inserting a
-- complete, polished demo dataset for the client app.

TRUNCATE TABLE
  "BookingService",
  "Booking",
  "Employee",
  "Branch",
  "Service",
  "Testimonial",
  "GalleryImage",
  "Promotion"
RESTART IDENTITY CASCADE;

INSERT INTO "Branch" (
  "id",
  "name",
  "location",
  "phoneNumber",
  "image",
  "latitude",
  "longitude",
  "openingTime",
  "closingTime",
  "status",
  "createdAt",
  "updatedAt"
) VALUES
  (
    'branch_downtown',
    'Elegance Downtown',
    '125 W Jefferson Ave, Naperville, IL 60540',
    '+16305550101',
    'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&q=80',
    41.7758,
    -88.1486,
    '09:00',
    '20:00',
    'active',
    NOW(),
    NOW()
  ),
  (
    'branch_riverwalk',
    'Elegance Riverwalk',
    '302 S Washington St, Naperville, IL 60540',
    '+16305550102',
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
    41.7719,
    -88.1505,
    '10:00',
    '21:00',
    'active',
    NOW(),
    NOW()
  );

INSERT INTO "Employee" (
  "id",
  "name",
  "title",
  "image",
  "phoneNumber",
  "email",
  "specialties",
  "rating",
  "status",
  "branchId",
  "createdAt",
  "updatedAt"
) VALUES
  (
    'employee_ava',
    'Ava Chen',
    'Lead Nail Artist',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
    '+16305551101',
    'ava@elegance.example',
    ARRAY['Gel extensions', 'Chrome finishes', 'Minimal nail art'],
    4.9,
    'active',
    'branch_downtown',
    NOW(),
    NOW()
  ),
  (
    'employee_maya',
    'Maya Johnson',
    'Spa Pedicure Specialist',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    '+16305551102',
    'maya@elegance.example',
    ARRAY['Spa pedicures', 'Callus care', 'French polish'],
    4.8,
    'active',
    'branch_downtown',
    NOW(),
    NOW()
  ),
  (
    'employee_sofia',
    'Sofia Martinez',
    'Nail Art Designer',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    '+16305551103',
    'sofia@elegance.example',
    ARRAY['Hand-painted art', 'Bridal sets', 'Acrylic overlays'],
    5.0,
    'active',
    'branch_riverwalk',
    NOW(),
    NOW()
  ),
  (
    'employee_lena',
    'Lena Park',
    'Manicure Specialist',
    'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80',
    '+16305551104',
    'lena@elegance.example',
    ARRAY['Classic manicures', 'Builder gel', 'Natural nail care'],
    4.7,
    'active',
    'branch_riverwalk',
    NOW(),
    NOW()
  );

INSERT INTO "Service" (
  "id",
  "name",
  "description",
  "price",
  "duration",
  "category",
  "image",
  "popular",
  "status",
  "createdAt",
  "updatedAt"
) VALUES
  (
    'service_signature_manicure',
    'Elegance Signature Manicure',
    'Cuticle care, shaping, hydrating massage, and flawless polish finish.',
    38,
    45,
    'manicure',
    'https://images.unsplash.com/photo-1610992015732-2449b76344bc?auto=format&fit=crop&w=1200&q=80',
    true,
    'active',
    NOW(),
    NOW()
  ),
  (
    'service_luxe_pedicure',
    'Luxe Spa Pedicure',
    'Soak, exfoliation, callus smoothing, massage, and long-wear polish.',
    62,
    70,
    'pedicure',
    'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=1200&q=80',
    true,
    'active',
    NOW(),
    NOW()
  ),
  (
    'service_gel_overlay',
    'Builder Gel Overlay',
    'Strengthening builder gel overlay for natural nails with a glossy finish.',
    58,
    75,
    'gel_acrylic',
    'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=1200&q=80',
    true,
    'active',
    NOW(),
    NOW()
  ),
  (
    'service_acrylic_full_set',
    'Acrylic Full Set',
    'Custom acrylic extensions shaped and finished to your preferred style.',
    72,
    95,
    'gel_acrylic',
    'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1200&q=80',
    false,
    'active',
    NOW(),
    NOW()
  ),
  (
    'service_custom_art',
    'Custom Nail Art',
    'Hand-painted designs, accents, chrome, gems, or seasonal art.',
    28,
    30,
    'nail_art',
    'https://images.unsplash.com/photo-1610992015762-45dca7fa2dd8?auto=format&fit=crop&w=1200&q=80',
    true,
    'active',
    NOW(),
    NOW()
  ),
  (
    'service_paraffin',
    'Paraffin Hand Treatment',
    'Warm paraffin treatment to soften and deeply hydrate hands.',
    18,
    20,
    'spa',
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80',
    false,
    'active',
    NOW(),
    NOW()
  ),
  (
    'service_polish_change',
    'Polish Change',
    'Quick polish refresh for hands or feet.',
    16,
    20,
    'additional',
    'https://images.unsplash.com/photo-1604654894611-6973b376cbde?auto=format&fit=crop&w=1200&q=80',
    false,
    'active',
    NOW(),
    NOW()
  );

INSERT INTO "Booking" (
  "id",
  "customerName",
  "customerEmail",
  "customerPhone",
  "date",
  "time",
  "notes",
  "status",
  "totalPrice",
  "totalDuration",
  "branchId",
  "employeeId",
  "createdAt",
  "updatedAt"
) VALUES
  (
    'booking_emily_pending',
    'Emily Carter',
    'emily.carter@example.com',
    '+16305552201',
    CURRENT_DATE + INTERVAL '2 days',
    '10:00',
    'Prefers soft pink tones.',
    'confirmed',
    66,
    75,
    'branch_downtown',
    'employee_ava',
    NOW(),
    NOW()
  ),
  (
    'booking_natalie_pending',
    'Natalie Brooks',
    'natalie.brooks@example.com',
    '+16305552202',
    CURRENT_DATE + INTERVAL '3 days',
    '14:30',
    'Bridal trial set.',
    'pending',
    100,
    125,
    'branch_riverwalk',
    'employee_sofia',
    NOW(),
    NOW()
  ),
  (
    'booking_grace_completed',
    'Grace Lee',
    'grace.lee@example.com',
    '+16305552203',
    CURRENT_DATE - INTERVAL '4 days',
    '11:30',
    NULL,
    'completed',
    62,
    70,
    'branch_downtown',
    'employee_maya',
    NOW(),
    NOW()
  );

INSERT INTO "BookingService" (
  "id",
  "bookingId",
  "serviceId",
  "price",
  "duration"
) VALUES
  (
    'booking_service_emily_manicure',
    'booking_emily_pending',
    'service_signature_manicure',
    38,
    45
  ),
  (
    'booking_service_emily_art',
    'booking_emily_pending',
    'service_custom_art',
    28,
    30
  ),
  (
    'booking_service_natalie_acrylic',
    'booking_natalie_pending',
    'service_acrylic_full_set',
    72,
    95
  ),
  (
    'booking_service_natalie_art',
    'booking_natalie_pending',
    'service_custom_art',
    28,
    30
  ),
  (
    'booking_service_grace_pedicure',
    'booking_grace_completed',
    'service_luxe_pedicure',
    62,
    70
  );

INSERT INTO "Testimonial" (
  "id",
  "name",
  "image",
  "rating",
  "comment",
  "service",
  "featured",
  "status",
  "createdAt",
  "updatedAt"
) VALUES
  (
    'testimonial_olivia',
    'Olivia Hart',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
    5,
    'Elegance is calm, spotless, and incredibly detail-oriented. My gel manicure lasted beautifully.',
    'Builder Gel Overlay',
    true,
    'active',
    NOW(),
    NOW()
  ),
  (
    'testimonial_priya',
    'Priya Shah',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=800&q=80',
    5,
    'The staff listened carefully and created exactly the minimal chrome set I wanted.',
    'Custom Nail Art',
    true,
    'active',
    NOW(),
    NOW()
  ),
  (
    'testimonial_morgan',
    'Morgan Ellis',
    NULL,
    4,
    'Lovely pedicure and a really relaxing space. I already booked my next appointment.',
    'Luxe Spa Pedicure',
    false,
    'active',
    NOW(),
    NOW()
  );

INSERT INTO "GalleryImage" (
  "id",
  "image",
  "title",
  "category",
  "featured",
  "status",
  "createdAt",
  "updatedAt"
) VALUES
  (
    'gallery_chrome_blush',
    'https://images.unsplash.com/photo-1604902396830-aca29e19b067?auto=format&fit=crop&w=1200&q=80',
    'Blush Chrome Set',
    'chrome',
    true,
    'active',
    NOW(),
    NOW()
  ),
  (
    'gallery_french_pearl',
    'https://images.unsplash.com/photo-1610992015762-45dca7fa2dd8?auto=format&fit=crop&w=1200&q=80',
    'Pearl French Tips',
    'french',
    true,
    'active',
    NOW(),
    NOW()
  ),
  (
    'gallery_bridal_soft_white',
    'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1200&q=80',
    'Soft White Bridal Nails',
    'bridal',
    false,
    'active',
    NOW(),
    NOW()
  ),
  (
    'gallery_minimal_line_art',
    'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&q=80',
    'Minimal Line Art',
    'nail art',
    false,
    'active',
    NOW(),
    NOW()
  );

INSERT INTO "Promotion" (
  "id",
  "title",
  "description",
  "discount",
  "code",
  "validFrom",
  "validUntil",
  "status",
  "createdAt",
  "updatedAt"
) VALUES
  (
    'promotion_first_visit',
    'First Visit Glow',
    'New guests receive 15% off any manicure or pedicure service.',
    15,
    'ELEGANCE15',
    CURRENT_DATE - INTERVAL '7 days',
    CURRENT_DATE + INTERVAL '45 days',
    'active',
    NOW(),
    NOW()
  ),
  (
    'promotion_bridal_party',
    'Bridal Party Package',
    'Save 20% when booking four or more bridal party services.',
    20,
    'BRIDAL20',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '90 days',
    'active',
    NOW(),
    NOW()
  ),
  (
    'promotion_weekday_refresh',
    'Weekday Refresh',
    'Enjoy 10% off polish changes Monday through Thursday.',
    10,
    'REFRESH10',
    CURRENT_DATE - INTERVAL '30 days',
    CURRENT_DATE + INTERVAL '30 days',
    'active',
    NOW(),
    NOW()
  );
