import dotenv from "dotenv";
dotenv.config();

import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

async function migrate() {
  // console.log("Checking if approval_status column exists...");

  const result = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'approval_status'
  `;

  if (result.length > 0) {
    // console.log("Column approval_status already exists, skipping.");
  } else {
    // console.log("Adding approval_status column...");
    await sql`
      ALTER TABLE users
      ADD COLUMN approval_status VARCHAR(20) NOT NULL DEFAULT 'approved'
    `;
    // console.log("Column added successfully.");
  }

  // Also check must_change_password
  const result2 = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'must_change_password'
  `;

  if (result2.length > 0) {
    // console.log("Column must_change_password already exists, skipping.");
  } else {
    // console.log("Adding must_change_password column...");
    await sql`
      ALTER TABLE users
      ADD COLUMN must_change_password BOOLEAN DEFAULT false
    `;
    // console.log("Column added successfully.");
  }

  // Add index
  await sql`
    CREATE INDEX IF NOT EXISTS idx_users_approval_status ON users (approval_status)
  `;
  // console.log("Index created.");

  // console.log("Migration complete!");
  await sql.end();
}

migrate()
  .then(() => process.exit(0))
  .catch((_err) => {
    // console.error("Migration failed:", err);
    process.exit(1);
  });
