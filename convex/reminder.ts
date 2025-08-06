import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { internalAction, internalMutation } from "./_generated/server";
import { action } from "./_generated/server";

// Daftar Pangkat S1 yang menjadi batas akhir
export const createPromotionRecord = internalMutation({
  args: {
    userId: v.id("users"),
    periodeNotifikasi: v.string(),
    pangkatSaatNotifikasi: v.string(),
    initialChecklist: v.array(
      v.object({
        dokumenId: v.id("persyaratanDokumen"),
        namaDokumen: v.string(),
        disetujui: v.boolean(),
      })
    ),
  },
  async handler(ctx, args) {
    await ctx.db.insert("riwayatKenaikanPangkat", {
      userId: args.userId,
      periodeNotifikasi: args.periodeNotifikasi,
      pangkatSaatNotifikasi: args.pangkatSaatNotifikasi,
      tanggalNotifikasiDikirim: new Date().toISOString().slice(0, 10),
      dokumenTerkumpul: args.initialChecklist,
    });
    console.log(
      `Berhasil membuat catatan kenaikan pangkat untuk user: ${args.userId}`
    );
  },
});

export const checkAndSendPromotionReminders = internalAction({
  handler: async (ctx) => {
    console.log(`Memulai pengecekan kenaikan pangkat.`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const allPegawai = await ctx.runQuery(
      internal.users.getPegawaiUsersInternal
    );
    const semuaDokumen = await ctx.runQuery(api.dokumen.getAll);
    const initialChecklist = semuaDokumen.map((doc) => ({
      dokumenId: doc._id,
      namaDokumen: doc.namaDokumen,
      disetujui: false,
    }));

    for (const pegawai of allPegawai) {
      if (!pegawai.tmtPangkat) {
        continue;
      }

      const tmtDate = new Date(pegawai.tmtPangkat);
      

      // --- LOGIKA UNTUK PRODUKSI (VERCEL) ---
      const promotionDate = new Date(tmtDate);
      promotionDate.setFullYear(tmtDate.getFullYear() + 4); // H+4 Tahun
      promotionDate.setHours(0, 0, 0, 0);

      const notifStartDate = new Date(promotionDate);
      notifStartDate.setMonth(notifStartDate.getMonth() - 2); // H-2 Bulan
      const periode = `${promotionDate.getFullYear()}`;

      // --- LOGIKA UNTUK DEVELOPMENT (LOKAL) ---
      // // eslint-disable-next-line prefer-const
      // promotionDate = new Date(tmtDate);
      // promotionDate.setDate(tmtDate.getDate() + 1); // H+1 Hari

      // // eslint-disable-next-line prefer-const
      // notifStartDate = tmtDate;

      // // eslint-disable-next-line prefer-const
      // periode = `DEV-${promotionDate.toISOString().slice(0, 10)}`;

      if (today >= notifStartDate && today <= promotionDate) {
        console.log(
          `Pegawai ${pegawai.name} memenuhi syarat tanggal untuk notifikasi.`
        );

        const existingRecord = await ctx.runQuery(
          internal.riwayat.getRiwayatForUserByPeriode,
          {
            userId: pegawai._id,
            periodeNotifikasi: periode,
          }
        );

        if (existingRecord.length === 0) {
          console.log(
            `MEMBUAT RECORD & MENGIRIM NOTIFIKASI PERTAMA untuk ${pegawai.name}...`
          );

          await ctx.runMutation(internal.reminder.createPromotionRecord, {
            userId: pegawai._id,
            periodeNotifikasi: periode,
            pangkatSaatNotifikasi: pegawai.pangkat ?? "",
            initialChecklist: initialChecklist,
          });

          await ctx.runAction(internal.push.sendPushNotification, {
            userId: pegawai._id,
            title: "Periode Kenaikan Pangkat Dimulai",
            body: `Halo ${pegawai.name}, persiapkan berkas kenaikan pangkat Anda mulai sekarang!`,
          });
        } else {
          if (today.getDay() === 1) {
            console.log(
              `Mengirim notifikasi MINGGUAN untuk ${pegawai.name}...`
            );
            await ctx.runAction(internal.push.sendPushNotification, {
              userId: pegawai._id,
              title: "🔔 Reminder Kenaikan Pangkat",
              body: `Jangan lupa, terus persiapkan berkas kenaikan pangkat Anda!`,
            });
          }
        }
      }
    }
    console.log("Pengecekan kenaikan pangkat selesai.");
  },
});

export const runManualReminder = action({
  handler: async (ctx) => {
    await ctx.runAction(internal.reminder.checkAndSendPromotionReminders, {});
    console.log("✅ Manual Reminder dijalankan!");
  },
});
