import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

const PAGE_SIZE = 200;
const DEPENDENCY_TABLES = [
  { table: "admin_users", column: "user_id", mode: "count" },
  { table: "cart_items", column: "user_id", mode: "count" },
  { table: "orders", column: "user_id", mode: "count" },
  { table: "vouchers", column: "user_id", mode: "count" },
  { table: "game_plays", column: "user_id", mode: "count" },
  { table: "reviews", column: "user_id", mode: "count" },
  { table: "reports", column: "user_id", mode: "delete-first" },
  { table: "security_events", column: "user_id", mode: "delete-first" },
  { table: "order_status_events", column: "actor_user_id", mode: "delete-first" }
];

function loadEnvFile(fileName) {
  const filePath = path.join(process.cwd(), fileName);

  if (!fs.existsSync(filePath)) {
    return;
  }

  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    if (!key || process.env[key]) {
      continue;
    }

    let value = trimmed.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

function parseArgs(argv) {
  const args = new Set(argv.slice(2));
  return {
    execute: args.has("--execute"),
    json: args.has("--json")
  };
}

function parseEmailList(value) {
  return value
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function loadCleanupConfig() {
  const whitelistValue = process.env.PRIVACY_CLEANUP_WHITELIST ?? "";
  const adminEmail = (process.env.PRIVACY_CLEANUP_ADMIN_EMAIL ?? "").trim().toLowerCase();
  const whitelistEmails = parseEmailList(whitelistValue);

  if (!whitelistEmails.length) {
    throw new Error(
      "Missing PRIVACY_CLEANUP_WHITELIST. Set a comma-separated list of emails in your local env file before running this cleanup."
    );
  }

  if (!adminEmail) {
    throw new Error(
      "Missing PRIVACY_CLEANUP_ADMIN_EMAIL. Set the required admin email in your local env file before running this cleanup."
    );
  }

  if (!whitelistEmails.includes(adminEmail)) {
    throw new Error(
      "PRIVACY_CLEANUP_ADMIN_EMAIL must also be included in PRIVACY_CLEANUP_WHITELIST."
    );
  }

  return {
    whitelist: new Set(whitelistEmails),
    adminEmail,
    requiredWhitelistSize: whitelistEmails.length
  };
}

function print(value, json) {
  if (json) {
    console.log(JSON.stringify(value, null, 2));
    return;
  }

  console.log(value);
}

async function listAllAuthUsers(supabase) {
  const users = [];
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: PAGE_SIZE
    });

    if (error) {
      throw new Error(`Failed to list auth users on page ${page}: ${error.message}`);
    }

    const batch = data?.users ?? [];
    users.push(...batch);

    if (batch.length < PAGE_SIZE) {
      break;
    }

    page += 1;
  }

  return users;
}

async function countRowsForUser(supabase, table, column, userId) {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true })
    .eq(column, userId);

  if (error) {
    throw new Error(`Failed counting ${table}.${column} for user ${userId}: ${error.message}`);
  }

  return count ?? 0;
}

async function deleteRowsForUser(supabase, table, column, userId) {
  const { error } = await supabase.from(table).delete().eq(column, userId);

  if (error) {
    throw new Error(`Failed deleting ${table}.${column} for user ${userId}: ${error.message}`);
  }
}

async function getAdminUserIds(supabase) {
  const { data, error } = await supabase.from("admin_users").select("user_id");

  if (error) {
    throw new Error(`Failed reading admin_users: ${error.message}`);
  }

  return new Set((data ?? []).map((row) => row.user_id));
}

function buildUserSummary(user, adminUserIds, whitelist) {
  return {
    id: user.id,
    email: user.email ?? null,
    is_whitelisted: user.email ? whitelist.has(user.email.toLowerCase()) : false,
    is_admin: adminUserIds.has(user.id),
    created_at: user.created_at,
    last_sign_in_at: user.last_sign_in_at ?? null
  };
}

async function getDependencySummary(supabase, users) {
  const byUser = {};

  for (const user of users) {
    const counts = {};

    for (const dependency of DEPENDENCY_TABLES) {
      counts[`${dependency.table}.${dependency.column}`] = await countRowsForUser(
        supabase,
        dependency.table,
        dependency.column,
        user.id
      );
    }

    byUser[user.id] = counts;
  }

  return byUser;
}

