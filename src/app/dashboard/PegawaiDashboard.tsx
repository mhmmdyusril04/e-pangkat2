"use client";

import { api } from "@/../convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "convex/react";
import { Award, ChevronDown, ListChecks, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useMutation } from "convex/react";
import { useToast } from "@/components/ui/use-toast";

export function PegawaiDashboard() {
  const me = useQuery(api.users.getMe);
  const myHistory = useQuery(api.riwayat.getMyPromotionHistory);
  const semuaDokumen = useQuery(api.dokumen.getAll);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const formSchema = z.object({
    name: z.string().min(1, "Nama tidak boleh kosong"),
    nip: z.string().min(1, "NIP tidak boleh kosong"),
    pangkat: z.string().min(1, "Pangkat tidak boleh kosong"),
    golongan: z.string().min(1, "Golongan tidak boleh kosong"),
    tanggalLahir: z.string().min(1, "Tanggal lahir tidak boleh kosong"),
    tmtPangkat: z.string().min(1, "TMT Pangkat tidak boleh kosong"),
    pendidikan: z.enum(["SMA", "S1", "S2", "S3"]),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: me?.name || "",
      nip: me?.nip || "",
      pangkat: me?.pangkat || "",
      golongan: me?.golongan || "",
      tanggalLahir: me?.tanggalLahir || "",
      tmtPangkat: me?.tmtPangkat || "",
      pendidikan: me?.pendidikan || "S1",
    },
  });

  const updateDataSaya = useMutation(api.users.pegawaiUpdateData);
  const { toast } = useToast();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!me) {
      toast.error("Data profil tidak tersedia.");
      return;
    }
    try {
      await updateDataSaya({ tokenIdentifier: me.tokenIdentifier, ...values });
      toast.success("Berhasil", { description: "Data berhasil diperbarui." });
      setIsDialogOpen(false);
    } catch {
      toast.error("Gagal memperbarui data.");
    }
  }

  if (!me) {
    return <div>Memuat data profil...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Selamat Datang, {me.name}!</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User /> Profil Saya
          </CardTitle>
          <CardDescription>
            Informasi kepegawaian Anda yang terdaftar di sistem.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-semibold">NIP</p>
              <p>{me.nip}</p>
            </div>
            <div>
              <p className="font-semibold">Pangkat / Golongan</p>
              <p>
                {me.pangkat} ({me.golongan})
              </p>
            </div>
            <div>
              <p className="font-semibold">TMT Pangkat</p>
              <p>{me.tmtPangkat}</p>
            </div>
            <div>
              <p className="font-semibold">Pendidikan Terakhir</p>
              <p>{me.pendidikan}</p>
            </div>
            <div>
              <p className="font-semibold">Tanggal Lahir</p>
              <p>{me.tanggalLahir}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
        Lengkapi Data Saya
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award /> Status Kenaikan Pangkat
          </CardTitle>
          <CardDescription>
            Riwayat dan detail status proses kenaikan pangkat Anda.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {myHistory === undefined ? (
            <p>Memuat riwayat...</p>
          ) : myHistory.length === 0 ? (
            <p>Belum ada riwayat kenaikan pangkat yang tercatat untuk Anda.</p>
          ) : (
            myHistory.map((item) => {
              const totalDokumen = item.dokumenTerkumpul.length;
              const dokumenDisetujui = item.dokumenTerkumpul.filter(
                (d) => d.disetujui
              ).length;
              const progressValue =
                totalDokumen > 0 ? (dokumenDisetujui / totalDokumen) * 100 : 0;

              return (
                <Collapsible key={item._id} className="border rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4">
                    <div>
                      <p className="font-semibold">
                        Periode {item.periodeNotifikasi}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Pangkat Awal: {item.pangkatSaatNotifikasi} (
                        {item.golonganSaatNotifikasi})
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Progress value={progressValue} className="w-32 h-2" />
                        <span className="text-xs font-medium">
                          {dokumenDisetujui}/{totalDokumen} Dokumen
                        </span>
                      </div>
                    </div>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full sm:w-auto self-end sm:self-center"
                      >
                        Lihat Detail <ChevronDown className="h-4 w-4 ml-1" />
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent>
                    <div className="p-4 border-t bg-muted/50">
                      <h4 className="font-semibold mb-2">Checklist Dokumen:</h4>
                      <div className="space-y-2">
                        {item.dokumenTerkumpul.map((doc) => (
                          <div
                            key={doc.dokumenId}
                            className="flex items-center"
                          >
                            <Checkbox
                              id={doc.dokumenId}
                              checked={doc.disetujui}
                              disabled
                              className="mr-2"
                            />
                            <label htmlFor={doc.dokumenId} className="text-sm">
                              {doc.namaDokumen}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lengkapi Data Kepegawaian Anda</DialogTitle>
          </DialogHeader>
          <br/>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="nip"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NIP</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="pangkat"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pangkat</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="golongan"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Golongan</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="tanggalLahir"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Lahir</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="tmtPangkat"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>TMT Pangkat</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="pendidikan"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pendidikan</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="SMA">SMA</SelectItem>
                        <SelectItem value="S1">S1</SelectItem>
                        <SelectItem value="S2">S2</SelectItem>
                        <SelectItem value="S3">S3</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Simpan</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks /> Daftar Dokumen Persyaratan
          </CardTitle>
          <CardDescription>
            Daftar dokumen umum yang perlu disiapkan untuk kenaikan pangkat.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {myHistory === undefined || semuaDokumen === undefined ? (
            <p>Memuat informasi...</p>
          ) : myHistory.length > 0 ? (
            <ul className="list-disc pl-5 space-y-2 text-sm">
              {semuaDokumen.map((doc) => (
                <li key={doc._id}>{doc.namaDokumen}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-center text-muted-foreground p-4">
              Saat ini belum ada proses kenaikan pangkat yang aktif untuk Anda.
              <br />
              Sistem akan memberitahu Anda 2 bulan sebelum jadwal kenaikan
              pangkat berikutnya.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
