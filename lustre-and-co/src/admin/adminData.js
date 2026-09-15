export const adminProducts = [
  {
    id: "p1",
    name: "Celeste Pearl Drop Earrings",
    sku: "LC-EAR-001",
    category: "Earrings",
    price: 1299,
    stock: 42,
    status: "Active",
    sales: 124,
    image:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=500&q=85"
  },
  {
    id: "p2",
    name: "Luna Layered Chain Necklace",
    sku: "LC-NEC-002",
    category: "Necklaces",
    price: 1599,
    stock: 28,
    status: "Active",
    sales: 89,
    image:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=500&q=85"
  },
  {
    id: "p3",
    name: "Rose Muse Adjustable Ring",
    sku: "LC-RNG-003",
    category: "Rings",
    price: 899,
    stock: 11,
    status: "Low stock",
    sales: 76,
    image:
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=500&q=85"
  },
  {
    id: "p4",
    name: "Serena Crystal Tennis Bracelet",
    sku: "LC-BRC-004",
    category: "Bracelets",
    price: 1799,
    stock: 0,
    status: "Out of stock",
    sales: 61,
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=500&q=85"
  },
  {
    id: "p5",
    name: "Meher Bridal Kundan Necklace",
    sku: "LC-BRD-005",
    category: "Necklaces",
    price: 3499,
    stock: 19,
    status: "Active",
    sales: 42,
    image:
      "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=500&q=85"
  },
  {
    id: "p6",
    name: "Noor Chandbali Earrings",
    sku: "LC-BRD-006",
    category: "Earrings",
    price: 2199,
    stock: 7,
    status: "Low stock",
    sales: 53,
    image:
      "https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?auto=format&fit=crop&w=500&q=85"
  }
];

export const adminOrders = [
  {
    id: "LST-845921",
    customer: "Aanya Sharma",
    email: "aanya@example.com",
    date: "13 Sep 2026",
    amount: 2898,
    payment: "Paid",
    status: "Processing"
  },
  {
    id: "LST-845920",
    customer: "Meera Kapoor",
    email: "meera@example.com",
    date: "13 Sep 2026",
    amount: 1599,
    payment: "Paid",
    status: "Shipped"
  },
  {
    id: "LST-845919",
    customer: "Riya Mehta",
    email: "riya@example.com",
    date: "12 Sep 2026",
    amount: 4299,
    payment: "Paid",
    status: "Delivered"
  },
  {
    id: "LST-845918",
    customer: "Kavya Shah",
    email: "kavya@example.com",
    date: "12 Sep 2026",
    amount: 899,
    payment: "Pending",
    status: "Payment pending"
  },
  {
    id: "LST-845917",
    customer: "Nisha Rao",
    email: "nisha@example.com",
    date: "11 Sep 2026",
    amount: 1999,
    payment: "Paid",
    status: "Cancelled"
  }
];

export const adminCustomers = [
  {
    id: "CUS-001",
    name: "Aanya Sharma",
    email: "aanya@example.com",
    orders: 8,
    spent: 18990,
    joined: "Aug 2026",
    status: "Active"
  },
  {
    id: "CUS-002",
    name: "Meera Kapoor",
    email: "meera@example.com",
    orders: 5,
    spent: 10450,
    joined: "Jul 2026",
    status: "Active"
  },
  {
    id: "CUS-003",
    name: "Riya Mehta",
    email: "riya@example.com",
    orders: 3,
    spent: 7280,
    joined: "Jul 2026",
    status: "Active"
  },
  {
    id: "CUS-004",
    name: "Kavya Shah",
    email: "kavya@example.com",
    orders: 1,
    spent: 899,
    joined: "Sep 2026",
    status: "New"
  },
  {
    id: "CUS-005",
    name: "Nisha Rao",
    email: "nisha@example.com",
    orders: 12,
    spent: 28640,
    joined: "May 2026",
    status: "Active"
  }
];

export const adminDiscounts = [
  {
    id: "DISC-001",
    code: "WELCOME10",
    type: "Percentage",
    value: "10%",
    uses: 84,
    limit: 500,
    expiry: "30 Sep 2026",
    status: "Active"
  },
  {
    id: "DISC-002",
    code: "BRIDAL15",
    type: "Percentage",
    value: "15%",
    uses: 28,
    limit: 100,
    expiry: "15 Oct 2026",
    status: "Active"
  },
  {
    id: "DISC-003",
    code: "LUSTRE500",
    type: "Fixed amount",
    value: "₹500",
    uses: 112,
    limit: 150,
    expiry: "20 Sep 2026",
    status: "Expiring soon"
  }
];

export const salesData = [
  { label: "Mon", value: 42000 },
  { label: "Tue", value: 58000 },
  { label: "Wed", value: 47000 },
  { label: "Thu", value: 72000 },
  { label: "Fri", value: 64000 },
  { label: "Sat", value: 96000 },
  { label: "Sun", value: 84000 }
];

export const formatAdminPrice = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);