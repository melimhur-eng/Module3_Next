import { getDishes } from "@/lib/dishes";

// GET /api/dishes                    -> 200, every dish (array)
// GET /api/dishes?category=Vegan     -> 200, only that category (array)
// GET /api/dishes?q=tibs             -> 200, dishes whose name contains "tibs" (array)
// GET /api/dishes?page=2&limit=3     -> 200, { items, page, totalPages, total }
export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const category = params.get("category");
  const q = params.get("q")?.trim().toLowerCase();

  let dishes = await getDishes();
  if (category) dishes = dishes.filter((d) => d.category === category);
  if (q) dishes = dishes.filter((d) => d.name.toLowerCase().includes(q));

  if (!params.has("page")) return Response.json(dishes);

  const limit = Math.min(Math.max(Number(params.get("limit")) || 3, 1), 20);
  const totalPages = Math.max(Math.ceil(dishes.length / limit), 1);
  const page = Math.min(Math.max(Number(params.get("page")) || 1, 1), totalPages);
  return Response.json({
    items: dishes.slice((page - 1) * limit, page * limit),
    page,
    totalPages,
    total: dishes.length,
  });
}
