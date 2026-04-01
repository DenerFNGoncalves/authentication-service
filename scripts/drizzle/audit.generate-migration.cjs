const { execSync } = require('child_process');

function getUtcTimestamp() {
	const now = new Date();
	return now
		.toISOString() // 2026-02-18T18:45:30.123Z
		.replace(/[-:]/g, '') // 20260218T184530.123Z
		.replace(/\..+/, 'Z'); // remove milissegundos
}

const name = `db_auth_${getUtcTimestamp()}`;

console.log(`Generating migration: ${name}`);

execSync(
	`npx drizzle-kit generate --name ${name} --config ./scripts/drizzle/audit.drizzle-config.ts`,
	{
		stdio: 'inherit'
	}
);
