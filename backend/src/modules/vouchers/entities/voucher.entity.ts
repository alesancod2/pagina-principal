import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Partner } from '../../partners/entities/partner.entity';

export enum PeriodControl {
  DIARIO = 'diario',
  SEMANAL = 'semanal',
  MENSAL = 'mensal',
  TRIMESTRAL = 'trimestral',
  ANUAL = 'anual',
  ILIMITADO = 'ilimitado',
}

@Entity('vouchers')
export class Voucher {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'partner_id', type: 'uuid' })
  partnerId: string;

  @Column({ length: 50 })
  code: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'usage_limit', type: 'integer', default: 1 })
  usageLimit: number;

  @Column({
    name: 'period_control',
    type: 'varchar',
    length: 20,
    default: PeriodControl.MENSAL,
  })
  periodControl: PeriodControl;

  @Column({ name: 'points_generated', type: 'integer', default: 0 })
  pointsGenerated: number;

  @Column({ name: 'discount_percent', type: 'decimal', precision: 5, scale: 2, nullable: true })
  discountPercent: number;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Partner, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'partner_id' })
  partner: Partner;
}
