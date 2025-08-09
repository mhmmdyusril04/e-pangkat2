import { api } from "@/../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "convex/react";
import { History, Users } from "lucide-react";
import Link from "next/link";

export function AdminDashboard() {
  const allUsers = useQuery(api.users.getPegawaiUsers);
  const allRiwayat = useQuery(api.riwayat.getRiwayat);

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Dashboard</h1>

      {/* Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <Card className="">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pegawai</CardTitle>
            <Users className="h-5 w-5 text-white/60" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {allUsers?.length ?? "..."}
            </div>
          </CardContent>
        </Card>

        <Card className="">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Notifikasi Terkirim
            </CardTitle>
            <History className="h-5 w-5 text-white/60" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {allRiwayat?.length ?? "..."}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Akses Cepat */}
      <div className="">
        <h2 className="text-lg font-semibold mb-4">Akses Cepat</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            asChild
            variant="outline"
            className="hover:bg-blue-950 hover:text-white font-semibold"
          >
            <Link href="/dashboard/users">Manajemen Pegawai</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="hover:bg-blue-950 hover:text-white font-semibold"
          >
            <Link href="/dashboard/persyaratan">Status Persyaratan</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="hover:bg-blue-950 hover:text-white font-semibold"
          >
            <Link href="/dashboard/riwayat">Riwayat Notifikasi</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
