import { Type, Static } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import dotenv from 'dotenv';

dotenv.config();

const EnvSchema = Type.Object({
  NODE_ENV: Type.Union([Type.Literal('development'), Type.Literal('production'), Type.Literal('test')], { default: 'development' }),
  PORT: Type.Transform(Type.String({ default: '3000' }))
    .Decode((v: string): number => parseInt(v, 10))
    .Encode((v: number): string => String(v)),
  HOST: Type.String({ default: '0.0.0.0' }),
  DATABASE_URL: Type.String(),
  DIRECT_DATABASE_URL: Type.String(),
  PHAROS_RPC_URL: Type.String(),
  PHAROS_CHAIN_ID: Type.Transform(Type.String())
    .Decode((v: string): number => parseInt(v, 10))
    .Encode((v: number): string => String(v)),
  GEMINI_API_KEY: Type.Optional(Type.String()),
  QWEN_API_KEY: Type.Optional(Type.String()),
  PRIVY_APP_ID: Type.Optional(Type.String()),
  PRIVY_APP_SECRET: Type.Optional(Type.String()),
  MORALIS_API_KEY: Type.Optional(Type.String()),
  BIRDEYE_API_KEY: Type.Optional(Type.String()),
  TELEGRAM_BOT_TOKEN: Type.Optional(Type.String()),
  RESEND_API_KEY: Type.Optional(Type.String()),
  SENTRY_DSN: Type.Optional(Type.String()),
  
  // Twitter API
  TWITTER_ACCESS_TOKEN: Type.Optional(Type.String()),
  TWITTER_ACCESS_TOKEN_SECRET: Type.Optional(Type.String()),
  TWITTER_CONSUMER_KEY: Type.Optional(Type.String()),
  TWITTER_CONSUMER_SECRET: Type.Optional(Type.String()),
  TWITTER_BEARER_TOKEN: Type.Optional(Type.String()),
  TWITTER_CLIENT_ID: Type.Optional(Type.String()),
  TWITTER_CLIENT_SECRET: Type.Optional(Type.String())
});

type Env = Static<typeof EnvSchema>;

function validateEnv(): Env {
  const envObj = { ...process.env };
  
  if (!Value.Check(EnvSchema, envObj)) {
    const errors = [...Value.Errors(EnvSchema, envObj)];
    console.error('❌ Environment Variable Validation Failure:');
    errors.forEach(err => {
      console.error(`   Field: ${err.path} | Error: ${err.message} | Provided: "${err.value}"`);
    });
    process.exit(1);
  }
  
  return Value.Cast(EnvSchema, envObj);
}

export const env = validateEnv();