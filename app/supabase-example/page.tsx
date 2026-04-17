import { supabase } from "@/lib/supabaseClient";

type Product = {
  id: string;
  name: string;
  price: number;
};

export default async function SupabaseExamplePage() {
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, price")
    .order("name");

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <h1 className="text-2xl font-bold">Supabase Products</h1>

      {error ? (
        <p className="text-red-400">{error.message}</p>
      ) : (
        <ul className="space-y-3">
          {(products ?? []).map((product: Product) => (
            <li key={product.id} className="border border-white/10 bg-white/5 p-4">
              <p className="font-semibold">{product.name}</p>
              <p>PHP {Number(product.price).toFixed(2)}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
