export const RANK_LABELS: Record<string, string> = {
  WARRIOR: "Warrior",
  ELITE: "Elite",
  MASTER: "Master",
  GRANDMASTER: "Grandmaster",
  EPIC: "Epic",
  LEGEND: "Legend",
  MYTHIC: "Mythic",
  MYTHIC_HONOR: "Mythic Honor",
  MYTHIC_GLORY: "Mythic Glory",
  MYTHICAL_IMMORTAL: "Mythical Immortal",
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "Menunggu Bayar",
  PAID: "Sudah Dibayar",
  IN_PROGRESS: "Dikerjakan",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
  FAILED: "Gagal",
};

export const ORDER_TYPE_LABELS: Record<string, string> = {
  PACKAGE: "Paket Rank",
  CUSTOM_STAR: "Custom per Bintang",
};

// Rank yang punya sistem bintang (Epic ke atas)
export const STAR_ELIGIBLE_RANKS = [
  "EPIC",
  "LEGEND",
  "MYTHIC",
  "MYTHIC_HONOR",
  "MYTHIC_GLORY",
  "MYTHICAL_IMMORTAL",
];

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "Menunggu",
  SETTLEMENT: "Lunas",
  EXPIRE: "Kedaluwarsa",
  CANCEL: "Dibatalkan",
  DENY: "Ditolak",
  REFUND: "Refund",
};
