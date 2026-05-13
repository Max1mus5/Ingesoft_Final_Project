'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface Usuario {
  id: string;
  documento: string;
  nombre_completo: string;
  email: string;
  rol: string;
  activo: boolean;
  fecha_creacion: string | null;
}

export default function AdminUsuariosPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar que el usuario es admin
  useEffect(() => {
    if (user && user.rol !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Obtener lista de usuarios
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/usuarios', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 403) {
            setError('No tienes permisos para ver esta lista. Solo administradores pueden acceder.');
            router.push('/dashboard');
            return;
          }
          throw new Error(`Error ${response.status}`);
        }

        const data = await response.json();
        setUsuarios(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al cargar usuarios';
        setError(message);
        console.error('Error fetching usuarios:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.rol === 'ADMIN') {
      fetchUsuarios();
    }
  }, [user, router]);

  const getRolBadgeColor = (rol: string) => {
    switch (rol) {
      case 'ADMIN':
        return 'bg-red-500';
      case 'GESTION_HUMANA':
        return 'bg-blue-500';
      case 'CONTABILIDAD':
        return 'bg-green-500';
      case 'COLABORADOR':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  };

  const formatRol = (rol: string) => {
    return rol.replace(/_/g, ' ');
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user || user.rol !== 'ADMIN') {
    return null; // O un componente de acceso denegado
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Colaboradores del Sistema</h1>
            <p className="text-gray-600 mt-1">
              Listado completo de usuarios registrados en el sistema
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
          >
            Volver al Dashboard
          </Button>
        </div>

        {/* Content Card */}
        <Card>
          <CardHeader>
            <CardTitle>
              {loading ? 'Cargando...' : `Total: ${usuarios.length} colaboradores`}
            </CardTitle>
            <CardDescription>
              Información detallada de todos los usuarios del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : usuarios.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No hay usuarios registrados en el sistema.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100">
                      <TableHead className="font-semibold">Documento</TableHead>
                      <TableHead className="font-semibold">Nombre Completo</TableHead>
                      <TableHead className="font-semibold">Email</TableHead>
                      <TableHead className="font-semibold">Rol</TableHead>
                      <TableHead className="font-semibold">Estado</TableHead>
                      <TableHead className="font-semibold">Fecha de Creación</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usuarios.map((usuario) => (
                      <TableRow key={usuario.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{usuario.documento}</TableCell>
                        <TableCell>{usuario.nombre_completo}</TableCell>
                        <TableCell className="text-gray-600">{usuario.email}</TableCell>
                        <TableCell>
                          <Badge className={`${getRolBadgeColor(usuario.rol)} text-white`}>
                            {formatRol(usuario.rol)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={usuario.activo ? 'default' : 'secondary'}>
                            {usuario.activo ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatDate(usuario.fecha_creacion)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
