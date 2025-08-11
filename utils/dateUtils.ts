export function hitungPromotionDate(tmtPangkat: string | Date): Date {
  const tmtDate = new Date(tmtPangkat);
  const promotionDate = new Date(tmtDate);
  promotionDate.setFullYear(tmtDate.getFullYear() + 4);
  promotionDate.setHours(0, 0, 0, 0);
  return promotionDate;
}

export function hitungNotifStartDate(promotionDate: Date): Date {
  const notifDate = new Date(promotionDate);
  notifDate.setMonth(notifDate.getMonth() - 2);
  notifDate.setHours(0, 0, 0, 0);
  return notifDate;
}