import { execSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { beforeAll, describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import { mutateEvent } from "../lib/events/mutate-event";

type SupabaseStatus = {
  API_URL: string;
  ANON_KEY: string;
  SERVICE_ROLE_KEY: string;
};

const RUN_DB_INTEGRATION = process.env.RUN_DB_INTEGRATION === "1";

function run(command: string, retries = 0) {
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return execSync(command, {
        cwd: process.cwd(),
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      });
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        continue;
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

function getSupabaseStatus(): SupabaseStatus {
  const raw = run("npx supabase status --output json");
  const jsonStart = raw.indexOf("{");
  if (jsonStart < 0) {
    throw new Error(`Unable to parse supabase status output: ${raw}`);
  }

  const parsed = JSON.parse(raw.slice(jsonStart)) as SupabaseStatus;
  if (!parsed.API_URL || !parsed.ANON_KEY || !parsed.SERVICE_ROLE_KEY) {
    throw new Error("Supabase status output missing required keys.");
  }

  return parsed;
}

async function createUser({
  admin,
  emailPrefix,
}: {
  admin: SupabaseClient;
  emailPrefix: string;
}) {
  const email = `${emailPrefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}@example.com`;
  const password = "Password123!";
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error || !data.user) {
    throw new Error(`Failed to create user ${emailPrefix}: ${error?.message ?? "unknown error"}`);
  }

  return { id: data.user.id, email, password };
}

async function createUserClient({
  apiUrl,
  anonKey,
  email,
  password,
}: {
  apiUrl: string;
  anonKey: string;
  email: string;
  password: string;
}) {
  const client = createClient(apiUrl, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const signInResult = await client.auth.signInWithPassword({ email, password });
  if (signInResult.error) {
    throw new Error(`Failed to sign in integration user: ${signInResult.error.message}`);
  }

  return client;
}

const describeIf = RUN_DB_INTEGRATION ? describe : describe.skip;

describeIf("Milestone 6 conflict integration", () => {
  let status: SupabaseStatus;
  let admin: SupabaseClient;
  let ownerClient: SupabaseClient;
  let caregiverClient: SupabaseClient;
  let ownerId = "";
  let caregiverId = "";
  let babyId = "";

  beforeAll(async () => {
    run("npx supabase start", 1);
    try {
      run("npx supabase db reset", 2);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes("Error status 502")) {
        throw error;
      }
    }
    run("npx supabase start", 2);
    status = getSupabaseStatus();
    admin = createClient(status.API_URL, status.SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const owner = await createUser({
      admin,
      emailPrefix: "owner",
    });
    const caregiver = await createUser({
      admin,
      emailPrefix: "caregiver",
    });

    ownerId = owner.id;
    caregiverId = caregiver.id;
    ownerClient = await createUserClient({
      apiUrl: status.API_URL,
      anonKey: status.ANON_KEY,
      email: owner.email,
      password: owner.password,
    });
    caregiverClient = await createUserClient({
      apiUrl: status.API_URL,
      anonKey: status.ANON_KEY,
      email: caregiver.email,
      password: caregiver.password,
    });

    const babyResult = await admin
      .from("babies")
      .insert({
        owner_id: ownerId,
        name: "Integration Baby",
        date_of_birth: "2025-12-01",
        sex: "female",
        country_code: "US",
        timezone: "UTC",
      })
      .select("id")
      .single();

    if (babyResult.error || !babyResult.data) {
      throw new Error(`Failed to create baby: ${babyResult.error?.message ?? "unknown error"}`);
    }

    babyId = babyResult.data.id as string;

    const profileUpdates = await Promise.all([
      admin.from("profiles").update({ active_baby_id: babyId }).eq("id", ownerId),
      admin.from("profiles").update({ active_baby_id: babyId }).eq("id", caregiverId),
      admin.from("caregivers").insert({
        baby_id: babyId,
        user_id: caregiverId,
        email: `caregiver-${randomUUID()}@example.com`,
        role: "caregiver",
        invite_status: "accepted",
        invited_by: ownerId,
        accepted_at: new Date().toISOString(),
      }),
    ]);

    const profileError = profileUpdates.find((result) => result.error);
    if (profileError?.error) {
      throw new Error(`Failed to prepare profiles/caregiver: ${profileError.error.message}`);
    }
  }, 240_000);

  it("retains cross-user events and writes event_conflicts inside 5-minute window", async () => {
    const baseTime = new Date("2026-02-09T05:00:00.000Z");
    const ownerFeeding = await admin.from("feedings").insert({
      baby_id: babyId,
      logged_by: ownerId,
      client_uuid: randomUUID(),
      feeding_type: "bottle",
      amount_ml: 120,
      started_at: baseTime.toISOString(),
    });

    if (ownerFeeding.error) {
      throw new Error(ownerFeeding.error.message);
    }

    const caregiverFeeding = await admin.from("feedings").insert({
      baby_id: babyId,
      logged_by: caregiverId,
      client_uuid: randomUUID(),
      feeding_type: "bottle",
      amount_ml: 100,
      started_at: new Date(baseTime.getTime() + 4 * 60 * 1000).toISOString(),
    });

    if (caregiverFeeding.error) {
      throw new Error(caregiverFeeding.error.message);
    }

    const conflictsWithinWindow = await admin
      .from("event_conflicts")
      .select("id, status, event_table, event_1_logged_by, event_2_logged_by")
      .eq("baby_id", babyId)
      .eq("event_table", "feedings");

    expect(conflictsWithinWindow.error).toBeNull();
    expect(conflictsWithinWindow.data?.length).toBe(1);
    expect(conflictsWithinWindow.data?.[0]?.status).toBe("open");
    expect(
      new Set([
        conflictsWithinWindow.data?.[0]?.event_1_logged_by,
        conflictsWithinWindow.data?.[0]?.event_2_logged_by,
      ]),
    ).toEqual(new Set([ownerId, caregiverId]));

    const farFutureFeeding = await admin.from("feedings").insert({
      baby_id: babyId,
      logged_by: caregiverId,
      client_uuid: randomUUID(),
      feeding_type: "solid",
      started_at: new Date(baseTime.getTime() + 20 * 60 * 1000).toISOString(),
    });

    if (farFutureFeeding.error) {
      throw new Error(farFutureFeeding.error.message);
    }

    const conflictsAfterFarInsert = await admin
      .from("event_conflicts")
      .select("id")
      .eq("baby_id", babyId)
      .eq("event_table", "feedings");

    expect(conflictsAfterFarInsert.error).toBeNull();
    expect(conflictsAfterFarInsert.data?.length).toBe(1);
  });

  it("records stale mutations in mutation_conflicts and returns 409", async () => {
    const insertResult = await admin
      .from("feedings")
      .insert({
        baby_id: babyId,
        logged_by: ownerId,
        client_uuid: randomUUID(),
        feeding_type: "bottle",
        amount_ml: 90,
        started_at: "2026-02-09T06:00:00.000Z",
      })
      .select("id, updated_at")
      .single();

    if (insertResult.error || !insertResult.data) {
      throw new Error(insertResult.error?.message ?? "Failed to insert feeding");
    }

    const actualUpdatedAt = insertResult.data.updated_at as string;
    const staleExpected = new Date(new Date(actualUpdatedAt).getTime() - 1000).toISOString();

    const staleResult = await mutateEvent({
      supabase: admin,
      payload: {
        table: "feedings",
        id: insertResult.data.id as string,
        operation: "update",
        expectedUpdatedAt: staleExpected,
        patch: { amount_ml: 130 },
      },
      userId: caregiverId,
      activeBabyId: babyId,
    });

    expect(staleResult.status).toBe(409);
    expect(staleResult.body.conflict).toBe(true);

    const mutationConflicts = await admin
      .from("mutation_conflicts")
      .select("id, reported_by, event_id, status")
      .eq("baby_id", babyId)
      .eq("event_table", "feedings")
      .eq("event_id", insertResult.data.id)
      .order("created_at", { ascending: false });

    expect(mutationConflicts.error).toBeNull();
    expect(mutationConflicts.data?.length).toBeGreaterThanOrEqual(1);
    expect(mutationConflicts.data?.[0]?.reported_by).toBe(caregiverId);
    expect(mutationConflicts.data?.[0]?.status).toBe("open");
  });

  it("applies fresh owner mutation with expected updated_at", async () => {
    const insertResult = await admin
      .from("feedings")
      .insert({
        baby_id: babyId,
        logged_by: ownerId,
        client_uuid: randomUUID(),
        feeding_type: "bottle",
        amount_ml: 70,
        started_at: "2026-02-09T07:00:00.000Z",
      })
      .select("id, updated_at")
      .single();

    if (insertResult.error || !insertResult.data) {
      throw new Error(insertResult.error?.message ?? "Failed to insert feeding");
    }

    const updateResult = await mutateEvent({
      supabase: admin,
      payload: {
        table: "feedings",
        id: insertResult.data.id as string,
        operation: "update",
        expectedUpdatedAt: insertResult.data.updated_at as string,
        patch: { amount_ml: 110 },
      },
      userId: ownerId,
      activeBabyId: babyId,
    });

    expect(updateResult.status).toBe(200);
    expect(updateResult.body.ok).toBe(true);

    const verify = await admin
      .from("feedings")
      .select("amount_ml")
      .eq("id", insertResult.data.id)
      .single();

    expect(verify.error).toBeNull();
    expect(verify.data?.amount_ml).toBe(110);
  });

  it("enforces caregiver cannot delete owner events while owner can delete caregiver events", async () => {
    const ownerEvent = await ownerClient
      .from("feedings")
      .insert({
        baby_id: babyId,
        logged_by: ownerId,
        client_uuid: randomUUID(),
        feeding_type: "bottle",
        amount_ml: 80,
        started_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (ownerEvent.error || !ownerEvent.data) {
      throw new Error(ownerEvent.error?.message ?? "Unable to create owner event");
    }

    const caregiverDelete = await caregiverClient
      .from("feedings")
      .delete()
      .eq("id", ownerEvent.data.id);

    expect(caregiverDelete.error).toBeNull();

    const ownerEventAfterCaregiverDelete = await admin
      .from("feedings")
      .select("id")
      .eq("id", ownerEvent.data.id)
      .maybeSingle();

    expect(ownerEventAfterCaregiverDelete.error).toBeNull();
    expect(ownerEventAfterCaregiverDelete.data?.id).toBe(ownerEvent.data.id);

    const upgradeOwner = await admin.from("subscriptions").upsert(
      {
        user_id: ownerId,
        plan: "premium",
        status: "active",
      },
      { onConflict: "user_id", ignoreDuplicates: false },
    );
    expect(upgradeOwner.error).toBeNull();

    const caregiverEvent = await caregiverClient
      .from("feedings")
      .insert({
        baby_id: babyId,
        logged_by: caregiverId,
        client_uuid: randomUUID(),
        feeding_type: "bottle",
        amount_ml: 95,
        started_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (caregiverEvent.error || !caregiverEvent.data) {
      throw new Error(caregiverEvent.error?.message ?? "Unable to create caregiver event");
    }

    const ownerDelete = await ownerClient
      .from("feedings")
      .delete()
      .eq("id", caregiverEvent.data.id);

    expect(ownerDelete.error).toBeNull();
  });

  it("enforces caregiver read-only writes when owner is downgraded from premium", async () => {
    const setOwnerFree = await admin
      .from("subscriptions")
      .update({ plan: "free", status: "canceled" })
      .eq("user_id", ownerId);
    expect(setOwnerFree.error).toBeNull();

    const whileFreeClientUuid = randomUUID();
    const whileFree = await caregiverClient.from("feedings").insert({
      baby_id: babyId,
      logged_by: caregiverId,
      client_uuid: whileFreeClientUuid,
      feeding_type: "bottle",
      amount_ml: 95,
      started_at: new Date().toISOString(),
    });

    expect(whileFree.error).not.toBeNull();
    const freeInsertCheck = await admin
      .from("feedings")
      .select("id")
      .eq("baby_id", babyId)
      .eq("client_uuid", whileFreeClientUuid)
      .maybeSingle();
    expect(freeInsertCheck.error).toBeNull();
    expect(freeInsertCheck.data).toBeNull();

    const upgradeOwner = await admin.from("subscriptions").upsert(
      {
        user_id: ownerId,
        plan: "premium",
        status: "active",
      },
      { onConflict: "user_id", ignoreDuplicates: false },
    );
    expect(upgradeOwner.error).toBeNull();

    const whilePremium = await caregiverClient
      .from("feedings")
      .insert({
        baby_id: babyId,
        logged_by: caregiverId,
        client_uuid: randomUUID(),
        feeding_type: "bottle",
        amount_ml: 105,
        started_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    expect(whilePremium.error).toBeNull();
    expect(whilePremium.data?.id).toBeTruthy();

    const downgradeOwner = await admin
      .from("subscriptions")
      .update({ plan: "free", status: "canceled" })
      .eq("user_id", ownerId);
    expect(downgradeOwner.error).toBeNull();

    const caregiverUpdateAfterDowngrade = await caregiverClient
      .from("feedings")
      .update({ amount_ml: 130 })
      .eq("id", whilePremium.data!.id);

    expect(caregiverUpdateAfterDowngrade.error).toBeNull();

    const afterCaregiverDowngradeUpdate = await admin
      .from("feedings")
      .select("amount_ml")
      .eq("id", whilePremium.data!.id)
      .single();
    expect(afterCaregiverDowngradeUpdate.error).toBeNull();
    expect(afterCaregiverDowngradeUpdate.data?.amount_ml).toBe(105);

    const ownerUpdateAfterDowngrade = await ownerClient
      .from("feedings")
      .update({ amount_ml: 130 })
      .eq("id", whilePremium.data!.id);

    expect(ownerUpdateAfterDowngrade.error).toBeNull();
  });
});
