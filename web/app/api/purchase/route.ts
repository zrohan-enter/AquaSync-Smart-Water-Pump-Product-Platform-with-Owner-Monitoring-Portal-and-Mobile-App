import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
function generateActivationCode() {
  return "AC-" + Math.random().toString(36).substring(2, 10).toUpperCase();
}
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, productName } = body;
    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          product_id: productId,
          order_status: "PAID",
          total_amount: 0,
        },
      ])
      .select()
      .single();
    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }
    const activationCode = generateActivationCode();
    return NextResponse.json({
      success: true,
      message: `Purchase successful for ${productName}`,
      orderId: order.id,
      activationCode,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error during purchase simulation" },
      { status: 500 }
    );
  }
}
