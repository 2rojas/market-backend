import { env } from "@/config/env";
import { RedisClient } from "bun";

const client = new RedisClient(env.REDIS_URL);

export default client;
