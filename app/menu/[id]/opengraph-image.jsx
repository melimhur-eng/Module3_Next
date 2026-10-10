import { ImageResponse } from "next/og";
import { getDish, getDishes } from "@/lib/dishes";

// One 1200 × 630 preview card per dish, drawn on the server at build time.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "An Addis Eats dish card with its name and price";

export async function generateStaticParams() {
  const dishes = await getDishes();
  return dishes.map((d) => ({ id: d.id }));
}

export default async function Image({ params }) {
  const { id } = await params;
  const dish = await getDish(id);

  // ImageResponse understands flexbox and basic CSS only (no grid)
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #b5402a, #f0a85a)",
          color: "white",
        }}
      >
        <div style={{ fontSize: 40, opacity: 0.9 }}>Addis Eats</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 110, fontWeight: 700 }}>{dish.name}</div>
          {/* one string: a div with several text children would need display: flex */}
          <div style={{ fontSize: 44, marginTop: 12 }}>
            {`${dish.category} · ${dish.price} ETB${dish.spicy ? " · Spicy" : ""}`}
          </div>
        </div>
        <div style={{ fontSize: 32, opacity: 0.9 }}>Delivered across Addis Ababa</div>
      </div>
    ),
    size
  );
}