function validateWhitelistUsers(users, adminUserIds, { whitelist, adminEmail, requiredWhitelistSize }) {
  const whitelistUsers = users.filter(
    (user) => user.email && whitelist.has(user.email.toLowerCase())
  );

  if (whitelistUsers.length !== requiredWhitelistSize) {
    throw new Error(
      `Expected ${requiredWhitelistSize} whitelisted auth users, found ${whitelistUsers.length}. Aborting.`
    );
  }

  const missingAdmin = whitelistUsers.find(
    (user) => user.email?.toLowerCase() === adminEmail && !adminUserIds.has(user.id)
  );
  if (missingAdmin) {
    throw new Error(`Whitelisted admin ${adminEmail} is missing from public.admin_users. Aborting.`);
  }

  const duplicateEmails = whitelistUsers
    .map((user) => user.email)
    .filter((email, index, all) => all.indexOf(email) !== index);

  if (duplicateEmails.length > 0) {
    throw new Error(`Duplicate whitelisted emails found: ${duplicateEmails.join(", ")}`);
  }
}

async function executeCleanup(supabase, usersToDelete) {
  const deleted = [];

  for (const user of usersToDelete) {
    for (const dependency of DEPENDENCY_TABLES.filter((item) => item.mode === "delete-first")) {
      await deleteRowsForUser(supabase, dependency.table, dependency.column, user.id);
    }

    const { error } = await supabase.auth.admin.deleteUser(user.id, false);
    if (error) {
      throw new Error(`Failed deleting auth user ${user.email ?? user.id}: ${error.message}`);
    }

    deleted.push({
      id: user.id,
      email: user.email ?? null
    });
  }

  return deleted;
}

async function main() {
  loadEnvFile(".env.local");
  loadEnvFile(".env");

  const { execute, json } = parseArgs(process.argv);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL.");
  }

  if (!serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. Set it in your shell or a local uncommitted env file before running this cleanup."
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  const cleanupConfig = loadCleanupConfig();

  const allUsers = await listAllAuthUsers(supabase);
  const adminUserIds = await getAdminUserIds(supabase);

  validateWhitelistUsers(allUsers, adminUserIds, cleanupConfig);

  const whitelistUsers = allUsers.filter(
    (user) => user.email && cleanupConfig.whitelist.has(user.email.toLowerCase())
  );
  const usersToDelete = allUsers.filter(
    (user) => !user.email || !cleanupConfig.whitelist.has(user.email.toLowerCase())
  );
  const dependencySummary = await getDependencySummary(supabase, usersToDelete);

  const dryRunSummary = {
    mode: execute ? "execute" : "dry-run",
    whitelist: [...cleanupConfig.whitelist],
    whitelist_users: whitelistUsers.map((user) =>
      buildUserSummary(user, adminUserIds, cleanupConfig.whitelist)
    ),
    delete_count: usersToDelete.length,
    delete_candidates: usersToDelete.map((user) => ({
      ...buildUserSummary(user, adminUserIds, cleanupConfig.whitelist),
      dependencies: dependencySummary[user.id]
    }))
  };

  if (!execute) {
    print(dryRunSummary, json);
    return;
  }

  const deleted = await executeCleanup(supabase, usersToDelete);
  const remainingUsers = await listAllAuthUsers(supabase);
  const remainingAdminUserIds = await getAdminUserIds(supabase);

  validateWhitelistUsers(remainingUsers, remainingAdminUserIds, cleanupConfig);

  const nonWhitelistedRemaining = remainingUsers.filter(
    (user) => !user.email || !cleanupConfig.whitelist.has(user.email.toLowerCase())
  );

  if (nonWhitelistedRemaining.length > 0) {
    throw new Error(
      `Cleanup finished with ${nonWhitelistedRemaining.length} non-whitelisted auth users still present.`
    );
  }

  const finalSummary = {
    ...dryRunSummary,
    deleted,
    remaining_users: remainingUsers.map((user) =>
      buildUserSummary(user, remainingAdminUserIds, cleanupConfig.whitelist)
    )
  };

  print(finalSummary, json);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
