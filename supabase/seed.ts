import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
  console.log("Seeding professionals...");

  const professionals = [
    { name: "Chinedu Okonkwo", specialism: "lawyer", email: "chinedu@example.com", active: true },
    { name: "Amina Bello", specialism: "surveyor", email: "amina@example.com", active: true },
    { name: "Emeka Nwosu", specialism: "QS", email: "emeka@example.com", active: true },
    { name: "Ngozi Ibrahim", specialism: "inspector", email: "ngozi@example.com", active: true },
  ];

  const { data: profs, error: profError } = await supabase
    .from("professionals")
    .insert(professionals)
    .select();

  if (profError) {
    console.error("Error seeding professionals:", profError);
    return;
  }

  console.log("Seeded", profs?.length, "professionals");

  console.log("Seeding a sample client and case...");

  const { data: client } = await supabase
    .from("clients")
    .insert({
      name: "Oluwaseun Adeyemi",
      email: "seun@example.com",
      whatsapp: "+447000000001",
      location: "London, UK",
    })
    .select()
    .single();

  if (!client) {
    console.error("Failed to create sample client");
    return;
  }

  const { data: sampleCase } = await supabase
    .from("cases")
    .insert({
      case_ref: "PS-2026-0001",
      client_id: client.id,
      service_type: "validity_check",
      property_location: "Gwarinpa, Abuja",
      property_type: "land",
      status: "checks_in_progress",
      payment_status: "paid",
      payment_amount: 250000,
      deadline: "2026-07-15",
      intake_notes: "Client based in London is purchasing a plot in Gwarinpa from a private seller. Has C of O but no survey plan. Seller is asking for payment within the week.",
      client_concern: "Worried about the legitimacy of the seller and whether the C of O is authentic.",
      internal_notes: "Priority case. Seller applying pressure.",
    })
    .select()
    .single();

  if (!sampleCase) {
    console.error("Failed to create sample case");
    return;
  }

  const defaultChecks = [
    "legal_review",
    "agis_search",
    "court_search",
    "coo_verification",
    "survey_check",
    "seller_authority",
  ];

  const checksToInsert = defaultChecks.map((type, i) => ({
    case_id: sampleCase.id,
    check_type: type,
    status: i < 2 ? "in_progress" : "not_started",
    assigned_to: i < 2 ? profs?.[0].id : null,
    due_date: "2026-06-20",
  }));

  await supabase.from("checks").insert(checksToInsert);

  await supabase.from("status_updates").insert({
    case_id: sampleCase.id,
    new_status: "enquiry_received",
    triggered_by: "system",
    notes: "Case created from seed data",
  });

  console.log("Seed complete!");
}

seed();
