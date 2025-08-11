"use client";

import { api } from "@/../convex/_generated/api";
import { Doc } from "@/../convex/_generated/dataModel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction, useMutation, useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { columns, UserColumn } from "./column";
import CreateUserForm from "./CreateUserForm";
import { hitungPromotionDate } from "../../../../utils/dateUtils";

const formSchema = z.object({
  name: z.string().min(1, "Nama tidak boleh kosong"),
  nip: z.string().min(1, "NIP tidak boleh kosong"),
  pangkat: z.string().min(1, "Pangkat tidak boleh kosong"),
  naikPangkat: z.string().min(1, "Naik Pangkat tidak boleh kosong"),
  tmtPangkat: z.string().min(1, "TMT Pangkat tidak boleh kosong"),
  role: z.enum(["admin", "pegawai"]),
});

export default function UsersPage() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {isSignedIn ? (
        <UsersPageContent />
      ) : (
        <p>Silakan login untuk melanjutkan.</p>
      )}
    </div>
  );
}

function UsersPageContent() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Doc<"users"> | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<Doc<"users"> | null>(null);

  const data = useQuery(api.users.getPegawaiUsers);
  const updateUser = useMutation(api.users.adminUpdatePegawaiData);
  const deleteUser = useMutation(api.users.adminDeleteUser);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      nip: "",
      pangkat: "",
      naikPangkat: "",
      tmtPangkat: "",
      role: "pegawai",
    },
  });

  const openForm = (user?: Doc<"users">) => {
    if (user) {
      setEditingUser(user);
      form.reset(user);
    } else {
      setEditingUser(null);
      form.reset();
    }
    setDialogOpen(true);
  };

  const closeForm = () => {
    setDialogOpen(false);
    setEditingUser(null);
    form.reset();
  };

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (editingUser) {
        await updateUser({ userId: editingUser._id, ...values });
        toast({ title: "Sukses", description: "Data diperbarui." });
      }

      closeForm();
    } catch {
      toast({ title: "Gagal", description: "Terjadi kesalahan." });
    }
  }

  const confirmDelete = (user: Doc<"users">) => {
    setDeletingUser(user);
    setDeleteDialogOpen(true);
  };

  const deleteUserInClerk = useAction(api.clerkAction.deleteUserInClerk);

  const handleDelete = async () => {
    if (!deletingUser) return;
    try {
      // Hapus di Convex dan dapatkan clerkUserId
      const clerkUserId = await deleteUser({ userId: deletingUser._id });

      // Kalau ada ID Clerk, hapus juga di Clerk
      if (clerkUserId && clerkUserId.startsWith("user_")) {
        await deleteUserInClerk({ clerkUserId });
      }

      toast({ title: "Sukses", description: "Pengguna dihapus." });
    } catch (err) {
      console.error(err);
      toast({ title: "Gagal", description: "Tidak dapat menghapus." });
    } finally {
      setDeleteDialogOpen(false);
      setDeletingUser(null);
    }
  };

  const tableData: UserColumn[] =
    data?.map((u) => ({
      ...u,
      openEditDialog: openForm,
      openDeleteDialog: confirmDelete,
    })) || [];

  return (
    <>
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manajemen User</h1>
            <p className="text-sm text-muted-foreground">
              Kelola data kepegawaian pegawai dan admin.
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <button className="bg-blue-950 text-white px-4 py-2 rounded-sm hover:bg-blue-700">
                Tambah User
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Tambah User Baru</DialogTitle>
              </DialogHeader>
              <CreateUserForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-xl border bg-white shadow-sm">
        {data === undefined ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
            <p className="ml-2">Memuat data pengguna...</p>
          </div>
        ) : (
          <DataTable columns={columns} data={tableData} />
        )}
      </div>

      {/* Dialog Form */}
      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeForm()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Edit Data Pengguna" : "Tambah Pengguna Baru"}
            </DialogTitle>
            <DialogDescription>
              {editingUser
                ? `Perbarui data untuk ${editingUser.name}`
                : "Isi data untuk menambahkan pengguna."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              {Object.entries({
                name: "Nama",
                nip: "NIP",
                pangkat: "Pangkat & Gol",
              }).map(([name, label]) => (
                <FormField
                  key={name}
                  name={name as keyof typeof formSchema.shape}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{label}</FormLabel>
                      <FormControl>
                        <Input {...field} type="text" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}

              <FormField
                name="tmtPangkat"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>TMT Pangkat</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="date"
                        onChange={(e) => {
                          field.onChange(e); // tetap simpan nilai tmtPangkat
                          const tmt = e.target.value;
                          if (tmt) {
                            const promotionDate = hitungPromotionDate(tmt);
                            form.setValue(
                              "naikPangkat",
                              promotionDate.toISOString().slice(0, 10)
                            );
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="naikPangkat"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Naik Pangkat</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="role"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="pegawai">Pegawai</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Menyimpan..." : "Simpan"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pengguna</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus pengguna{" "}
              <strong>{deletingUser?.name}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
