import "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";

const db = drizzle({
	connection: {
		connectionString: process.env.DATABASE_URL!,
		ssl: false,
		user: process.env.DATABASE_USER!,
		password: process.env.DATABASE_PASSWORD!,
	},
});

export default db;
