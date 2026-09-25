declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    ADMIN_PASSWORD: string;
    ADMIN_CONFIG_ENCRYPTION_KEY: string;
    ANAM_API_KEY?: string;
    ANAM_AVATAR_ID?: string;
    ANAM_AGENT_ID?: string;
    ANAM_VOICE_ID?: string;
    ANAM_LLM_ID?: string;
    ANAM_BARISTA_NAME?: string;
    ANAM_INITIAL_MESSAGE?: string;
    PAYMENT_PROVIDER?: string;
    MOYASAR_SECRET_KEY?: string;
    NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY?: string;
    SELLER_NAME?: string;
    SELLER_VAT_NUMBER?: string;
    ZATCA_CSID?: string;
    ZATCA_PRIVATE_KEY?: string;
  }
}
