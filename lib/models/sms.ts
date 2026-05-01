
// At the moment, only phone_verification and password_reset have had their implementations completed.
// The others will be implemented in future iterations of this project.
type MessageType = "phone_verification" | "password_reset" | "alert_password_change" | "alert_mfa_change" |
                    "alert_account_status_change" | "alert_email_change";

export interface SmsCallbackRequest {
    phoneNumber: string,            // E.164 format
    messageType: MessageType,       // e.g. "phone_verification", "password_reset", etc.
    languageCode: string,           // ISO language code, ie, en, fr, de, ch, etc
    senderName: string | null,      // null if not configured
    body: string,                   // localized, assembled, ready to send
    bodyEn: string                  // always English, for implementors who translate themselves
}

export function fillTemplate (template: string, params: Record<string, string>): string {
    return Object.entries(params).reduce(
        (result, [key, value]) => result.replace(`{${key}}`, value),
        template
    );
};

export const PHONE_VERIFICATION_TRANSLATIONS: Record<string, string> = {
    "en": "Your verification code is {VERIFICATION_CODE}. It expires in 15 minutes. If you did not request this code, you can ignore this message.",
    "fr": "Votre code de vérification est {VERIFICATION_CODE}. Il expire dans 15 minutes. Si vous n'avez pas demandé ce code, vous pouvez ignorer ce message.",
    "de": "Ihr Bestätigungscode lautet {VERIFICATION_CODE}. Er läuft in 15 Minuten ab. Falls Sie diesen Code nicht angefordert haben, können Sie diese Nachricht ignorieren.",
    "it": "Il tuo codice di verifica è {VERIFICATION_CODE}. Scade tra 15 minuti. Se non hai richiesto questo codice, puoi ignorare questo messaggio.",
    "es": "Su código de verificación es {VERIFICATION_CODE}. Caduca en 15 minutos. Si no solicitó este código, puede ignorar este mensaje.",
    "zh":"您的驗證碼是 {VERIFICATION_CODE}，有效期限為 15 分鐘。如果您沒有申請過此驗證碼，則可以忽略此訊息。",
    "cs": "Váš ověřovací kód je {VERIFICATION_CODE}. Jeho platnost vyprší za 15 minut. Pokud jste si tento kód nevyžádali, můžete tuto zprávu ignorovat.",
    "da": "Din bekræftelseskode er {VERIFICATION_CODE}. Den udløber om 15 minutter. Hvis du ikke har anmodet om denne kode, kan du ignorere denne besked.",
    "hi": "आपका वेरिफिकेशन कोड {VERIFICATION_CODE} है। यह 15 मिनट में समाप्त हो जाएगा। अगर आपने इस कोड का अनुरोध नहीं किया है, तो आप इस संदेश को नज़रअंदाज़ कर सकते हैं।",
    "ja": "認証コードは {VERIFICATION_CODE} です。このコードは15分後に有効期限が切れます。このコードを請求していない場合は、このメッセージを無視してください。",
    "ko": "인증 코드는 {VERIFICATION_CODE}입니다. 이 코드는 15분 후에 만료됩니다. 만약 본인이 요청한 코드가 아니라면, 이 메시지를 무시하셔도 됩니다.",
    "nl": "Uw verificatiecode is {VERIFICATION_CODE}. Deze verloopt over 15 minuten. Als u deze code niet heeft aangevraagd, kunt u dit bericht negeren.",
    "no": "Bekreftelseskoden din er {VERIFICATION_CODE}. Den utløper om 15 minutter. Hvis du ikke ba om denne koden, kan du ignorere denne meldingen.",
    "pl": "Twój kod weryfikacyjny to {VERIFICATION_CODE}. Wygasa za 15 minut. Jeśli nie prosiłeś o ten kod, możesz zignorować tę wiadomość.",
    "pt": "O seu código de verificação é {VERIFICATION_CODE}. Expira em 15 minutos. Se não solicitou este código, pode ignorar esta mensagem.",
    "ru": "Ваш код подтверждения — {VERIFICATION_CODE}. Срок его действия истекает через 15 минут. Если вы не запрашивали этот код, вы можете проигнорировать это сообщение.",
    "sv": "Din verifieringskod är 123{VERIFICATION_CODE}4567. Den upphör att gälla om 15 minuter. Om du inte begärde koden kan du ignorera det här meddelandet.",
    "fi": "Vahvistuskoodisi on {VERIFICATION_CODE}. Se vanhenee 15 minuutin kuluttua. Jos et pyytänyt tätä koodia, voit jättää tämän viestin huomiotta.",
    "vi": "Mã xác minh của bạn là {VERIFICATION_CODE}. Mã này sẽ hết hạn sau 15 phút. Nếu bạn không yêu cầu mã này, bạn có thể bỏ qua tin nhắn này."
}