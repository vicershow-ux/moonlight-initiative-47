import { toast } from "@/hooks/use-toast"

type Thanks = { sent: boolean; email: string; reason: string } | undefined

/** Уведомление о письме-благодарности после отметки оплаты */
export function notifyThanks(thanks: Thanks) {
  if (!thanks) return
  if (thanks.sent) {
    toast({ title: "Оплата отмечена", description: `Заказчику отправлено письмо с благодарностью на ${thanks.email}` })
    return
  }
  const reasons: Record<string, string> = {
    no_email: "У заказчика в объекте не указана почта — письмо с благодарностью не отправлено.",
    already_sent: "Письмо с благодарностью по этому счёту уже отправлялось ранее.",
    send_failed: "Не удалось отправить письмо с благодарностью — проверьте почту для отправки.",
  }
  toast({ title: "Оплата отмечена", description: reasons[thanks.reason] || "Письмо с благодарностью не отправлено." })
}
