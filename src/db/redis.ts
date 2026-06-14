import { RedisClient } from "bun";
import { env } from "@/config/env";

const client = new RedisClient(env.REDIS_URL);

export default client;
