import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin";
import { normalizeAdminProductPayload, validateAdminProduct } from "@/lib/admin-products";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Please log in." }, { status: 401 });
  }

  if (!(await isAdminUser(supabase, user.id))) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const values = normalizeAdminProductPayload(await request.json());
  const validationError = validateAdminProduct({ ...values, id });

  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const { error } = await supabase
    .from("products")
    .update({
      name: values.name,
      description: values.description,
      image_url: values.image_url,
      price: Number(values.price.toFixed(2)),
      stock: values.stock
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
