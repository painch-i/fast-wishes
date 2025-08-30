import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import aws4 from "npm:aws4";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Payload {
  query?: string;
  limit?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", {
      headers: corsHeaders,
      status: 405,
    });
  }

  try {
    const { query, limit } = (await req.json()) as Payload;
    if (!query) {
      return new Response(JSON.stringify({ error: "Missing query" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const accessKey = Deno.env.get("AMAZON_ACCESS_KEY");
    const secretKey = Deno.env.get("AMAZON_SECRET_KEY");
    const partnerTag = Deno.env.get("AMAZON_PARTNER_TAG");
    if (!accessKey || !secretKey || !partnerTag) {
      return new Response(
        JSON.stringify({ error: "Missing Amazon API credentials" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        },
      );
    }

    const body = JSON.stringify({
      Keywords: query,
      SearchIndex: "All",
      ItemCount: limit ?? 5,
      PartnerTag: partnerTag,
      PartnerType: "Associates",
      Resources: [
        "ItemInfo.Title",
        "Images.Primary.Medium",
        "Offers.Listings.Price",
      ],
    });

    const opts = {
      host: "webservices.amazon.com",
      path: "/paapi5/searchitems",
      service: "ProductAdvertisingAPI",
      region: "us-east-1",
      method: "POST",
      body,
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
    } as aws4.Request;

    aws4.sign(opts, { accessKeyId: accessKey, secretAccessKey: secretKey });

    const apiRes = await fetch(`https://${opts.host}${opts.path}`, opts);
    const data = await apiRes.json();

    const items =
      data.SearchResult?.Items?.map((item: any) => ({
        asin: item.ASIN,
        title: item.ItemInfo?.Title?.DisplayValue,
        image: item.Images?.Primary?.Medium?.URL,
        price: item.Offers?.Listings?.[0]?.Price?.Amount,
        url: item.DetailPageURL,
      })) ?? [];

    return new Response(JSON.stringify({ items }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});

