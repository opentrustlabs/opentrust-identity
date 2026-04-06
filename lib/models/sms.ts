
type MessageType = "phone_verification" | "password_reset" | "alert_password_change" | "alert_mfa_change" |
                    "alert_account_status_change" | "alert_recovery_email_change";

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

// ["zh", "cs", "da", "de", "en", "es", "fr", "hi", "it", "ja", "ko", "nl", "no", "pl", "pt", "ru", "sv", "fi", "vi"];
    // ["zh", "中國人"],
    // ["cs", "český"],
    // ["da", "Dansk"],
    // ["de", "Deutsch"],
    // ["en", "English"],
    // ["es", "Español"],
    // ["fr", "Français"],
    // ["hi", "हिंदी"],
    // ["it", "Italiano"],
    // ["ja", "日本語"],
    // ["ko", "한국인"],
    // ["pt", "Português"], 
    // ["nl", "Nederlands"],
    // ["no", "Norsk"],
    // ["pl", "Polski"],
    // ["ru", "Русский"],
    // ["sv", "Svenska"],
    // ["fi", "Suomi"],    
    // ["vi", "Tiếng Việt"]
export const PHONE_VERIFICATION_TRANSLATIONS = {
    "en": "Your verification code is {VERIFICATION_CODE}. It expires in 15 minutes. If you did not request this code, you can ignore this message.",
    "fr": "Votre code de vérification est 1234567. Il expire dans 15 minutes. Si vous n'avez pas demandé ce code, vous pouvez ignorer ce message.",
    "de": "Ihr Bestätigungscode lautet 1234567. Er läuft in 15 Minuten ab. Falls Sie diesen Code nicht angefordert haben, können Sie diese Nachricht ignorieren.",
    "it": "Il tuo codice di verifica è 1234567. Scade tra 15 minuti. Se non hai richiesto questo codice, puoi ignorare questo messaggio.",
    "es": "Su código de verificación es 1234567. Caduca en 15 minutos. Si no solicitó este código, puede ignorar este mensaje.",
    "zh":"您的驗證碼是 {VERIFICATION_CODE}，有效期限為 15 分鐘。如果您沒有申請過此驗證碼，則可以忽略此訊息。",
    "cs": "Váš ověřovací kód je 1234567. Jeho platnost vyprší za 15 minut. Pokud jste si tento kód nevyžádali, můžete tuto zprávu ignorovat.",
    "da": "Din bekræftelseskode er 1234567. Den udløber om 15 minutter. Hvis du ikke har anmodet om denne kode, kan du ignorere denne besked.",
    "hi": "आपका वेरिफिकेशन कोड 1234567 है। यह 15 मिनट में समाप्त हो जाएगा। अगर आपने इस कोड का अनुरोध नहीं किया है, तो आप इस संदेश को नज़रअंदाज़ कर सकते हैं।",
    "ja": "認証コードは 1234567 です。このコードは15分後に有効期限が切れます。このコードを請求していない場合は、このメッセージを無視してください。",
    "ko": "인증 코드는 1234567입니다. 이 코드는 15분 후에 만료됩니다. 만약 본인이 요청한 코드가 아니라면, 이 메시지를 무시하셔도 됩니다.",
    "nl": "Uw verificatiecode is 1234567. Deze verloopt over 15 minuten. Als u deze code niet heeft aangevraagd, kunt u dit bericht negeren.",
    "no": "Bekreftelseskoden din er 1234567. Den utløper om 15 minutter. Hvis du ikke ba om denne koden, kan du ignorere denne meldingen.",
    "pl": "Twój kod weryfikacyjny to 1234567. Wygasa za 15 minut. Jeśli nie prosiłeś o ten kod, możesz zignorować tę wiadomość.",
    "pt": "O seu código de verificação é 1234567. Expira em 15 minutos. Se não solicitou este código, pode ignorar esta mensagem.",
    "ru": "Ваш код подтверждения — 1234567. Срок его действия истекает через 15 минут. Если вы не запрашивали этот код, вы можете проигнорировать это сообщение.",
    "sv": "Din verifieringskod är 1234567. Den upphör att gälla om 15 minuter. Om du inte begärde koden kan du ignorera det här meddelandet.",
    "fi": "Vahvistuskoodisi on 1234567. Se vanhenee 15 minuutin kuluttua. Jos et pyytänyt tätä koodia, voit jättää tämän viestin huomiotta.",
    "vi": "Mã xác minh của bạn là 1234567. Mã này sẽ hết hạn sau 15 phút. Nếu bạn không yêu cầu mã này, bạn có thể bỏ qua tin nhắn này."
}