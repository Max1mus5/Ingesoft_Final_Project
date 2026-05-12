/**
 * The system provides mock data for simulating API responses.
 * This module enables frontend development without backend dependency.
 */

import type { Disability, ExpirationAlert, User } from './types'

/**
 * The system provides mock users for authentication simulation.
 */
export const mockUsers: Array<User & { password: string }> = [
  {
    id: '1',
    email: 'admin@empresa.com',
    password: 'admin123',
    name: 'Administrador General',
    role: 'ADMIN',
    department: 'Sistemas',
  },
  {
    id: '2',
    email: 'rrhh@empresa.com',
    password: 'rrhh123',
    name: 'María García',
    role: 'GESTION_HUMANA',
    department: 'Recursos Humanos',
  },
  {
    id: '3',
    email: 'contabilidad@empresa.com',
    password: 'conta123',
    name: 'Carlos Pérez',
    role: 'CONTABILIDAD',
    department: 'Contabilidad',
  },
  {
    id: '4',
    email: 'colaborador@empresa.com',
    password: 'colab123',
    name: 'Ana López',
    role: 'COLABORADOR',
    department: 'Operaciones',
  },
]

/**
 * The system provides mock disabilities for table simulation.
 */
export const mockDisabilities: Disability[] = [
  {
    id: 'INC-001',
    employeeId: 'EMP-001',
    employeeName: 'Juan Martínez',
    employeeDocument: '1234567890',
    startDate: '2024-01-15',
    endDate: '2024-01-30',
    diagnosis: 'Fractura de muñeca',
    diagnosisCode: 'S52.5',
    eps: 'Sura EPS',
    totalDays: 15,
    status: 'RADICADA',
    createdAt: '2024-01-16',
    updatedAt: '2024-01-16',
    expirationDate: '2024-02-14',
    daysUntilExpiration: 25,
  },
  {
    id: 'INC-002',
    employeeId: 'EMP-002',
    employeeName: 'Laura Sánchez',
    employeeDocument: '0987654321',
    startDate: '2024-01-10',
    endDate: '2024-01-25',
    diagnosis: 'Lumbalgia aguda',
    diagnosisCode: 'M54.5',
    eps: 'Nueva EPS',
    totalDays: 15,
    status: 'EN_MORA',
    createdAt: '2024-01-11',
    updatedAt: '2024-01-20',
    expirationDate: '2024-01-25',
    daysUntilExpiration: 5,
  },
  {
    id: 'INC-003',
    employeeId: 'EMP-003',
    employeeName: 'Pedro Gómez',
    employeeDocument: '1122334455',
    startDate: '2024-01-05',
    endDate: '2024-01-12',
    diagnosis: 'Infección respiratoria',
    diagnosisCode: 'J06.9',
    eps: 'Sanitas EPS',
    totalDays: 7,
    status: 'PAGADA',
    createdAt: '2024-01-06',
    updatedAt: '2024-01-18',
    expirationDate: '2024-02-05',
    daysUntilExpiration: 45,
  },
  {
    id: 'INC-004',
    employeeId: 'EMP-004',
    employeeName: 'Carmen Rodríguez',
    employeeDocument: '5566778899',
    startDate: '2024-01-20',
    endDate: '2024-02-10',
    diagnosis: 'Cirugía de rodilla',
    diagnosisCode: 'M23.2',
    eps: 'Compensar EPS',
    totalDays: 21,
    status: 'APROBADA',
    createdAt: '2024-01-21',
    updatedAt: '2024-01-22',
    expirationDate: '2024-02-20',
    daysUntilExpiration: 18,
  },
  {
    id: 'INC-005',
    employeeId: 'EMP-005',
    employeeName: 'Roberto Díaz',
    employeeDocument: '9988776655',
    startDate: '2024-01-01',
    endDate: '2024-01-08',
    diagnosis: 'Gastroenteritis viral',
    diagnosisCode: 'A09',
    eps: 'Famisanar EPS',
    totalDays: 7,
    status: 'EN_MORA',
    createdAt: '2024-01-02',
    updatedAt: '2024-01-15',
    expirationDate: '2024-01-20',
    daysUntilExpiration: -10,
  },
  {
    id: 'INC-006',
    employeeId: 'EMP-006',
    employeeName: 'Sofía Torres',
    employeeDocument: '4433221100',
    startDate: '2024-01-18',
    endDate: '2024-01-28',
    diagnosis: 'Esguince de tobillo',
    diagnosisCode: 'S93.4',
    eps: 'Coomeva EPS',
    totalDays: 10,
    status: 'RADICADA',
    createdAt: '2024-01-19',
    updatedAt: '2024-01-19',
    expirationDate: '2024-02-28',
    daysUntilExpiration: 35,
  },
]

/**
 * The system generates alerts based on disabilities approaching expiration.
 */
export const mockAlerts: ExpirationAlert[] = mockDisabilities
  .filter((d) => d.daysUntilExpiration <= 30 && d.status !== 'PAGADA')
  .map((d) => ({
    id: `ALERT-${d.id}`,
    disabilityId: d.id,
    employeeName: d.employeeName,
    daysUntilExpiration: d.daysUntilExpiration,
    expirationDate: d.expirationDate,
    status: d.status,
    alertLevel:
      d.daysUntilExpiration <= 0
        ? 'EXPIRED'
        : d.daysUntilExpiration <= 7
        ? 'CRITICAL'
        : 'WARNING',
  }))
